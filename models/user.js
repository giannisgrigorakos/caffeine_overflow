const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const userSchema =  new mongoose.Schema({
  email: {
    type: String,
    minlength: 5,
    maxlength: 255,
    unique: true    //gia na mhn kanw users me idio email
  },
  username: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50,
    unique: true    //gia na mhn kanw users me idio onoma
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  isAdmin:  {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
   
});

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'));
  return token;
}

const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    username: Joi.string().min(1).max(50).required(),
    password: Joi.string().min(5).max(1024).required()
  };

  return Joi.validate(user, schema);
}

function change (obj) {
  var output = {};
  output["id"] = obj._id;
  output["email"] = obj.email;
  output["username"] = obj.username;
  output["isAdmin"] = obj.isAdmin;
  output["isActive"] = obj.isActive;  
  return output;
}

exports.change = change;
exports.User = User; 
exports.validateUser = validateUser;