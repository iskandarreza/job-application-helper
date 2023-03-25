const express = require('express')
const axios = require("axios")
const recordRoutes = express.Router()
const dbo = require('../db/conn')
const ObjectId = require('mongodb').ObjectId

const devData = 'email-link-data-dev'
const collection = 'email-link-data'

const backup = 'backup'
const linkContentData = 'link-content-data'


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

  if (req.query.filter === 'id_only') {
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
  } else if (req.query.filter === 'none') {
    // no filtering needed
  } else {
    query = {
      positionStatus: 'open',
      $and: [
        { status1: { $ne: 'declined' } },
        { status1: { $ne: 'applied' } },
        { status1: { $ne: 'uncertain' } }
      ],
    }
  }

  console.log({ query, options })
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

  const recordIds = await axios.get('http://localhost:5000/record?filter=id_only')
    .then((response) => { return response.data })

  const newData = await axios.get('http://localhost:5000/data')
    .then((response) => { return response.data })

  const filteredObjects = await newData.filter((newRecord) => {
    return !recordIds.some((record) => record.id.toString() === newRecord.id.toString())
  })

  const recordNoun = filteredObjects.length > 1 ? 'records' :
    filteredObjects.length === 0 ? recordNoun = 'no' : 'record'
  
  console.log(`${filteredObjects.length} new ${recordNoun} fetched`)

  res.json(filteredObjects)
})

recordRoutes.route('/record/open').get(async function (req, res) {
  console.log(
    `endpoint ${req.path} ${req.method} from ${req.headers.origin}, req.body: `,
    req.body
  )

  let db_connect = dbo.getDb()
  let startDate = new Date().setHours(new Date().getHours() - 12) 
  let endDate = new Date().setHours(new Date().getHours() - 24 * 7)

  db_connect
    .collection(collection)
    .find({
      $and: [
        {
          dateModified: {
            $lte: new Date(startDate).toISOString(),
            $gte: new Date(endDate).toISOString(),
          }
        },
        {
          positionStatus: 'open'
        },
        {
          status1: { $ne: 'declined' },
          status1: { $ne: 'applied' },
          status1: { $ne: 'uncertain' }
        },
        {
          url: { $regex: 'indeed.com', $options: 'i' }
        },
      ]
    })
    .toArray()
    .then((data) => {
      console.log(`${data.length} open records retrieved`)
      res.json(data)
    })
    .catch((e) => console.log(e))

})

recordRoutes.route('/record/:id').get(async function (req, res) {
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

recordRoutes.route('/record/add').post(function (req, res) {
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

recordRoutes.route('/record/addbulk').post(function (req, res) {
  console.log(
    `endpoint ${req.path} ${req.method} from ${req.headers.origin}, req.body: `,
    req.body
  )

  const db_connect = dbo.getDb()
  const bulk = db_connect.collection(collection).initializeUnorderedBulkOp()
  const now = new Date()
  const uniqueDocs = new Map()

  req.body.forEach((doc) => {
    // check for duplicate ids
    if (uniqueDocs.has(doc.id)) {
      console.log(`Duplicate ID found: ${doc.id}. Skipping document.`)
      return
    }
    uniqueDocs.set(doc.id, doc)
  })

  uniqueDocs.forEach((doc) => {
    if (doc._id) {
      // upsert
      console.log('upsert', { doc })

      doc.dateModified = now
      bulk
        .find({ _id: doc._id })
        .updateOne({ $set: { ...doc, dateModified: now } })
    } else {
      // insert
      console.log('insert', { doc })

      doc.dateAdded = now
      doc.dateModified = now
      const fieldsModified = Object.keys(doc).filter(
        (key) => key !== 'dateAdded' && key !== '_id'
      )
      bulk
        .find({ id: doc.id })
        .upsert()
        .updateOne({ $set: doc, $addToSet: { fieldsModified } })
    }
  })

  bulk
    .execute()
    .then((data) => {
      console.log({ data })
      const insertedIds = data.getInsertedIds()
      const upsertedIds = data.getUpsertedIds()
      console.log({ insertedIds, upsertedIds })
      const newDataWithIds = [...uniqueDocs.values()]
        .map((doc, index) => {
          if (insertedIds[index]) {
            const insertedId = JSON.stringify(insertedIds[index].valueOf())
            return {
              _id: JSON.parse(insertedId)._id,
              ...doc,
            }
          } else if (upsertedIds[index]) {
            const upsertedId = JSON.stringify(upsertedIds[index].valueOf())
            return {
              _id: JSON.parse(upsertedId)._id,
              ...doc,
            }
          }
        })
        .filter(Boolean) // filter out the undefined elements
      console.log({ newDataWithIds })
      res.json(newDataWithIds)
    })
    .catch((e) => console.log(e))
})

recordRoutes.route('/update/:id').post(function (req, res) {
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
              console.log(data)
            })
            .catch((e) => console.log(e))
      } else {
        res.status(404).json({ message: 'Record not found.' })
      }
    })
    .catch((e) => console.log(e))
})

recordRoutes.route('/delete/:id').delete((req, res) => {
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
      console.log(data)
      res.json(data)
    })
    .catch((e) => console.log(e))
})

recordRoutes.route('/record/linkdata/:id').get(async function (req, res) {
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

recordRoutes.route('/record/linkdata/:id').post(async function (req, res) {
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
              console.log(data)
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

recordRoutes.route('/runquery').get((req, res) => {
  let db_connect = dbo.getDb();

  async function updateCollections(dbo) {
    const collectionA = dbo.collection(collection);
    const collectionB = dbo.collection(linkContentData);

    let docs = []

    await collectionB.find().forEach((docB) => {
      let query
      if (isNaN(docB.id)) {
        query = { id: { $eq: String(docB.id) } }
      } else {
        query = { id: parseInt(docB.id) }
      }
      collectionA
        .findOne(query)
        .then(() => {
          const data = {
            id: docB.id,
          }

          if(!isNaN(docB.id)){
            console.log(docB)

          }
          const { org, role, location } = docB

          if (org || role || location) {
            if (org) {
              data.org  = org
            }
            if (role) {
              data.role = role
            }
            if (location) {
              data.location = location
            }
  
            docs.push(data)
          }
          
        })

    })

    // docs.forEach(async (item) => {

    //   let updateFields = {}
    //   let query
    //   if (isNaN(item.id)) {
    //     query = { id: { $eq: String(item.id) } }
    //   } else {
    //     query = { id: parseInt(item.id) }
    //   }

    //   Object.keys(item).forEach((key) => {
    //     if (key !== '_id' && key !== 'id') {
    //       updateFields[key] = item[key]
    //     }
    //   })

    //   let newvalues = {};
    //   if (Object.keys(updateFields).length > 0) {
    //     newvalues.$set = updateFields
    //   }

    //   await collectionA
    //     .updateOne(query, newvalues)
    //     .then((data) => {
    //       console.log(data)
    //     })

    // })
    
    console.log(docs.length)
    return docs
  }
  

  updateCollections(db_connect)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('An error occurred while updating collections.');
    });
});


module.exports = recordRoutes