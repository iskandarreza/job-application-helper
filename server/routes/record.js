const express = require('express')
const axios = require("axios")
const recordRoutes = express.Router()
const dbo = require('../db/conn')
const fetchPagesData = require('../tasks/fetchPagesData')
const meta = require('../meta')
const { json } = require('express')
const ObjectId = require('mongodb').ObjectId

const collection = 'email-link-data'
const linkContentData = 'link-content-data'

recordRoutes.post('/records/:collection/', async (req, res) => {
  console.log(
    `endpoint ${req.path} ${req.method} from ${req.headers.origin}, : ` ,
    {body: req.body, query: req.query}
  )
  const dbCollection = req.params.collection
  const { body, query } = req
  const field = query.field || 'dateModified'
  const sort =  query.sort_order === 'asc' ? 1 : query.sort_order === 'dec' ? -1 : 1
  const idOnly = query.id_only == 'true' ? true : false
  const newRecords = query.new === 'true' ? true : false
  const queryObj = body

  const queryOpts = idOnly ? {
    projection: {
      org: 0,
      role: 0,
      location: 0,
      positionStatus: 0,
      status1: 0,
      status2: 0,
      status3: 0,
      notes: 0,
      dateAdded: 0,
      dateModified: 0,
      crawlDate: 0,
      fieldsModified: 0
    }
  } : {}

  if (newRecords) {
    
    const recordIds = await axios.post('http://localhost:5000/records/email-link-data?id_only=true')
      .then((response) => { return response.data })
    
    const newData = await axios.get('http://localhost:5000/data')
      .then((response) => { return response.data })

    const filteredObjects = await newData.filter((newRecord) => {
      return !recordIds.some((record) => record.id.toString() === newRecord.id.toString())
    })

    const filteredResults = await filteredObjects.filter((obj) => {
      return !recordIds.some((record) => { record.url === obj.url })
    })

    res.json(filteredResults)

  } else {
    let db_connect = dbo.getDb()
    let response
    let docs = db_connect
      .collection(dbCollection)
      .find(queryObj, queryOpts)
  
    if (field && sort) {
      console.log({field, sort})
      response = docs.sort({ [field]: sort })
    }
  
    response
      .toArray()
      .then((data) => {
        res.json(data)
      })
      .catch((e) => console.log(e))
  
  }

  
})

recordRoutes.get('/maintenance/populate-collection', async (req, res) => {
  let db_connect = dbo.getDb()
  try {
    const result = await db_connect.collection(collection).aggregate([
      {
        $project: {
          _id: 0,
          id: '$id',
          extraData: { $objectToArray: '$extraData' }
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              { id: '$id' },
              { $arrayToObject: '$extraData' }
            ]
          }
        }
      },
      { $out: linkContentData }]).toArray()

    res.send(`Successfully populated ${result.length} documents to ${linkContentData} collection.`)
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})

recordRoutes.get('/maintenance/get-duplicates/:collection/:deleteRecords', async (req, res) => {
  const workingCollection = req.params.collection

  const deleteRecords = req.params.deleteRecords ? true : false

  let db_connect = dbo.getDb()
  let results = []

  let aggregateQuery =
    [
      {
        $sort: {
          dateModified: 1
        }
      },
      {
        $group: {
          _id: {
            id: "$id"
          },
          count: {
            $sum: 1
          },
          duplicates: {
            $push: "$_id"
          },
          latest: {
            $last: "$_id"
          }
        }
      },
      {
        $match: {
          count: {
            $gt: 1
          }
        }
      },
      {
        $project: {
          _id: 0,
          duplicates: {
            $slice: ["$duplicates", 0, {
              $subtract: [{
                $size: "$duplicates"
              }, 1]
            }]
          }
        }
      }
    ]

  await db_connect
    .collection(workingCollection)
    .aggregate(aggregateQuery)
    .toArray()
    .then((data) => {
      data.forEach(doc => {
        results.push(...doc.duplicates)
      })
    })
    .catch((e) => console.log(e))

  let records = await db_connect
    .collection(workingCollection)
    .find({ _id: { $in: results } })
    .toArray()
    .catch((e) => console.log(e))

  if (deleteRecords) {
    let docs = meta(records)
    console.log('records to be deleted', docs)

    docs.forEach((doc) => {
      let myquery = { _id: new ObjectId(doc._id) }

      db_connect
        .collection(workingCollection)
        .deleteOne(myquery)
        .then((data) => {
          console.log({...data, ...doc })
        })
    })
  }

  console.log(`${records.length} duplicate records found`, meta(records))

  res.json(meta(records))


})

