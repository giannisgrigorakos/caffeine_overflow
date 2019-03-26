const BaseJoi = require('joi');;
const Extension = require('joi-date-extensions');
const Joi = BaseJoi.extend(Extension);
//const {productSchema} = require('./product');
//const {shopSchema} = require('./shop');
const mongoose = require('mongoose');

const Price = mongoose.model('Price', new mongoose.Schema({
  price: {
    type: Number,
    required: true,
    minlength: 0.01 
  },
  date: {
    type: Date
  },
  productId: mongoose.Types.ObjectId,
  productName: {
    type: String,
    minlength: 1,
    maxlength: 255
  },
  productTags: {
    type: [{
      type: String,
      minlength: 1,
      maxlength: 255
    }],
    minlength: 1,
    maxlength: 20
  },
  shopId: mongoose.Types.ObjectId,  
  shopName: {
    type: String,
    minlength: 1,
    maxlength: 255
  },
  shopAddress: {
    type: String,
    minlength: 1,
    maxlength: 512
  },
  shopLat: {
    type: Number
  },
  shopLng: {
    type: Number
  },
  shopTags: {
    type: [{
      type: String,
      minlength: 1,
      maxlength: 255
    }],
    minlength: 1,
    maxlength: 20
  },
  shopDist: {
    type: Number
  }
}));

function validatePrice(price) {
  const schema = {
    price: Joi.number().min(0.01).required(),
    dateFrom: Joi.date().format('YYYY-MM-DD').required(),
    dateTo: Joi.date().format('YYYY-MM-DD').required(),
    productId: Joi.objectId().required(), 
    shopId: Joi.objectId().required()
  };

  return Joi.validate(price, schema);
}

module.exports.Price = Price;
module.exports.validatePrice = validatePrice;