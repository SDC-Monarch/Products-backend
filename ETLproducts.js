const Papa = require('papaparse')
const fs = require('fs')
const file = fs.createReadStream('product.csv')
const mongodb = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/";

Papa.parse(file, {
  header: true,
  complete: async (results) => {
    console.log("Finished reading file");
    await mongodb.connect(
      url,
      { useNewUrlParser: true, useUnifiedTopology: true },
      (err, client) => {
        if (err) throw err;

        client
          .db("test1")
          .collection("products")
          .insertMany(results.data, (err, res) => {
            if (err) throw err;

            console.log(`Inserted: ${res.insertedCount} rows`);
            client.close();
          });
      }
    );

  }
});
