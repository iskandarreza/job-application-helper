const express = require("express")

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const recordRoutes = express.Router()

// This will help us connect to the database
const dbo = require("../db/conn")

// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId

const collection = "email-link-data-dev"

recordRoutes.route("/clone").get(async function (req, res) {
  const db = dbo.getDb();
  
  try {
    // Find all documents in the email-link-data collection
    const docs = await db.collection("email-link-data").find().toArray();

    // Insert all documents into the email-link-data-dev collection
    const result = await db.collection("email-link-data-dev").insertMany(docs);
    
    console.log(`Inserted ${result.insertedCount} documents into email-link-data-dev`);
    
    res.send("Cloned collection successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to clone collection");
  }
});


// This section will help you get a list of all the records.
recordRoutes.route("/record").get(async function (req, res) {
  console.log(`endpoint "/record" get from: ${req.headers.origin}. req.headers: `, req.headers)
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

// This section will help you get a single record by id
recordRoutes.route("/record/:id").get(async function (req, res) {
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

// This section will help you create a new record.
recordRoutes.route("/record/add").post(function (req, res) {
  console.log(`endpoint "/record/add" post from ${req.headers.origin}, req.body: `, req.body)

  let db_connect = dbo.getDb()
  let myobj = req.body

  db_connect
    .collection(collection)
    .insertOne(myobj)
    .then((data) => {
      res.json(data)
    })
    .catch((e) => console.log(e))
})

// This section will help you create multiple new records.
recordRoutes.route("/record/addbulk").post(function (req, res) {
  let db_connect = dbo.getDb()

  const bulk = db_connect
    .collection(collection)
    .initializeUnorderedBulkOp()
  const now = new Date()
  req.body.forEach((doc) => {
    if (doc._id) {
      doc.dateModified = now
      bulk
        .find({ _id: doc._id })
        .updateOne({ $set: { ...doc, dateModified: now } })
    } else {
      doc.dateAdded = now
      doc.dateModified = now
      const fieldsModified = Object.keys(doc).filter(
        (key) => key !== "dateAdded" && key !== "_id"
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
      res.json(data)
    })
    .catch((e) => console.log(e))
})

// This section will help you update a record by id.
recordRoutes.route("/update/:id").post(function (req, res) {
  console.log(`endpoint "/update/id" post from ${req.headers.origin}, req.body: `, req.body)
  let db_connect = dbo.getDb()
  let myquery = { _id: new ObjectId(req.params.id) }

  let updateFields = {}
  let fieldsModified = []

  Object.keys(req.body).forEach((key) => {
    if (key !== "_id" && key !== "dateModified" && key !== "fieldsModified") {
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
          res.json({ message: "No fields were modified." })
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
        res.status(404).json({ message: "Record not found." })
      }
    })
    .catch((e) => console.log(e))
})

// This section will help you delete a record
recordRoutes.route("/delete/:id").delete((req, res) => {
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

module.exports = recordRoutes;