const _ = require('lodash');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const {User} = require('../models/user');
const express = require('express');
const router = express.Router();


router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ username: req.body.username });     
  if (!user) return res.status(400).send('Invalid username or password.');  
  
  const validPassword = await bcrypt.compare(req.body.password, user.password); //to bcrypt pairnei to req.body.pass kai to kanei encrypt me to hash kai to sygkrinei me to user.password pou brisletai sth bash
  if (!validPassword) return res.status(400).send('Invalid username or password.');

  const token = user.generateAuthToken();
  var output = {}
  output["id"] = user._id;
  output["email"] = user.email;
  output["username"] = user.username;
  output["password"] = user.password;
  output["isAdmin"] = user.isAdmin;
  output["isActive"] = user.isActive;
  res.header('X-OBSERVATORY-AUTH', token)
  .header('Access-Control-Expose-Headers', 'X-OBSERVATORY-AUTH')
  .send(_.pick(output, ['id', 'email', 'username','isAdmin', 'isActive']));
});


function validate(req) {
  const schema = {
    username: Joi.string().min(1).max(255).required(),
    password: Joi.string().min(1).max(255).required()
  };

  return Joi.validate(req, schema);
}


module.exports = router;