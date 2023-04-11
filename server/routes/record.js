require("dotenv").config({ path: "./config.env" })
const express = require('express')
const axios = require("axios")
const recordRoutes = express.Router()
const dbo = require('../db/conn')
const fetchPagesData = require('../tasks/fetchPagesData')
const meta = require('../meta')
const ObjectId = require('mongodb').ObjectId

const collection = 'email-link-data'
const linkContentData = 'link-content-data'
const chatgptSummary = 'chatgpt-summary-responses'
const chatgptErrorLog = 'chatgpt-error-log'

// Maintenance routes
recordRoutes.get('/maintenance/populate-collection', async (req, res) => {
  let db_connect = await dbo.getDb()
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

// http://localhost:5000/maintenance/get-duplicates/email-link-data/true
recordRoutes.get('/maintenance/get-duplicates/:collection/:deleteRecords', async (req, res) => {
  const workingCollection = req.params.collection

  const deleteRecords = req.params.deleteRecords ? true : false

  let db_connect = await dbo.getDb()
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

  const records = await axios
    .post(`${process.env.SERVER_URI}/records/chatgpt-summary-responses/`, {})
    .then(({ data }) => data)

  let arrayToSend = []

  for (const record of records) {
    const { id, response } = record
    const { result } = response
    const { skills } = result
    
    arrayToSend.push({ id, skills })
  }

  console.log(arrayToSend.length)

  res.send(arrayToSend)

})

recordRoutes.route('/maintenance/find-missing').get(async (req, res) => {
  const linkData = linkContentData
  const metaData = collection
  let db_connect = await dbo.getDb()

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
  let db_connect = await dbo.getDb()
  console.log({...req.params})
  const { source, target } = req.params
  const report = []

  try {
    // Delete all documents in the target collection
    const deleteResult = await db_connect.collection(target).deleteMany({})
    report.push(`Deleted ${deleteResult.deletedCount} documents from ${target}`)

    // Find all documents in the source collection
    const docs = await db_connect.collection(source).find().toArray()

    // Insert all documents into the target collection
    const result = await db_connect.collection(target).insertMany(docs)

    report.push(`Inserted ${result.insertedCount} documents into ${target}`)

    report.push(`${source} cloned into ${target} successfully`)

    res.send(report)

  } catch (err) {
    console.error(err)
    res.status(500).send(`Failed to clone ${source}`)
  }
})



// App routes
recordRoutes.post('/records/:collection/', async (req, res) => {
  console.log(
    `endpoint ${req.path} ${req.method} from ${req.headers.origin}, : ` ,
    {body: req.body, query: req.query}
  )
  const dbCollection = req.params.collection
  const { body, query } = req
  const field = query.field || 'dateModified'
  const sort =  query.sort_order === 'asc' ? 1 : query.sort_order === 'dec' ? -1 : -1
  const idOnly = query.id_only === 'true' ? true : false
  const newRecords = query.new === 'true' ? true : false
  const keywords = query.keywords === 'true' ? true : false
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
    
    const recordIds = await axios.post(`${process.env.SERVER_URI}/records/email-link-data?id_only=true`)
      .then((response) => { return response.data })
    
    const newData = await axios.get(`${process.env.SERVER_URI}/data`)
      .then((response) => { return response.data })

    const filteredObjects = await newData.filter((newRecord) => {
      return !recordIds.some((record) => record.id.toString() === newRecord.id.toString())
    })

    const filteredResults = await filteredObjects.filter((obj) => {
      return !recordIds.some((record) => { record.url === obj.url })
    })

    res.json(filteredResults)

  } else {
    let db_connect = await dbo.getDb()
    let response
    let results
    console.log(queryObj)

    if (keywords) {

      let aggregateQuery =         [
        {
          $lookup: {
            from: chatgptSummary,
            localField: "id",
            foreignField: "id",
            pipeline: [
              {
                $project: {
                  id: "$id",
                  skills: {
                    $filter: {
                      input: "$response.result.skills.minimum",
                      as: "skill",
                      cond: {
                        $and: [
                          { $ne: ["$$skill.keyword", ""] },
                          { $ne: ["$$skill.keyword", null] }
                        ]
                      }
                    }
                  },
                  extras: {
                    $filter: {
                      input: "$response.result.skills.extras",
                      as: "extras",
                      cond: {
                        $and: [
                          { $ne: ["$$extras", ""] },
                          { $ne: ["$$extras", null] }
                        ]
                      }
                    }
                  }
                }
              },
              {
                $project: {
                  keywords: {
                    $reduce: {
                      input: { $setUnion: ["$skills.keyword", "$extras"] },
                      initialValue: "",
                      in: { $concat: [ "$$value", ",", "$$this" ] }
                    }
                  }
                }
              },

            ],
            as: "lookupResults"
          }
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: ["$$ROOT", {
                keywords: {
                  $cond: {
                    if: { $gt: [{ $size: "$lookupResults.keywords" }, 0] },
                    then: { $arrayElemAt: ["$lookupResults.keywords", 0] },
                    else: "$$REMOVE"
                  }
                }
              }]
            }
          }
        },
        {
          $project: {
            lookupResults: 0
          }
        },
        { $match: queryObj },

      ]  

      if (field && sort) {
        aggregateQuery.unshift({ $sort: { [field]: sort } })
      }

      results = await db_connect.collection(dbCollection)
      .aggregate(aggregateQuery)
      .toArray()
      .catch((e) => res.status(500).send(e))


    } else {
      
      let docs = await db_connect
        .collection(dbCollection)
        .find(queryObj, queryOpts)
    
      if (field && sort) {
        console.log({field, sort})
        response = docs.sort({ [field]: sort })
      }
    
      results = await response
        .toArray()
        .then((data) => data)
        .catch((e) => res.status(500).send(e))

    }

    res.json(results)
  
  }

  
})

