const Papa = require('papaparse')
const fs = require('fs')

// const big = {};

// const file1 = fs.createReadStream('skus.csv', { highWaterMark: Papa.LocalChunkSize })
// Papa.parse(file1, {
//   beforeFirstChunk: chunk => chunk.split('\n').slice(1).join('\n'),
//   dynamicTyping: true,
//   header: true,
//   complete: results => {
//     console.log("All done skus!");
//     big['skus'] = results.data;
//   },
//   chunk: results => console.log(results.data)
// });

// console.log('here')

const file2 = fs.createReadStream('sample_data/styles10.csv', { highWaterMark: Papa.LocalChunkSize })
Papa.parse(file2, {
  dynamicTyping: true,
  transform: (value, header) => {
    if (value === 'null')
      return null
    if (header === 'default_style' && value === '0')
      return false
    if (header === 'default_style' && value === '1')
      return true
    return value
  },
  complete: results => {
    console.log(results.data[0])
    console.log(results.data[1])
  }
});