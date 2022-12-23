const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

const groupStyles = async () => {
  const client = new MongoClient(url, { useNewUrlParser: true });
  await client.connect();

  const db = client.db('test1');
  let queryId = 1;
  let documentsLeft = await db.collection('styles').count() > 0
  while (documentsLeft) {
    const cursor = db.collection('styles').find({productId: queryId})
    const arr = await cursor.toArray()
    const initalObj = {
      "product_id": queryId,
      "results": []
    }
    arr.forEach(style => {
      initalObj.results.push({
        "style_id": style.id,
        "name": style.name,
        "original_price": style.original_price,
        "sale_price": style.sale_price,
        "default?": style.default_style,
        "photos": style.photos,
        "skus": style.skus
      })

    })
    await db.collection('styles2').insertOne(initalObj)
    await db.collection('styles').deleteMany({productId: queryId})
    queryId += 1;
    documentsLeft = await db.collection('styles').count() > 0
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