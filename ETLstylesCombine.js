const MongoClient = require('mongodb').MongoClient;
const fs = require('fs')
const Papa = require('papaparse')

const collectionName = 'styles'
const databaseName = 'test1'
const stylesFP = 'styles.csv'
const photosFP = 'photos.csv'
const skusFP = 'skus.csv'
const url = "mongodb://localhost:27017/";



const stylesToObj = (arr) => {
  let result = {};
  arr.forEach(row => {
    result[row[0]] = row;
  })
  return result;
}

const convertToObject = (arr) => {
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

const dropCollection = (databaseName, collectionName) => {
  const client = new MongoClient(url, { useNewUrlParser: true });
  return client.connect().then(() => {
    const db = client.db(databaseName);
    return db.collection(collectionName);
  }).then(() => (
    console.log(new Date, `${collectionName} collection dropped`)
  )).then(() => (
    client.close()
  )).catch(err => console.log(err))
}

const parseStyles = () => {
  return new Promise((resolve, reject) => {
    const file = fs.createReadStream(stylesFP)
    Papa.parse(file, {
      dynamicTyping: true,
      // transform: (value, header) => {
      //   if (value === 'null')
      //     return null
      //   if (header === 'default_style' && value === '0')
      //     return false
      //   if (header === 'default_style' && value === '1')
      //     return true
      //   return value
      // },
      complete: results => {
        console.log(new Date, `Completed reading ${stylesFP}`)
        results.data = stylesToObj(results.data)
        resolve({'msg': `Completed reading ${stylesFP}`, 'data': results.data})
      },
      error: (err, errfile) => {
        reject({'msg': `Error occured will reading ${stylesFP}`, 'err': err, 'errfile': errfile})
      }
    });
 });
}

const parsePhotos = (stylesResultObj) => {
  return new Promise((resolve, reject) => {
    const file = fs.createReadStream(photosFP, { highWaterMark: Papa.LocalChunkSize })
    Papa.parse(file, {
      beforeFirstChunk: chunk => chunk.split('\n').slice(1).join('\n'),
      dynamicTyping: true,
      chunk: results => {
        results.data = convertToObject(results.data)
        stylesResultObj = addPhotos(stylesResultObj, results.data)
      },
      complete: results => {
        resolve({'msg': `Completed reading ${photosFP}`, 'data': stylesResultObj})
      },
      error: (err, errfile) => {
        reject({'msg': `Error occured will reading ${photosFP}`, 'err': err, 'errfile': errfile})
      }
    });
  });
}

const addPhotos = (stylesResultObj, photosObj) => {
  //1: [ 1, 1, 'Forest Green & Black', null, 140, 1 ] styleObj
  //for each param in photosObj
    //push the value to the styleObj[id] array
  for (const id in photosObj) {
    stylesResultObj.data[id].push(photosObj[id])
  }
}

// const parseSkus = () => {

// }

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
    parseStyles()
  )).then(stylesResultObj => {
    console.log(new Date, stylesResultObj.msg)
    console.log(stylesResultObj.data[0])
    return parsePhotos(stylesResultObj.data)
  }).then((stylesResultObj) => {
    console.log(new Date, photosResultObj.msg)
    console.log(new Date, stylesResultObj.data[0])
  }).catch(err => console.log(err))
}

main().then(() => console.log(new Date, 'Styles ETL complete')).catch(err => console.log(err))