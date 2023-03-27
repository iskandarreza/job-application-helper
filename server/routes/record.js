const express = require('express')
const axios = require("axios")
const recordRoutes = express.Router()
const dbo = require('../db/conn')
const ObjectId = require('mongodb').ObjectId

const devData = 'email-link-data-dev'
const collection = 'email-link-data'

const backup = 'backup'
const linkContentData = 'link-content-data'

const linkContentDataBackup = 'link-content-data-backup'


recordRoutes.route('/runquery').get((req, res) => {
  let db_connect = dbo.getDb();

  var docs
  var bulkOps = []
  db_connect
    .collection('email-link-data')
    .aggregate([
      {
        $lookup: {
          from: "link-content-data",
          localField: "id",
          foreignField: "id",
          as: "matches"
        }
      },
      {
        $unwind: "$matches"
      },
      {
        $sort: {
          "matches.dateModified": -1
        }
      },
      {
        $group: {
          _id: "$_id",
          id: { $first: "$id" },
          match: { $first: "$matches" }
        }
      },
      {
        $project: {
          _id: 1,
          id: 1,
          match: 1,
          
        }
      }
    ])


    // .toArray()
    // .then((data) => {
    //   docs = data
    //   let filtered = [...data].filter((doc) => doc._id !== doc.match._id)
    //   console.log([data[0], data[1], data[3]])
    //   console.log([filtered[0], filtered[1], filtered[3]])
    //   console.log(data.length)
    //   console.log(filtered.length)
    //   res.json(data)
    // })



    .forEach(function (doc) {
      bulkOps.push({
        updateMany: {
          filter: {
            id: doc.id,
            _id: { $ne: doc.match._id }
          },
          update: {
            $set: { deleted: true }
          }
        }
      })
    
    })
    
    if (bulkOps.length > 0) {
      let ops = bulkOps.slice(0, 20)
      console.log(ops)
      db_connect.collection('link-content-data').bulkWrite(ops)
    }
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
      { $out: linkContentData }    ]).toArray()

    res.send(`Successfully populated ${result.length} documents to ${linkContentData} collection.`)
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})

recordRoutes.route('/backup').get(async function (req, res) {
  const db = dbo.getDb()

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
    options = { projection: {
      org: 0,
      role: 0,
      location: 0,
      url: 0,
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
    }}
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

  try {
    res.json(filteredObjects)
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

  db_connect
    .collection(collection)
    .insertOne(record)
    .then((data) => {
      res.json(data)
    })
    .catch((e) => console.log(e))
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
      fieldsModified.push({ field: key, dateModified: new Date() });
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

  db_connect
    .collection(collection)
    .findOne(myquery)
    .then((doc) => {
      if (doc) {
          db_connect
            .collection(collection)
            .updateOne(myquery, newvalues)
            .then((data) => {
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
  let myquery = { id: {$eq: req.params.id} }
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
  let myquery = { id: {$eq: req.params.id} }
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