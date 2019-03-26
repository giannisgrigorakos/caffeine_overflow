const geolib = require('geolib');
const DateDiff = require('date-diff');
const date = require('date-and-time');
const auth = require('../middleware/auth');
const {Price, validatePrice} = require('../models/price');
const {Shop} = require('../models/shop');
const {Product} = require('../models/product');
const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {
  var start = req.query.start;
  if(typeof start === 'undefined') start = 0;
  else start = Number(start);

  var count = req.query.count;
  if(typeof count === 'undefined') count = 20;
  else count = Number(count);

  var geoDist = req.query.geoDist;
  var geoLng = req.query.geoLng;
  var geoLat = req.query.geoLat;
  if( (typeof geoDist !== 'undefined') && (typeof geoLng !== 'undefined') && (typeof geoLat !== 'undefined')){
    geoDist = Number(geoDist);
    geoLng = Number(geoLng);
    geoLat = Number(geoLat);
    await Price.find(function(err, docs) {
      docs.forEach(function(doc) {
        latmy = doc.shopLat; //tou ekastote shop
        lngmy = doc.shopLng;
        doc.shopDist = geolib.convertUnit('km', geolib.getDistance({latitude: latmy, longitude: lngmy}, {latitude: geoLat, longitude: geoLng}));
        doc.save(); 
      });
    });
    var query_dist = {shopDist: { $lte: geoDist}};  
  }
  else if((typeof geoDist === 'undefined') && (typeof geoLng === 'undefined') && (typeof geoLat === 'undefined')){
    var query_dist = {};
  }
  else{
    return res.status(400).send('Πρέπει να συμπληρωθούν και τα 3 πεδία σχετικά με την απόσταση ή κανένα!');
  }
  
  var check = 0;
  var dateFrom = req.query.dateFrom;
  if(typeof dateFrom === 'undefined') ++check;
  var dateTo = req.query.dateTo;
  if(typeof dateTo === 'undefined') ++check;
  if(check === 1) { //1 pedio mphke
    return res.status(400).send('Πρέπει να συμπληρωθούν και τα 2 πεδία σχετικά με την ημερομηνία ή κανένα!');   
  }
  if(check === 2) { //kanena pedio den mphke
    dateFrom = new Date(Date.now());
    dateTo = new Date(Date.now());
  }
  if(check === 0) { //kai ta 2 pedia mphkan
    dateFrom = new Date(dateFrom);
    dateTo = new Date(dateTo);
    var diff = new DateDiff(dateFrom, dateTo);
    diff = diff.days();
    if (diff < 0) {
      return res.status(400).send('DateFrom must be less');
    }
  }
  dateTo = date.addDays(dateTo, 1);
  date.format(dateFrom, 'YYYY/MM/DD');
  dateFrom.setHours(0,0,0,0);
  date.format(dateTo, 'YYYY/MM/DD');
  dateTo.setHours(0,0,0,0);
  var query_dateFrom = {date: { $gte: dateFrom}};
  var query_dateTo = {date: { $lte: dateTo}};
  
  var QshopIds = req.query.shops;
  if(typeof QshopIds === 'undefined') var query_shops = {};
  else var query_shops = {shopId: { $in: QshopIds }};

  var QproductIds = req.query.products;
  if(typeof QproductIds === 'undefined') var query_products = {};
  else var query_products = {productId: { $in: QproductIds }};

  var Qtags = req.query.tags;
  if(typeof Qtags === 'undefined') var query_tags = {};
  else var query_tags = { $or: [ {productTags: { $in: Qtags}}, {shopTags: { $in: Qtags}} ] };

  var Qsort = req.query.sort;
  if(typeof Qsort === 'undefined') var query_sort = []; //default timh
  else{
    var query_sort = [0, 0, 0];
    var i = 0;
    for (var key in Qsort){ //0->price, 1->geo.dist, 2->date 
      if(key === 'price|ASC'){
        query_sort[0] = 1;
        break;
      }
      if(key === 'price|DESC'){
        query_sort[0] = -1;
        break;
      }
      if(key === 'geo.dist|ASC'){
        query_sort[1] = 1;
        break;
      }
      if(key === 'geo.dist|DESC'){
        query_sort[1] = -1;
        break;
      }
      if(key === 'date|ASC'){
        query_sort[2] = 1;
        break;
      }
      if(key === 'date|DESC'){
        query_sort[2] = -1;
        break;
      }
    }
  }
  if(typeof Qsort === 'undefined'){  
    var prices = await Price.find()
    .and([ query_dist, query_dateFrom, query_dateTo, query_shops, query_products, query_tags])
    .sort({price: 0});
  }
  else if ((query_sort[0] !== 0) && (query_sort[1] !== 0) && (query_sort[2] !== 0)){
    var prices = await Price.find()
    .and([ query_dist, query_dateFrom, query_dateTo, query_shops, query_products, query_tags])
    .sort({price: query_sort[0], shopDist: query_sort[1], date: query_sort[2]});  
  }
  else if ((query_sort[0] !== 0) && (query_sort[1] === 0) && (query_sort[2] === 0)){
    var prices = await Price.find()
    .and([ query_dist, query_dateFrom, query_dateTo, query_shops, query_products, query_tags])
    .sort({price: query_sort[0]});  
  }
  else if ((query_sort[0] === 0) && (query_sort[1] !== 0) && (query_sort[2] === 0)){
    var prices = await Price.find()
    .and([ query_dist, query_dateFrom, query_dateTo, query_shops, query_products, query_tags])
    .sort({shopDist: query_sort[1]});  
  }
  else if ((query_sort[0] === 0) && (query_sort[1] === 0) && (query_sort[2] !== 0)){
    var prices = await Price.find()
    .and([ query_dist, query_dateFrom, query_dateTo, query_shops, query_products, query_tags])
    .sort({date: query_sort[2]});  
  }
  else{
    if ((query_sort[0] !== 0) && (query_sort[1] !== 0)){
      var prices = await Price.find()
      .and([ query_dist, query_dateFrom, query_dateTo, query_shops, query_products, query_tags])
      .sort({price: query_sort[0], shopDist: query_sort[1]});  
    }
    else if ((query_sort[0] !== 0) && (query_sort[2] !== 0)){
      var prices = await Price.find()
      .and([ query_dist, query_dateFrom, query_dateTo, query_shops, query_products, query_tags])
      .sort({price: query_sort[0], date: query_sort[2]});  
    }
    else{
      var prices = await Price.find()
      .and([ query_dist, query_dateFrom, query_dateTo, query_shops, query_products, query_tags])
      .sort({date: query_sort[2], shopDist: query_sort[1]});  
    }
  }
  const totalprices = prices.length;
  var prices = prices.slice(start, start + count);  
  res.send(
    {
      "start": start,
      "count": count,
      "total": totalprices,
      "prices": prices
    }
  );  
});

