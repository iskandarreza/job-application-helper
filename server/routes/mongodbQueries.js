
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
      },
      {
        updateMany: {
          filter: {},
          update: { $unset: { fieldsModified: "" } }
        }
      },
    ])
    .then((data) => {
      res.json(data)
    })
    .catch((e) => console.log(e))
})

recordRoutes.route("/fix").post((req, res) => {
  let db_connect = dbo.getDb()
  db_connect
    .collection(collection)
    .aggregate([
      {
        $match: {
          url: { $regex: /linkedin.com/ },
          id: { $type: "string" }
        }
      },
      {
        $addFields: {
          idType: { $type: "$id" },
          isNumeric: { $regexMatch: { input: "$id", regex: /^[0-9]+$/ } },
          idDecimal: {
            $convert: {
              input: "$id",
              to: "decimal",
              onError: 0
            }
          }
        }
      },
      {
        $match: {
          idType: "string",
          isNumeric: true,
          idDecimal: { $gt: 0 }
        }
      },
      {
        $project: {
          idType: 0,
          isNumeric: 0,
          idDecimal: 0
        }
      }
    ])
    .toArray()
    .then((data) => {
      res.json(data)
    })
    .catch((e) => console.log(e))
})