recordRoutes.get('/maintenance/fix-records', async (req, res) => {
  const workingCollection = linkContentData

  let query = { id: { $type: ["double", "int", "long", "decimal"] , $ne: null } }
  let db_connect = dbo.getDb()

  let results = []

  await db_connect
    .collection(workingCollection)
    .find(query)
    .toArray()
    .then((data) => {
      console.log(`${data.length} records matching query: ${JSON.stringify(query)}`)
      results.push(...data)

    })
    .catch((e) => console.log(e))

  res.json(meta(results))

  results.forEach(async (doc) => {
    let myquery = { _id: new ObjectId(doc._id) }
    let newvalues = {}

    newvalues.$set = { id: doc.id.toString() }

    try {
      db_connect
        .collection(workingCollection)
        .updateOne(myquery, newvalues)
        .then((data) => {
          console.log({ ...data, newvalues })
        })
        .catch((e) => console.log(e))
    } catch (error) {
      console.log('error @/record/:id PUT:', { error, body: req.body })
    }

  })


})

recordRoutes.route('/maintenance/find-missing').get(async (req, res) => {
  const linkData = linkContentData
  const metaData = collection
  let db_connect = dbo.getDb()

  let results = []

  await db_connect
    .collection(linkData)
    .find()
    .toArray()
    .then((data) => {

      results.push(...data.map((doc) => doc.id.toString()))

    })
    .catch((e) => console.log(e))


  let records = await db_connect
    .collection(metaData)
    .find({ id: { $not: { $in: results } } })
    .toArray()
    .catch((e) => console.log(e))


  let mapped = [...meta(records)].map((x) => {
    delete x.crawlDate
    delete x.dateModified
    return x
  })

  console.log(`${records.length} missing records found`, mapped)
  console.log(fetchPagesData(mapped, null))

  res.send(JSON.stringify(mapped, null, 4))

})

recordRoutes.route('/maintenance/clone/:source/:target').get(async function (req, res) {
  const db = dbo.getDb()
  console.log({...req.params})
  const { source, target } = req.params
  const report = []

  try {
    // Delete all documents in the target collection
    const deleteResult = await db.collection(target).deleteMany({})
    report.push(`Deleted ${deleteResult.deletedCount} documents from ${target}`)

    // Find all documents in the source collection
    const docs = await db.collection(source).find().toArray()

    // Insert all documents into the target collection
    const result = await db.collection(target).insertMany(docs)

    report.push(`Inserted ${result.insertedCount} documents into ${target}`)

    report.push(`${source} cloned into ${target} successfully`)

    res.send(report)

  } catch (err) {
    console.error(err)
    res.status(500).send(`Failed to clone ${source}`)
  }
})

