require("dotenv").config({ path: "./config.env" })
const express = require('express')
const maintenanceRoutes = express.Router()
const dbo = require('../db/conn')
const fetchPagesData = require('../tasks/fetchPagesData')
const meta = require('../meta')
const ObjectId = require('mongodb').ObjectId

const collection = 'email-link-data'
const linkContentData = 'link-content-data'

// Maintenance routes
maintenanceRoutes.get('/maintenance/populate-collection', async (req, res) => {
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
maintenanceRoutes.get('/maintenance/get-duplicates/:collection/:deleteRecords', async (req, res) => {
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

maintenanceRoutes.get('/maintenance/delete-failed-crawldata', async (req, res) => {

  let records = []
  let db_connect = await dbo.getDb()
  let query = {
    $and: [
      { jobDescriptionText: { $exists: false } },
      {
        $or: [
          { statusCode: { $exists: true } },
          { statusCode: { $ne: 200 } },
        ]
      }
    ],
  }

  await db_connect
    .collection(linkContentData)
    .find(query)
    .toArray()
    .then((data) => {

      console.log(data.length)
      data.forEach((record) => {records.push(record)})

    })
    .catch((e) => console.log(e))

  console.log(`${records.length} failed crawl data records found will be deleted`)

  records.forEach((doc) => {
    let myquery = { _id: new ObjectId(doc._id) }

    db_connect
      .collection(linkContentData)
      .deleteOne(myquery)
      .then((data) => {
        console.log({ ...data, ...doc })
      })
  })

  res.send(`${records.length} failed crawl data deleted`)

})

maintenanceRoutes.route('/maintenance/find-missing').get(async (req, res) => {
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

maintenanceRoutes.route('/maintenance/clone/:source/:target').get(async function (req, res) {
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

module.exports = maintenanceRoutes