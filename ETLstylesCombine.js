const collectionName = 'styles'
const databaseName = 'test1'
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

const dropCollection = (databaseName, collectionName) => {
  const client = new MongoClient(url, { useNewUrlParser: true });
  return client.connect().then(() => {
    const db = client.db(databaseName);
    return db.collection(collectionName);
  }).then(() => (
    console.log(new Date, `${collectionName} collection dropped`)
  )).then(() => (
    client.close()
  ))
}

// const main = async () => {
//   dropCollection(databaseName, collectionName).then(() => (
//     Promise.all([praseStyles, parsePhotos, parseSkus])
//   )).then((result) => {
//     result = combinePhotosSkusStyles(...result)
//     return mongoinsert(result)
//   }).then((res) => {
//     console.log(new Date, `Inserted ${res.insertedIds.length} styles`)
//     return
//   }).catch(err => console.log(err))
// }

const main = () => {
  return dropCollection(databaseName, collectionName).then(() => (
    console.log('fake parse')
  )).catch(err => console.log(err))
}

main().then(()=> console.log('here'))