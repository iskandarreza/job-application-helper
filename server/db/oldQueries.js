
recordRoutes.get('/maintenance/fix-records', async (req, res) => {
  const workingCollection = linkContentData

  let query = { id: { $type: ["double", "int", "long", "decimal"] , $ne: null } }
  let db_connect = dbo.getDb()

  let results = []

  await db_connect
    .collection(workingCollection)
    .find(query)
    .toArray()
    .then((data) => {
      console.log(`${data.length} records matching query: ${JSON.stringify(query)}`)
      results.push(...data)

    })
    .catch((e) => console.log(e))

  res.json(meta(results))

  results.forEach(async (doc) => {
    let myquery = { _id: new ObjectId(doc._id) }
    let newvalues = {}

    newvalues.$set = { id: doc.id.toString() }

    try {
      db_connect
        .collection(workingCollection)
        .updateOne(myquery, newvalues)
        .then((data) => {
          console.log({ ...data, newvalues })
        })
        .catch((e) => console.log(e))
    } catch (error) {
      console.log('error @/record/:id PUT:', { error, body: req.body })
    }

  })


})

recordRoutes.get('/maintenance/fix-records', async (req, res) => {

  const records = await axios
    .post(`http://localhost:5000/records/chatgpt-summary-responses/`, {})
    .then(({ data }) => data)

  let recordsToFix = []

  for (const record of records) {
    const { id, response } = record
    const { result } = response

    try {

      let test = result.includes('"summary"') 
      console.log(test) // should work if it's a string
      if (test) {
        recordsToFix.push({id, response})
      }

    } catch (error) {
      // console.log(result) // should show normal objects
    }
    
  }

  recordsToFix.forEach(async ({ id, response }) => {
    const { result } = response
    let parsed

    try {
      parsed = JSON.parse(result)
      
    } catch (error) {
      parsed = JSON.parse(JSON.stringify(result))
    }
    const payload = Object.create(response)

    payload.result = parsed

    const updateRecord = await axios
      .post(`http://localhost:5000/record/${id}/summary`, { response: payload })
      .then(({ data }) => data)

      console.log({updateRecord})

  })

  res.send(`${recordsToFix.length} records to fix`)

})
