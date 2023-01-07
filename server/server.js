const express = require('express');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const app = express()
const port = 3000
const DBNAME = 'test1'
mongoose.set('bufferCommands', false);
mongoose.set('strictQuery', true);
var connection;
var Product;
var Style;
var Related;

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/products/:productId/styles', (req, res) => {
  // console.log(req.params.productId)
  Style.find({productId: req.params.productId}).then(result => {
    result = {
      product_id: req.params.productId.toString(),
      results: result
    }
    res.send(result)
    return;
  })
})

app.get('/products/:productId/related', (req, res) => {
  // console.log(req.params.productId)
  Related.find({id: req.params.productId}).then(result => res.send(result[0].related))
})

app.get('/products/:productId', (req, res) => {
  // console.log(req.params.productId)
  Product.find({ id: req.params.productId }).then(result => res.send(result[0]))
})

app.listen(port, async () => {
  connection = await mongoose.createConnection(`mongodb://127.0.0.1:27017/${DBNAME}`, {minPoolSize: 50});
  const productSchema = new Schema({
    id:  String,
    name: String,
    slogan:   String,
    description: String,
    category: String,
    default_price: String,
    related: Array,
    features: Array
  });
  Product = await connection.model('Product', productSchema);
  const styleSchema = new Schema({
    style_id : Number,
    productId : Number,
    name : String,
    sale_price : Number,
    original_price : Number,
    "default?" : Boolean,
    photos : Array,
    skus: Object
  });
  Style = await connection.model('Style', styleSchema);
  const relatedSchema = new Schema({
    id: String,
    related: Array
  });
  Related = await connection.model('Related', relatedSchema, 'related');
  console.log(`Listening on port ${port}`)
})

