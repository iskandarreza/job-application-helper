const express = require('express')
const axios = require("axios")
const recordRoutes = express.Router()
const dbo = require('../db/conn')
const fetchPagesData = require('../tasks/fetchPagesData')
const meta = require('../meta')
const ObjectId = require('mongodb').ObjectId

const devData = 'email-link-data-dev'
const collection = 'email-link-data'

const backup = 'backup'
const linkContentData = 'link-content-data'

const linkContentDataBackup = 'link-content-data-backup'

recordRoutes.route('/runquery/:field/:order').post((req, res) => {
  let db_connect = dbo.getDb()
  let query = JSON.stringify(req.body)

  console.log({ query })
  console.log({ params: req.params })
  let response

  let docs = db_connect
    .collection(collection)
    .find(JSON.parse(query))

  if (req.params.field) {
    let { field } = req.params
    let order = req.params.order || 1
    response = docs.sort({ [field]: order })
  }

  response
    .toArray()
    .then((data) => {
      res.json(data)
    })
    .catch((e) => console.log(e))

})

recordRoutes.get('/populate-collection', async (req, res) => {
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

recordRoutes.get('/get-duplicates', async (req, res) => {
  const workingCollection = collection

  const deleteRecords = false

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

recordRoutes.get('/fix-records', async (req, res) => {
  let query = { org: { $exists: false } }
  let db_connect = dbo.getDb()

  let results = []

  await db_connect
    .collection(collection)
    .find(query)
    .toArray()
    .then((data) => {
      console.log(data)
      console.log(`${data.length} records matching query: ${JSON.stringify(query)}`)

      results.push(...data)

      // res.json({resultIds})

    })
    .catch((e) => console.log(e))


  // let records = await db_connect
  // .collection(collection)
  // .find({ _id: { $in: results } })
  // .toArray()
  // .catch((e) => console.log(e))

  // console.log(`${records.length} duplicate records found`)

  let resultIds = results.map((doc) => doc['_id'])


  db_connect
    .collection(collection)
    .deleteMany({ _id: { $in: resultIds } })
    .then((data) => {
      console.log(data)
      res.json(data)
    })
    .catch((e) => console.log(e))


  // res.send(JSON.stringify(records, null, 4))

})

recordRoutes.route('/find-missing').get(async (req, res) => {
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

recordRoutes.route('/backup').get(async function (req, res) {
  const db = dbo.getDb()
  // const collection = linkContentData
  // const backup = linkContentDataBackup

  try {
    // Delete all documents in the backup collection
    const deleteResult = await db.collection(backup).deleteMany({})
    console.log(`Deleted ${deleteResult.deletedCount} documents from ${backup}`)

    // Find all documents in the email-link-data collection
    const docs = await db.collection(collection).find().toArray()

    // Insert all documents into the backup collection
    const result = await db.collection(backup).insertMany(docs)

    console.log(
      `Inserted ${result.insertedCount} documents into ${backup}`
    )

    res.send(`${collection} backed up successfully`)
  } catch (err) {
    console.error(err)
    res.status(500).send(`Failed to backup ${collection}`)
  }
})

recordRoutes.route('/restore').get(async function (req, res) {
  const db = dbo.getDb()
  const collection = linkContentData
  const backup = linkContentDataBackup

  try {
    const deleteResult = await db.collection(collection).deleteMany({})
    console.log(`Deleted ${deleteResult.deletedCount} documents from ${collection}`)

    const docs = await db.collection(backup).find().toArray()

    const result = await db.collection(collection).insertMany(docs)

    console.log(
      `Inserted ${result.insertedCount} documents into ${backup}`
    )

    res.send(`${backup} restored successfully`)
  } catch (err) {
    console.error(err)
    res.status(500).send(`Failed to restore ${backup}`)
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
        extraData: 0,
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

recordRoutes.route('/record/new').get(async function (req, res) {
  console.log(
    `endpoint ${req.path} ${req.method} from ${req.headers.origin}, req.body: `,
    req.body
  )

  const recordIds = await axios.get('http://localhost:5000/record?filter=none&id_only=true')
    .then((response) => { return response.data })

  const newData = await axios.get('http://localhost:5000/data')
    .then((response) => { return response.data })

  const filteredObjects = await newData.filter((newRecord) => {
    return !recordIds.some((record) => record.id.toString() === newRecord.id.toString())
  })

  const filterdResults = await filteredObjects.filter((obj) => {
    return !recordIds.some((record) => { record.url === obj.url })
  })

  try {
    res.json(filterdResults)
  } catch (error) {
    console.log(error)
  }
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

  let updateFields = {};
  let fieldsModified = [];

  Object.keys(req.body).forEach((key) => {
    if (['positionStatus', 'status1', 'status2', 'status3', 'notes'].includes(key)) {
      fieldsModified.push({ field: key, value: req.body[key], dateModified: new Date() });
    }
    if (key !== '_id' && key !== 'dateModified' && key !== 'fieldsModified') {
      updateFields[key] = req.body[key]
    }
  });

  let newvalues = {};
  if (Object.keys(updateFields).length > 0) {
    newvalues.$set = updateFields;
    newvalues.$set.dateModified = new Date().toISOString();
  }
  if (fieldsModified.length > 0) {
    newvalues.$push = { fieldsModified: { $each: fieldsModified } };
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
  let id = req.params.id
  if (isNaN(id)) {
    myquery = { id: { $eq: String(req.params.id) } }
  } else {
    myquery = { id: parseInt(id) }
  }

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

module.exports = recordRoutes