recordRoutes.route('/record').get(async function (req, res) {
  console.log(
    `endpoint ${req.path} ${req.method} from ${req.headers.origin}, req.query: `,
    req.query
  )

  let db_connect = dbo.getDb()

  let query = {}
  let options = {}

  if (req.query.filter === 'none') {
    // no filtering needed
    query = {}

  } else if (req.query.filter === 'applied') {
    query = {
      positionStatus: 'open',
      $or: [
        { status1: 'applied' },
        { status1: 'uncertain' }
      ],
    }

  } else if (req.query.filter === 'unapplied') {
    query = {
      positionStatus: 'open',
      $and: [
        { status1: { $ne: 'applied' } },
        { status1: { $ne: 'uncertain' } }
      ],
    }
  }

  if (req.query.id_only === 'true') {
    options = {
      projection: {
        org: 0,
        role: 0,
        location: 0,
        positionStatus: 0,
        status1: 0,
        status2: 0,
        status3: 0,
        notes: 0,
        dateAdded: 0,
        dateModified: 0,
        crawlDate: 0,
        fieldsModified: 0
      }
    }
  }

  db_connect
    .collection(collection)
    .find(query, options)
    .toArray()
    .then((data) => {
      res.json(data)
    })
    .catch((e) => console.log(e))
})

recordRoutes.route('/record/new').post(function (req, res) {
  console.log(
    `endpoint ${req.path} ${req.method} from ${req.headers.origin}, req.body: `,
    req.body
  )

  const now = new Date()
  let db_connect = dbo.getDb()
  let record = req.body

  record.dateAdded = now
  record.dateModified = now

  try {
    db_connect
      .collection(collection)
      .insertOne(record)
      .then((data) => {
        res.json(data)
      })
      .catch((e) => console.log(e))
  } catch (error) {
    console.log('error @/record/new POST:', { error, body: record })
  }
})

recordRoutes.route('/record/:id').get(async function (req, res) {
  console.log(
    `endpoint ${req.path} ${req.method} from ${req.headers.origin}, req.query: `,
    req.query
  )

  let db_connect = dbo.getDb()
  let myquery = { _id: new ObjectId(req.params.id) }

  db_connect
    .collection(collection)
    .findOne(myquery)
    .then((data) => {
      res.json(data)
    })
    .catch((e) => console.log(e))
})

recordRoutes.route('/record/:id').put(function (req, res) {
  console.log(
    `endpoint ${req.path} ${req.method} from ${req.headers.origin}, req.body: `,
    req.body
  )

  let db_connect = dbo.getDb()
  let myquery = { _id: new ObjectId(req.params.id) }

  let updateFields = {}
  let fieldsModified = []

  Object.keys(req.body).forEach((key) => {
    if (['positionStatus', 'status1', 'status2', 'status3', 'notes'].includes(key)) {
      fieldsModified.push({ field: key, value: req.body[key], dateModified: new Date() })
    }
    if (key !== '_id' && key !== 'dateModified' && key !== 'fieldsModified') {
      updateFields[key] = req.body[key]
    }
  })

  let newvalues = {}
  if (Object.keys(updateFields).length > 0) {
    newvalues.$set = updateFields
    newvalues.$set.dateModified = new Date().toISOString()
  }
  if (fieldsModified.length > 0) {
    newvalues.$push = { fieldsModified: { $each: fieldsModified } }
  }

  try {
    db_connect
      .collection(collection)
      .findOne(myquery)
      .then((doc) => {
        if (doc) {
          db_connect
            .collection(collection)
            .updateOne(myquery, newvalues)
            .then((data) => {
              console.log({...data, newvalues})
              data.query = myquery
              data.updateValue = newvalues
              res.json(data)
            })
            .catch((e) => console.log(e))
        } else {
          res.status(404).json({ message: 'Record not found.' })
        }
      })
      .catch((e) => console.log(e))
  } catch (error) {
    console.log('error @/record/:id PUT:', { error, body: req.body })
  }
})

recordRoutes.route('/record/:id').delete((req, res) => {
  console.log(
    `endpoint ${req.path} ${req.method} from ${req.headers.origin}, req.body: `,
    req.body
  )

  let db_connect = dbo.getDb()
  let myquery = { _id: new ObjectId(req.params.id) }
  db_connect
    .collection(collection)
    .deleteOne(myquery)
    .then((data) => {
      res.json(data)
    })
    .catch((e) => console.log(e))
})

