const express = require('express')
const recordRoutes = express.Router()
const dbo = require('../db/conn')
const ObjectId = require('mongodb').ObjectId

const collection = 'email-link-data'

recordRoutes.route('/clone').get(async function (req, res) {
  const db = dbo.getDb()

  try {
    // Find all documents in the email-link-data collection
    const docs = await db.collection('email-link-data').find().toArray()

    // Insert all documents into the email-link-data-dev collection
    const result = await db.collection('email-link-data-dev').insertMany(docs)

    console.log(
      `Inserted ${result.insertedCount} documents into email-link-data-dev`
    )

    res.send('Cloned collection successfully')
  } catch (err) {
    console.error(err)
    res.status(500).send('Failed to clone collection')
  }
})

recordRoutes.route('/record').get(async function (req, res) {
  console.log(
    `endpoint ${req.path} ${req.method} from ${req.headers.origin}, req.body: `,
    req.body
  )

  let db_connect = dbo.getDb()

  db_connect
    .collection(collection)
    .find({})
    .toArray()
    .then((data) => {
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
  const priorityLocation = 'some location' // replace with your actual priority location

  const uniqueDocs = new Map()
  req.body.forEach((doc) => {
    const existingDoc = uniqueDocs.get(doc.id)
    if (existingDoc) {
      // check if the duplicates are exactly alike, if yes, ignore the new one
      if (JSON.stringify(existingDoc) === JSON.stringify(doc)) {
        return
      }

      // check if the location property string contains the priority location, delete the one without
      const existingLocation = existingDoc.location
      const newLocation = doc.location
      if (
        existingLocation.includes(priorityLocation) &&
        !newLocation.includes(priorityLocation)
      ) {
        return
      }
      if (
        newLocation.includes(priorityLocation) &&
        !existingLocation.includes(priorityLocation)
      ) {
        uniqueDocs.set(doc.id, doc)
        return
      }

      // if they both have location property string === priorityLocation, delete the older record (check dateModified)
      if (existingLocation === newLocation) {
        if (existingDoc.dateModified > doc.dateModified) {
          return
        }
        if (doc.dateModified > existingDoc.dateModified) {
          uniqueDocs.set(doc.id, doc)
          return
        }
      }

      // if they have identical dateModified, pick the bigger one and delete the other
      if (existingDoc.dateModified === doc.dateModified) {
        if (existingDoc.size > doc.size) {
          return
        }
        if (doc.size > existingDoc.size) {
          uniqueDocs.set(doc.id, doc)
          return
        }
      }
    } else {
      uniqueDocs.set(doc.id, doc)
    }
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

  let updateFields = {}
  let fieldsModified = []

  Object.keys(req.body).forEach((key) => {
    if (key !== '_id' && key !== 'dateModified' && key !== 'fieldsModified') {
      fieldsModified.push(key)
      updateFields[key] = req.body[key]
    }
  })

  let newvalues = {}
  if (fieldsModified.length > 0) {
    newvalues.$set = updateFields
    newvalues.$set.dateModified = new Date().toISOString()
    newvalues.$push = { fieldsModified: { $each: fieldsModified } }
  }

  db_connect
    .collection(collection)
    .findOne(myquery)
    .then((doc) => {
      if (doc) {
        let isSame = true
        fieldsModified.forEach((key) => {
          if (doc[key] !== req.body[key]) {
            isSame = false
          }
        })
        if (isSame) {
          res.json({ message: 'No fields were modified.' })
        } else {
          db_connect
            .collection(collection)
            .updateOne(myquery, newvalues)
            .then((data) => {
              data.query = myquery
              data.updateValue = newvalues
              res.json(data)
            })
            .catch((e) => console.log(e))
        }
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

recordRoutes.route("/fix").post((req, res) => {
  let db_connect = dbo.getDb()
  db_connect
    .collection(collection)
    .bulkWrite([
      {
        updateMany: {
          filter: { id: { $exists: false }, linkId: { $exists: true } },
          update: { $rename: { linkId: "id" } }
        }
      },
      {
        updateMany: {
          filter: {},
          update: { $rename: { link: "url" } }
        }
      },
      {
        updateMany: {
          filter: {},
          update: { $unset: { linkId: "" } }
        }
      },
      {
        updateMany: {
          filter: { dateAdded: { $exists: false } },
          update: { $currentDate: { dateAdded: true } }
        }
      },
      {
        updateMany: {
          filter: { dateModified: { $exists: false } },
          update: { $currentDate: { dateModified: true } }
        }
      }
    ])    .then((data) => {
      res.json(data)
    })
    .catch((e) => console.log(e))
})

module.exports = recordRoutes
