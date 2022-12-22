const Papa = require('papaparse')
const fs = require('fs')
const file = fs.createReadStream('feature10.csv')
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

function convertToObject(arr) {
  let result = {};

  arr.forEach(row => {
    let key = row[1];
    let feature = row[2];
    let value = row[3];
    if (!result[key]) {
      result[key] = [];
    }
    if (value === 'null')
      value = null;
    result[key].push({ feature, value });
  });
  return result;
}

async function addFeature(features) {
  const client = new MongoClient(url, { useNewUrlParser: true });
  await client.connect();

  const db = client.db('test1');
  const collection = db.collection('products');

  for (const id of Object.keys(features)) {
    if (id % 100000 === 0)
      console.log(id);
    const query = { id: id };
    const update = { $set: { features: features[id] } };
    await collection.updateOne(query, update).then(result => console.log(result));
  }

  await client.close();
}

Papa.parse(file, {
  dynamicTyping: true,
  beforeFirstChunk: chunk => chunk.split('\n').slice(1).join('\n'),
  complete: async results => {
    console.log("All done!");
    results.data = convertToObject(results.data)
    await addFeature(results.data);
    console.log(results.data)
  }
});

const output = {
  1:[2,3,8,7],
  2:[3,7,6,5],
  3:[5,9]
}

const output1 = {
  1: [
    {
      "feature": "Fabric",
      "value": "Canvas"
    },
    {
      "feature": "Buttons",
      "value": "Brass"
    }
  ],
  2: [
    {
      "feature": "lenses",
      "value": "Ultrasheen"
    },
    {
      "feature": "UV Protection",
      "value": null
    },
    {
      "feature": "Frames",
      "value": "LightCompose"
    }
  ]
}