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

// App routes
recordRoutes.post('/records/:collection/', async (req, res) => {
  console.log(
    `endpoint ${req.path} ${req.method} from ${req.headers.origin}, : `,
    { body: req.body, query: req.query }
  )
  const dbCollection = req.params.collection
  const { body, query } = req
  const field = query.field || 'dateModified'
  const sort = query.sort_order === 'asc' ? 1 : query.sort_order === 'dec' ? -1 : -1
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

      let aggregateQuery = [
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
                      in: { $concat: ["$$value", ",", "$$this"] }
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
        console.log({ field, sort })
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
        console.log(`/record/new data: ${JSON.stringify(data)}`)
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
              console.log({ ...data, newvalues })
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

recordRoutes.route('/query/skills').get(async function (req, res) {
  console.log(
    `endpoint ${req.path} ${req.method} from ${req.headers.origin}, req.body: `,
    req.body
  )

  let db_connect = await dbo.getDb()

  const keywordMap = [
    { groupName: 'JavaScript', synonyms: ['JavaScript', 'Javascript'] },
    { groupName: 'CSS', synonyms: ['CSS', 'CSS3'] },
    { groupName: 'HTML', synonyms: ['HTML', 'HTML5'] },
    { groupName: 'Node', synonyms: ['Node.js', 'NodeJS', 'Node JS', 'Node'] },
    { groupName: 'Git', synonyms: ['Git', 'GIT', 'git', 'GitHub'] },
    { groupName: 'WordPress', synonyms: ['WordPress', 'Wordpress', 'WordPress development', 'WordPress CMS'] },
    { groupName: 'TypeScript', synonyms: ['TypeScript', 'Typescript'] },
    { groupName: 'React', synonyms: ['React', 'ReactJS', 'React.js', 'React JS'] },
    { groupName: 'Angular', synonyms: ['Angular', 'AngularJS', 'Angular.js', 'Angular 2+'] },
    { groupName: 'Problem-solving', synonyms: ['Problem-solving', 'problem-solving', 'problem solving'] },
    {
      groupName: 'Communication', synonyms: [
        'Communication',
        'communication',
        'verbal and written communication',
        'verbal communication',
        'communication skills',
        'Excellent communication skills',
        'Verbal and written communication',
        'verbal and written communication skills',
        'Communication skills'
      ]
    },
    { groupName: 'Agile', synonyms: ['Agile', 'Agile development', 'Agile methodologies'] },
    { groupName: 'APIs', synonyms: ['APIs', 'REST', 'REST APIs', 'REST API', 'RESTful API', 'RESTful APIs', 'RESTful'] },
    { groupName: 'jQuery', synonyms: ['jQuery', 'JQuery'] },
    { groupName: '.NET', synonyms: ['.NET', 'ASP.NET', 'ASP.Net', '.NET framework'] },
    { groupName: 'SQL', synonyms: ['SQL', 'MSSQL', 'MS SQL', 'T-SQL', 'TSQL', 'SQL Server', 'Microsoft SQL Server'] }
  ]  

  let aggregateQuery = [
    {
      $project: {
        skills: {
          $concatArrays: ["$response.result.skills.minimum", "$response.result.skills.extras"]
        },
        qualifications: {
          $concatArrays: ["$response.result.qualifications.minimum", "$response.result.qualifications.extras"]
        }
      }
    },
    {
      $project: {
        keywords: {
          $concatArrays: ["$skills.keyword", "$qualifications.keyword"]
        }
      }
    },
    {
      $unwind: "$keywords"
    },
    {
      $addFields: {
        matchedKeywords: {
          $reduce: {
            input: keywordMap,
            initialValue: [],
            in: {
              $cond: [
                {
                  $or: [
                    {
                      $in: ["$keywords", "$$this.synonyms"]
                    },
                    {
                      $regexMatch: {
                        input: "$keywords",
                        regex: { $concat: [ "$$this.groupName", "/gi"] }
                      }
                    }
                  ]
                },
                { $concatArrays: ["$$value", "$$this.synonyms"] },
                "$$value"
              ]
            }
          }
        }
      }
    },
    {
      $addFields: {
        originalKeywords: {
          $cond: {
            if: { $ne: [{ $size: "$matchedKeywords" }, 0] },
            then: "$matchedKeywords",
            else: ["$keywords"]
          }
        }
      }
    },
    {
      $addFields: {
        newKeyword: {
          $cond: {
            if: { $ne: [{ $size: "$matchedKeywords" }, 0] },
            then: { $arrayElemAt: ["$matchedKeywords", 0] },
            else: "$keywords"
          }
        }
      }
    },
    {
      $group: {
        _id: "$newKeyword",
        docs: {
          $addToSet: "$_id"
        },
        originalKeywords: { $addToSet: "$originalKeywords" }
      }
    },
    {
      $project: {
        _id: 0,
        x: "$_id",
        value: {
          $size: "$docs"
        },
        originalKeywords: {
          $cond: [
            {
              $and: [
                { $isArray: "$originalKeywords" },
                { $ne: [{ $size: "$originalKeywords" }, 0] }
              ]
            },
            { $reduce: { input: "$originalKeywords", initialValue: [], in: { $concatArrays: ["$$value", "$$this"] } } },
            []
          ]
        }
      }
    },
    {
      $sort: {
        value: -1
      }
    }
  ]

  // expected output: 
  // [
  //   {
  //     "x": "JavaScript",
  //     "value": 341,
  //     "originalKeywords": [
  //       "JavaScript",
  //       "Javascript"
  //     ]
  //   },
  //   {
  //     "x": "CSS",
  //     "value": 265,
  //     "originalKeywords": [
  //       "CSS",
  //       "CSS3"
  //     ]
  //   },
  //   {
  //     "x": "HTML",
  //     "value": 264,
  //     "originalKeywords": [
  //       "HTML",
  //       "HTML5"
  //     ]
  //   },
  // ]
  
  let docs = await db_connect
    .collection('chatgpt-summary-responses')
    .find({})
    .toArray()

  let results = await db_connect.collection('chatgpt-summary-responses')
    .aggregate(aggregateQuery)
    .toArray()
    .catch((e) => res.status(500).send(e))

  let payload = {
    records: docs.length, // number of docs in the collection
    keywordsCount: results.length,
    keywordsList: results
  }

  res.json(payload)
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