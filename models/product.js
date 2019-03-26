const Joi = require('joi');
const mongoose = require('mongoose');

const extraDataSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255
  },
  quantity: {
    type: Number,
    required: true,
    minlength: 1,
    maxlength: 10
  },
  typeOfQuantity: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255
  },
  type: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255
  },
  description: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255
  },
  category: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255
  },
  tags: {
    type: [{
      type: String,
      required: true,
      minlength: 1,
      maxlength: 255
    }],
    required: true,
    minlength: 1,
    maxlength: 20
  },
  withdrawn: {
    type: Boolean,
    default: false
  },
  extraData: {
    type: extraDataSchema,
    required: true
  }
});

const Product = mongoose.model('Product', productSchema);

function validateProduct(product) {
  const schema = {
    name: Joi.string().min(1).max(255).required(),
    description: Joi.string().min(1).max(255).required(),
    category: Joi.string().min(1).max(255).required(),
    tags: Joi.array().min(1).max(20).required(),
    withdrawn: Joi.boolean() ,
    extraData: Joi.object({
      brand: Joi.string().min(1).max(255).required(),
      quantity: Joi.number().min(1).max(1000000000000).required(),
      typeOfQuantity: Joi.string().min(1).max(255).required(),
      type: Joi.string().min(1).max(255).required()  
    }).required()
  };

  return Joi.validate(product, schema);
}


module.exports.productSchema = productSchema;
module.exports.Product = Product;
module.exports.validateProduct = validateProduct;