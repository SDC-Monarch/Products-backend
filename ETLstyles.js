const Papa = require('papaparse')
const fs = require('fs')
const file = fs.createReadStream('styles10.csv')
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

async function addStyles(styles) {
  const client = new MongoClient(url, { useNewUrlParser: true });
  await client.connect();

  const db = client.db('test1');
  const collection = db.collection('styles');
  for (const id of Object.keys(styles)) {
    if (id % 100000 === 0)
      console.log(id);
    styles[id]['photos'] = [];
    styles[id]['skus'] = {};
  }
  await collection.insertMany(styles).then(result => console.log(result.insertedCount));

  await client.close();
}

Papa.parse(file, {
  dynamicTyping: true,
  header: true,
  transform: (value, header) => {
    if (value === 'null')
      return null
    if (header === 'default_style' && value === '0')
      return false
    if (header === 'default_style' && value === '1')
      return true
    return value
  },
  complete: async results => {
    console.log("All done!");
    await addStyles(results.data);
    // console.log(results.data)
  }
});

const output = {
  1:[2,3,8,7],
  2:[3,7,6,5],
  3:[5,9]
}

const output1 = [
  {
    "product_id": "1",
    "results": [
      {
        "style_id": 1,
        "name": "Forest Green & Black",
        "original_price": "140.00",
        "sale_price": null,
        "default?": true,
      },
      {
        "style_id": 220999,
        "name": "Desert Brown & Tan",
        "original_price": "140.00",
        "sale_price": null,
        "default?": false,
      },
      {
        "style_id": 221000,
        "name": "Ocean Blue & Grey",
        "original_price": "140.00",
        "sale_price": "100.00",
        "default?": false,
      },
      {
        "style_id": 221001,
        "name": "Digital Red & Black",
        "original_price": "140.00",
        "sale_price": null,
        "default?": false,
      },
      {
        "style_id": 221002,
        "name": "Sky Blue & White",
        "original_price": "140.00",
        "sale_price": "100.00",
        "default?": false,
      }
    ]
  }

]