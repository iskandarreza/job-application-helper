const express = require("express")

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const recordRoutes = express.Router()

// This will help us connect to the database
const dbo = require("../db/conn")

// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId

/**
 * `serverLog` is a function that takes in `data` and logs it to the console, then logs the number of
 * documents upserted, modified, and inserted, and then sends a JSON response with the data
 * @param data - the data returned from the database
 */
const serverLog = (data) => {
  console.log(data)
  console.log(`${data.nUpserted} documents upserted`)
  console.log(`${data.nModified} documents modified`)
  console.log(`${data.nInserted} documents inserted`)
  // res.json(data)
}

// This section will help you get a list of all the records.
recordRoutes.route("/record").get(async function (req, res) {
  let db_connect = dbo.getDb()

  db_connect
    .collection("email-link-data")
    .find({})
    .toArray()
    .then((data) => {
      console.log(data)
      res.json(data)
    })
    .catch((e) => console.log(e))
})

// This section will help you get a single record by id
recordRoutes.route("/record/:id").get(async function (req, res) {
  let db_connect = dbo.getDb()
  let myquery = { _id: new ObjectId(req.params.id) }

  db_connect
    .collection("email-link-data")
    .findOne(myquery)
    .then((data) => {
      console.log(data)
      res.json(data)
    })
    .catch((e) => console.log(e))
})

// This section will help you create a new record.
recordRoutes.route("/record/add").post(function (req, res) {
  console.log(JSON.stringify(req.body))

  let db_connect = dbo.getDb()
  let myobj = req.body

  db_connect
    .collection("email-link-data")
    .insertOne(myobj)
    .then((data) => {
      console.log(data)
      res.json(data)
    })
    .catch((e) => console.log(e))
})

// This section will help you create multiple new records.
recordRoutes.route("/record/addbulk").post(function (req, res) {
  let db_connect = dbo.getDb()

  const bulk = db_connect
    .collection("email-link-data")
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
      serverLog(data)
      res.json(data)
    })
    .catch((e) => console.log(e))
})

// This section will help you update a record by id.
recordRoutes.route("/update/:id").post(function (req, res) {
  console.log(req.params)
  let db_connect = dbo.getDb()
  let myquery = { _id: new ObjectId(req.params.id) }

  let updateFields = {}
  Object.keys(req.body).forEach((key) => {
    if (key !== "_id") {
      updateFields[key] = req.body[key]
    }
  })

  let newvalues = { $set: updateFields }

  db_connect
    .collection("email-link-data")
    .updateOne(myquery, newvalues)
    .then((data) => {
      console.log(data)
      res.json(data)
    })
    .catch((e) => console.log(e))
})

// This section will help you delete a record
recordRoutes.route("/:id").delete((req, response) => {
  let db_connect = dbo.getDb()
  let myquery = { _id: new ObjectId(req.params.id) }
  db_connect
    .collection("email-link-data")
    .deleteOne(myquery)
    .then((data) => {
      console.log(data)
      res.json(data)
    })
    .catch((e) => console.log(e))
})

// module.exports = recordRoutes

//       console.log(data)
//       res.json(data)
//     })
//     .catch((e) => console.log(e))
// })

// module.exports = recordRoutes;
//       console.log(data)
//       res.json(data)
//     })
//     .catch((e) => console.log(e))
// })

module.exports = recordRoutes;