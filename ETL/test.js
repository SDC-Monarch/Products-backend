const Papa = require('papaparse')
const fs = require('fs')
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

let lastDate = new Date;

const readskus = () => {
  return new Promise((resolve, reject) => {
    let big = [];

    const file1 = fs.createReadStream('skus.csv', { highWaterMark: Papa.LocalChunkSize })
    Papa.parse(file1, {
      beforeFirstChunk: chunk => chunk.split('\n').slice(1).join('\n'),
      dynamicTyping: true,
      complete: results => {
        resolve(big);
        console.log((new Date - lastDate) / 1000, "All done skus!");
        lastDate = new Date
      },
      chunk: results => {
        results.data = Array.from(results.data)
        big = big.concat(results.data)
        console.log(`Heap allocated ${Math.round(process.memoryUsage()['heapUsed']/1024/1024/1024*100)/100} GB`);
        delete results
      }
    });
  })
}

const readphotos = () => {
  return new Promise((resolve, reject) => {
    let big = [];

    const file1 = fs.createReadStream('photos.csv', { highWaterMark: Papa.LocalChunkSize })
    Papa.parse(file1, {
      beforeFirstChunk: chunk => chunk.split('\n').slice(1).join('\n'),
      dynamicTyping: true,
      complete: results => {
        console.log((new Date - lastDate) / 1000, 'Completed reading photos')
        lastDate = new Date;
        resolve(big);
      },
      chunk: results => {
        results.data = Array.from(results.data)
        big = big.concat(results.data)
        console.log(`Heap allocated ${Math.round(process.memoryUsage()['heapUsed']/1024/1024/1024*100)/100} GB`);
        delete results
      }
    });
  })
}

const readstyles = () => {
  return new Promise((resolve, reject) => {
    let big = [];
    const file1 = fs.createReadStream('styles.csv', { highWaterMark: Papa.LocalChunkSize })
    Papa.parse(file1, {
      beforeFirstChunk: chunk => chunk.split('\n').slice(1).join('\n'),
      dynamicTyping: true,
      complete: results => {
        console.log((new Date - lastDate) / 1000, "All done styles!");
        lastDate = new Date;
        resolve(big);
      },
      chunk: results => {
        results.data = Array.from(results.data)
        big = big.concat(results.data)
        console.log(`Heap allocated ${Math.round(process.memoryUsage()['heapUsed']/1024/1024/1024*100)/100} GB`);
      }
    });
  })
}

const formatphotos = (arr) => {
  console.log((new Date - lastDate) / 1000, "Formatting photos");
  lastDate = new Date;
  result = {}
  arr.forEach(row => {
    let key = row[1];
    let url = row[2];
    let thumbnail_url = row[3];
    if (!result[key]) {
      result[key] = [];
    }
    if (url === 'null')
      url = null;
    if (thumbnail_url === 'null')
      thumbnail_url = null
    result[key].push({ "thumbnail_url": thumbnail_url, "url": url });
  });
  console.log((new Date - lastDate) / 1000, "Done formatting photos");
  lastDate = new Date;
  return result
}

const formatSkus = (arr) => {
  console.log((new Date - lastDate) / 1000, "Formatting skus");
  lastDate = new Date;
  result = {}
  arr.forEach(row => {
    let sku = row[0];
    let styleId = row[1];
    let size = row[2];
    let quantity = row[3];
    if (!result[styleId]) {
      result[styleId] = {};
    }
    if (size === 'null')
      size = null;
    if (quantity === 'null')
    quantity = null
    result[styleId][sku] = {
      "quantity": quantity,
      "size": size
    };
  });
  console.log((new Date - lastDate) / 1000, "Done formatting skus");
  lastDate = new Date;
  return result
}

const combine = (styles, skus, photos) => {
  console.log((new Date - lastDate) / 1000, "Combining objects");
  lastDate = new Date;
  styles = styles.map(row => {
    return {
      "style_id": row[0],
      "productId": row[1],
      "name": row[2],
      "sale_price": (row[3] === 'null' ? null : row[3]),
      "original_price": row[4],
      "default?": (row[5] ? true : false),
      "photos": photos[row[0]],
      "skus": skus[row[0]]
    };
  })
  console.log((new Date - lastDate) / 1000, "Done combining objects");
  lastDate = new Date;
  return styles
}

const main = async () => {
  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log((new Date - lastDate) / 1000, 'Error connecting to database, exiting')
      throw err
    }
    var dbo = db.db("test1");
    dbo.collection("styles").drop(function(err, delOK) {
      if (err) {
        console.log((new Date - lastDate) / 1000, 'Error deleting styles');
	lastDate = new Date;
      }
      if (delOK) {
        console.log((new Date - lastDate) / 1000, "Collection deleted");
        lastDate = new Date;
        db.close();
      }
    });
  });
  let styles = await readstyles()
  // console.log((new Date - lastDate) / 1000, 'styles.length:', styles.length, 'styles[styles.length-1]', styles[styles.length-1])
  let skus = formatSkus(await readskus())
  // console.log((new Date - lastDate) / 1000, 'skus[1]', skus[1], 'Object.keys(skus).length', Object.keys(skus).length)
  let photos = formatphotos(await readphotos())
  // console.log((new Date - lastDate) / 1000, 'photos[1]', photos[1], 'Object.keys(photos).length', Object.keys(photos).length)
  styles = combine(styles, skus, photos)
  sku = null;
  photos = null;
  // console.log((new Date - lastDate) / 1000, styles[0])
  // console.log((new Date - lastDate) / 1000, styles[styles.length-1])
  console.log(`Heap allocated ${Math.round(process.memoryUsage()['heapUsed']/1024/1024/1024*100)/100} GB`);
  const client = new MongoClient(url, { useNewUrlParser: true });
  await client.connect();
  console.log((new Date - lastDate) / 1000, 'Connected to database')
  lastDate = new Date
  await client.db('test1').collection('styles').insertMany(styles);
  console.log((new Date - lastDate) / 1000, 'Inserted')
  lastDate = new Date
  await client.close();
  console.log((new Date - lastDate) / 1000, 'Connection closed')
  lastDate = new Date
}

main()
// node test.js --max-old-space-size=4000
