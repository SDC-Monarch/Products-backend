const Papa = require('papaparse')
const fs = require('fs')

const big = [];
const field = "heapUsed";
const mu = process.memoryUsage();
// # bytes / KB / MB / GB
const gbNow = mu[field] / 1024 / 1024 / 1024;
const gbRounded = Math.round(gbNow * 100) / 100;

console.log(`Heap allocated ${gbRounded} GB`);

const file1 = fs.createReadStream('skus.csv', { highWaterMark: Papa.LocalChunkSize })
Papa.parse(file1, {
  beforeFirstChunk: chunk => chunk.split('\n').slice(1).join('\n'),
  dynamicTyping: true,
  // header: true,
  complete: results => {
    console.log("All done skus!");
    const mu = process.memoryUsage();
    const field = "heapUsed";
    // # bytes / KB / MB / GB
    const gbNow = mu[field] / 1024 / 1024 / 1024;
    const gbRounded = Math.round(gbNow * 100) / 100;

    console.log(`Heap allocated ${gbRounded} GB`);
  },
  chunk: results => {
    results.data = Array.from(results.data)
    big.push(results.data)
    const mu = process.memoryUsage();
    const field = "heapUsed";
    // # bytes / KB / MB / GB
    const gbNow = mu[field] / 1024 / 1024 / 1024;
    const gbRounded = Math.round(gbNow * 100) / 100;

    console.log(`Heap allocated ${gbRounded} GB`);
    // console.log(results.data[0][0])
    delete results
  }
});

console.log('here')

// const file2 = fs.createReadStream('sample_data/styles10.csv', { highWaterMark: Papa.LocalChunkSize })
// Papa.parse(file2, {
//   dynamicTyping: true,
//   transform: (value, header) => {
//     if (value === 'null')
//       return null
//     if (header === 'default_style' && value === '0')
//       return false
//     if (header === 'default_style' && value === '1')
//       return true
//     return value
//   },
//   complete: results => {
//     console.log(results.data[0])
//     console.log(results.data[1])
//   }
// });

node test.js --max-old-space-size=4000