router.post('/', auth, async (req, res) => {
  const { error } = validatePrice(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  //tsekarw an einai valid to id tou shop
  const shop = await Shop.findById(req.body.shopId);
  if (!shop) return res.status(400).send('Invalid shop.');
  
  //tsekarw an einai valid to id tou product
  const product = await Product.findById(req.body.productId);
  if (!product) return res.status(400).send('Invalid product.');

  var date1 = new Date(req.body.dateFrom);
  var date2 = new Date(req.body.dateTo);

  var diff = new DateDiff(date2, date1);
  diff = diff.days();
  
  if (diff < 0) {
    return res.status(400).send('DateFrom must be less');
  }

  var newPrices = [];
  
  for(var i=0; i<=diff; i++){
    var newDate = date.addDays(date1, i);

    var price = await Price.deleteMany({$and:[
      { date: newDate },
      { productId: req.body.productId },
      { shopId: req.body.shopId }
    ]});
    var price = new Price({ 
      price: req.body.price,
      date: newDate,
      productId: req.body.productId,
      productName: product.name,
      productTags: product.tags,
      shopId: req.body.shopId,
      shopName: shop.name,
      shopAddress: shop.address,
      shopLat: shop.lat,
      shopLng: shop.lng,
      shopTags: shop.tags,
      shopDist: 0
    });
    await price.save();
    newPrices.push(price);
  }
  res.send(newPrices);
});

module.exports = router;