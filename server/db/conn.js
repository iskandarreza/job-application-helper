const { MongoClient } = require("mongodb")
const Db = process.env.ATLAS_URI
const client = new MongoClient(Db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
 
var _db
 
module.exports = {
  connectToServer: async function (callback) {
    try {
      await client.connect();
    } catch (e) {
      console.error(e);
    }

    
    _db = client.db(process.env.DB_NAME)
    console.log("Successfully connected to MongoDB.")

    return (_db === undefined ? false : true);

  },
 
  getDb: function () {
    if (_db) {
      return _db
    } else {
      return this.connectToServer()
    }
  },
}