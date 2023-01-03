const Papa = require('papaparse')
const fs = require('fs')
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

const databaseName = 'test1';
const collection1 = 'related';
const collection2 = 'products';
const featuresFile = 'features.csv';
const relatedFile = 'related.csv'
const productsFile = 'product.csv'

const convertToObject = (arr) => {
  console.log(new Date, 'converting features to object')
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

const groupRelated = (input) => {
  console.log(new Date, 'grouping related')
  // Create a map to store the related items for each id
  const map = new Map();
  for (const [id, groupId, relatedId] of input) {
    // If the groupId is not in the map, add it with an empty array
    if (!map.has(groupId)) {
      map.set(groupId, []);
    }
    // Add the related id to the array for the groupId
    map.get(groupId).push(relatedId);
  }
  // Convert the map to an array of objects
  const output = Array.from(map, ([groupId, related]) => ({ id: groupId, related }));
  return output;
}

async function addRelated(related) {
  await client.connect();
  const collection = client.db(databaseName).collection(collection1);
  console.log(new Date, 'inserting related')
  await collection.insertMany(related)
  await client.close();
  return;
}

const featuresParse = () => {
  console.log(new Date, 'Starting to parse features')
  const file = fs.createReadStream(featuresFile)
  Papa.parse(file, {
    dynamicTyping: true,
    beforeFirstChunk: chunk => chunk.split('\n').slice(1).join('\n'),
    complete: async results => {
      console.log(new Date, "All done feature parse!");
      results.data = convertToObject(results.data)
      productsParse(results.data)
      return;
    }
  });
}

const relatedParse = () => {
  const file = fs.createReadStream(relatedFile)
  Papa.parse(file, {
    beforeFirstChunk: chunk => chunk.split('\n').slice(1).join('\n'),
    complete: async (results) => {
      console.log(new Date, "All done reading related!");
      results.data = groupRelated(results.data)
      await addRelated(results.data)
      console.log(new Date, "added related")
      return;
    }
  });
}

const productsParse = (featuresData) => {
  const file = fs.createReadStream(productsFile)
  Papa.parse(file, {
    header: true,
    complete: async (results) => {
      console.log(new Date, "Finished reading product file");
      combine(featuresData, results.data)
      return;
    }
  });
}

const combine = async (featuresData, productsData) => {
  console.log(new Date, 'Adding features to products')
  productsData.forEach(product => {
    product['features'] = featuresData[product.id]
    return;
  })
  await client.connect()
  console.log(new Date, `Inserted products`);
  await client.db(databaseName).collection(collection2).insertMany(productsData)
  await client.close();
  console.log(new Date, 'products connecetion closed')
  return;
}

const client = new MongoClient(url, { useNewUrlParser: true });
client.connect().then(() => {
  const db = client.db(databaseName);
  return db.dropDatabase();
}).then(() => (
  console.log(new Date, `${databaseName} db dropped`)
)).then(async () => {
  await client.close()
  featuresParse()
  relatedParse()
  return;
})
