const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

const groupStyles = async () => {
  const client = new MongoClient(url, { useNewUrlParser: true });
  await client.connect();

  const db = client.db('test1');
  let queryId = 1;
  // while (await db.collection('styles').count() > 0) {
  while (queryId < 5) {
    const cursor = db.collection('styles').find({productId: queryId})
    const arr = await cursor.toArray()
    console.log(arr)
    queryId += 1;
    // console.log(typeof result);
    // console.log(result);
  }

  // await collection.insertMany(styles).then(result => console.log(result.insertedCount));

  await client.close();
  return;
}

groupStyles();


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