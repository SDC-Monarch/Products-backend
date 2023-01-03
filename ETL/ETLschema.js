const url = "mongodb://localhost:27017";
const mongoose = require('mongoose');

mongoose.connect(
    `${url}/test1`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const productSchema = new mongoose.Schema(
  {
    "id": Number,
    "campus": String,
    "name": String,
    "slogan": String,
    "description": String,
    "category": String,
    "default_price": Number,
    "created_at": { type: Date, default: Date.now },
    "updated_at": { type: Date, default: Date.now },
    "features": [{ any: Object }],
    "related": [{ type: Number }],
    "styles": [{ any: Object }]
  }
)

// Defining User model
const Product = mongoose.model('Product', productSchema);

// Create collection of Model
Product.createCollection().then(function (collection) {
    return console.log('Collection is created!');
    //might need a .then(close connection)
});