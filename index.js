const cors = require('cors');
const fs = require('fs');
const https = require('https');
const config = require('config');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi); //epistrefei sunarthsh kai pername reference sto joi
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const products = require('./routes/products');
const shops = require('./routes/shops');
const prices = require('./routes/prices');
const users = require('./routes/users');
const login = require('./routes/login');
const logout = require('./routes/logout');
const express = require('express');
const app = express();

if(!config.get('jwtPrivateKey')) {
  console.log('FATAL ERROR: jwtPrivateKey is not defined.');
  process.exit(1);
}

mongoose.connect('mongodb://localhost/caffeine_overflow', { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...'));

app.use(express.json());
app.use(cors());
app.use('/observatory/api/products', products);
app.use('/observatory/api/shops', shops);
app.use('/observatory/api/prices', prices);
app.use('/observatory/api/users', users);
app.use('/observatory/api/login', login);
app.use('/observatory/api/logout',logout);

const port = process.env.PORT || 3000;

https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app)
 .listen(port, () => console.log(`Listening on port ${port}...`));