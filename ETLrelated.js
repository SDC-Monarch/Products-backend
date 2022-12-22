const Papa = require('papaparse')
const fs = require('fs')
const file = fs.createReadStream('related10.csv')
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

const groupBySecondColumn = (input) => {
  const output = {};

  for (const row of input) {
    const key = row[1];
    const value = row[2];

    if (key in output) {
      output[key].push(value);
    } else {
      output[key] = [value];
    }
  }

  return output;
}

async function addRelated(related) {
  const client = new MongoClient(url, { useNewUrlParser: true });
  await client.connect();

  const db = client.db('test1');
  const collection = db.collection('products');

  for (const id of Object.keys(related)) {
    if (id % 100000 === 0)
      console.log(id);
    const query = { id: id };
    const update = { $set: { related: related[id] } };
    await collection.updateOne(query, update);
  }

  await client.close();
}

Papa.parse(file, {
  complete: async (results) => {
    console.log("All done!");
    results.data = groupBySecondColumn(results.data)
    await addRelated(results.data);
  }
});

const output = {
  1:[2,3,8,7],
  2:[3,7,6,5],
  3:[5,9]
}