recordRoutes.route('/record/:id/linkdata').get(async function (req, res) {
  console.log(
    `endpoint ${req.path} ${req.method} from ${req.headers.origin}, req.body: `,
    req.body
  )

  let db_connect = dbo.getDb()
  let myquery = { id: { $eq: req.params.id } }

  db_connect
    .collection(linkContentData)
    .findOne(myquery)
    .then((data) => {
      res.json(data)
    })
    .catch((e) => console.log(e))
})

recordRoutes.route('/record/:id/linkdata').post(async function (req, res) {
  console.log(
    `endpoint ${req.path} ${req.method} from ${req.headers.origin}, req.body: `,
    req.body
  )

  let db_connect = dbo.getDb()
  let myquery = { id: { $eq: req.params.id } }
  let id = req.params.id
  if (isNaN(id)) {
    myquery = { id: { $eq: String(req.params.id) } }
  } else {
    myquery = { id: parseInt(id) }
  }

  let record = req.body

  let updateFields = {}

  Object.keys(record).forEach((key) => {
    if (key !== '_id' && key !== 'id') {
      updateFields[key] = record[key]
    }
  })

  let newvalues = {};
  if (Object.keys(updateFields).length > 0) {
    newvalues.$set = updateFields
    newvalues.$set.dateModified = new Date().toISOString()
  }

  db_connect
    .collection(linkContentData)
    .findOne(myquery)
    .then((doc) => {
      if (doc) {
        db_connect
          .collection(linkContentData)
          .updateOne(myquery, newvalues)
          .then((data) => {
            data.query = myquery
            data.updateValue = newvalues
            res.json(data)
          })
          .catch((e) => console.log(e))
      } else {
        db_connect
          .collection(linkContentData)
          .insertOne(record)
          .then((data) => {
            res.json(data)
          })
          .catch((e) => console.log(e))
      }
    })
    .catch((e) => console.log(e))
})

recordRoutes.route('/record/:id/summary').post(async function (req, res) {
  console.log(
    `endpoint ${req.path} ${req.method} from ${req.headers.origin}, req.body: `,
    req.body
  )

  let db_connect = dbo.getDb()
  let myquery = { id: { $eq: req.params.id } }

  let record = req.body

  let updateFields = {}

  Object.keys(record).forEach((key) => {
    if (key !== '_id' && key !== 'id') {
      updateFields[key] = record[key]
    }
  })

  let newvalues = {};
  if (Object.keys(updateFields).length > 0) {
    newvalues.$set = updateFields
    newvalues.$set.dateModified = new Date().toISOString()
  }

  const chatgptSummary = 'chatgpt-summary-responses'
  db_connect
    .collection(chatgptSummary)
    .findOne(myquery)
    .then((doc) => {
      if (doc) {
        db_connect
          .collection(chatgptSummary)
          .updateOne(myquery, newvalues)
          .then((data) => {
            data.query = myquery
            data.updateValue = newvalues
            res.json(data)
          })
          .catch((e) => console.log(e))
      } else {
        db_connect
          .collection(chatgptSummary)
          .insertOne(record)
          .then((data) => {
            res.json(data)
          })
          .catch((e) => console.log(e))
      }
    })
    .catch((e) => console.log(e))
})

recordRoutes.route('/logging/chatgpt-error-log').post(function (req, res) {
  console.log(
    `endpoint ${req.path} ${req.method} from ${req.headers.origin}, req.body: `,
    req.body
  )

  const now = new Date()
  let db_connect = dbo.getDb()
  let record = req.body

  record.dateAdded = now

  try {
    db_connect
      .collection('chatgpt-error-log')
      .insertOne(record)
      .then((data) => {
        res.json(data)
      })
      .catch((e) => console.log(e))
  } catch (error) {
    console.log('error @/logging/chatgpt-error-log POST:', { error, body: record })
  }
})


module.exports = recordRoutes