recordRoutes.route('/record/new').post(async (req, res) => {
  console.log(
    `endpoint ${req.path} ${req.method} from ${req.headers.origin}, req.body: `,
    req.body
  )

  const now = new Date()
  let db_connect = await dbo.getDb()
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

recordRoutes.route('/record/:id').get(async (req, res) => {
  console.log(
    `endpoint ${req.path} ${req.method} from ${req.headers.origin}, req.query: `,
    req.query
  )

  let db_connect = await dbo.getDb()
  let myquery = { _id: new ObjectId(req.params.id) }

  db_connect
    .collection(collection)
    .findOne(myquery)
    .then((data) => {
      res.json(data)
    })
    .catch((e) => console.log(e))
})

recordRoutes.route('/record/:id').put(async (req, res) => {
  console.log(
    `endpoint ${req.path} ${req.method} from ${req.headers.origin}, req.body: `,
    req.body
  )

  let db_connect = await dbo.getDb()
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

recordRoutes.route('/record/:id').delete(async (req, res) => {
  console.log(
    `endpoint ${req.path} ${req.method} from ${req.headers.origin}, req.body: `,
    req.body
  )

  let db_connect = await dbo.getDb()
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

  let db_connect = await dbo.getDb()
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

  let db_connect = await dbo.getDb()
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

recordRoutes.route('/record/:id/summary').post(async (req, res) => {
  console.log(
    `endpoint ${req.path} ${req.method} from ${req.headers.origin}, req.body: `,
    req.body
  )

  let db_connect = await dbo.getDb()
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

recordRoutes.route('/logging/chatgpt-error-log').post(async (req, res) => {
  console.log(
    `endpoint ${req.path} ${req.method} from ${req.headers.origin}, req.body: `,
    req.body
  )

  const now = new Date()
  let db_connect = await dbo.getDb()
  let record = req.body

  record.dateAdded = now

  try {
    db_connect
      .collection(chatgptErrorLog)
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