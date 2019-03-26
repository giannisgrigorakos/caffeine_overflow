const jwt = require('jsonwebtoken');    
const config = require('config');

function auth(req, res, next) {
  const token = req.header('X-OBSERVATORY-AUTH');
  if(!token) return res.status(401).send('Access denied. No token provided');

  try{
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    req.user = decoded;
    next();
  }
  catch (ex) {
    res.status(400).send('Invalid token.');   //xrhsimopoiw 400 bad request giati exw lathos dedomena
  }
}

module.exports = auth;