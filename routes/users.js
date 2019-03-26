const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const {User, validateUser, change} = require('../models/user');
const express = require('express');
const router = express.Router();

//getting the current user
//bazw me wste kapoios na mhn mporei na dei to id mou kai antlhsei stoixeia apo auto kai to auth gia na elegksw an exei token
router.get('/me', auth, async (req, res) => {
  //an telika exei token
  const user = await User.findById(req.user.id).select('-password').select('-__v'); //kanw exclude to password
  
  var output = {}
  output["id"] = user._id;
  output["email"] = user.email;
  output["username"] = user.username;
  output["isAdmin"] = user.isAdmin;
  output["isActive"] = user.isActive;
  res.send(_.pick(output, ['id', 'email', 'username','isAdmin', 'isActive']));
});

router.post('/', async (req, res) => {
  const { error } = validateUser(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({$or:[{ email:req.body.email },{ username:req.body.username }]});     //kanw anazhthsh sth bash mesw email
  if (user) return res.status(400).send('User already registered.');  //se periptwsh pou uparxei

  //alliws ftiaxnw enan
  user = new User(_.pick(req.body, [ 'email' ,'username', 'password'])); //bazw ta pedia pou xreiazomai giati enas malicious user mporei na mou steilei polla kai na katastrepsei th bash mou
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt); 
  await user.save();
  
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
  .send(_.pick(output, ['id', 'email', 'username','isAdmin', 'isActive']));//ekana xrhsh lodash kai epishs stelnw to token ston user mesw header wste na to apothikeusei kai thn epomenh fora pou tha xreiastei kapoio API na mporei na ginei authentication
});

router.get('/', [auth,admin], async (req, res) => {
  //an telika exei token
  
  const sort = req.query.sort;
  if (typeof sort === 'undefined' || sort === 'id|DESC' || sort === '') var sortParam = { _id: -1};
  else if (sort === 'id|ASC') var sortParam = { _id: 1};
  else if (sort === 'name|ASC') var sortParam = { name: 1};
  else if (sort === 'name|DESC') var sortParam = { name: -1};
  else return res.status(400).send('Λάθος τιμή για την ταξινόμηση (sort)');

 
  const status = req.query.status;
  if ( typeof status === 'undefined' || status === 'ALL' || status === ''){
    var param = {};
    
    var users = await User
      .find(param)
      .sort(sortParam)
      .select('-password')
      .select('-__v');

    res.send(users.map(change));
  } 
  else if (status === 'NOTACTIVE'){
    var param = {isActive: 'false'};

    var users = await User
      .find(param)
      .sort(sortParam)
      .select('-password').select('-__v');

    res.send(users.map(change));
  }
  else if (status === 'ACTIVE') {
    var param = {isActive: 'true'};
    
    var users = await User
      .find(param)
      .sort(sortParam)
      .select('-password').select('-__v');

    res.send(users.map(change));
  }
  else if (status === 'ADMIN'){
    var param = {isAdmin: 'true'};
    var users = await User
      .find(param)
      .sort(sortParam)
      .select('-password').select('-__v');

      res.send(users.map(change));
  }
  else return res.send('Λάθος τιμή για την κατάσταση (status)');
 
});

router.put('/:id', [auth,admin], async (req, res) => {
  
  var user = await User.findByIdAndUpdate(req.params.id, 
    { 
      isActive: req.body.isActive,
      isAdmin: req.body.isAdmin
    }, 
    {new: true}
  );
  if (!user) return res.status(404).send('The user with the given ID was not found.');

  var output = {}
  output["id"] = user._id;
  output["email"] = user.email;
  output["username"] = user.username;
  output["password"] = user.password;
  output["isAdmin"] = user.isAdmin;
  output["isActive"] = user.isActive;
  res.send(_.pick(output, ['id', 'email', 'username','isAdmin', 'isActive']));  

});

router.get('/:id', [auth,admin], async (req, res) => {
  
  const user = await User.findById(req.params.id).select('-password').select('-__v'); //kanw exclude to password

  var output = {}
  output["id"] = user._id;
  output["email"] = user.email;
  output["username"] = user.username;
  output["isAdmin"] = user.isAdmin;
  output["isActive"] = user.isActive;
  res.send(_.pick(output, ['id', 'email', 'username','isAdmin', 'isActive']));  

});

module.exports = router;
