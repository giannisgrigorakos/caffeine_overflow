const Joi = require('joi');
const mongoose = require('mongoose');


const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255
  },
  address: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 512
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
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
  }
});

const Shop = mongoose.model('Shop', shopSchema);

function validateShop(shop) {
  const schema = {
    name: Joi.string().min(1).max(255).required(),
    address: Joi.string().min(1).max(512).required(),
    lat: Joi.number().required(),    
    lng: Joi.number().required(),    
    tags: Joi.array().min(1).max(20).required(),
    withdrawn: Joi.boolean()
  };

  return Joi.validate(shop, schema);
}

module.exports.shopSchema = shopSchema;
module.exports.Shop = Shop;
module.exports.validateShop = validateShop;
