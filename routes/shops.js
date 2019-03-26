const {Shop, validateShop} = require('../models/shop');
const admin = require('../middleware/admin');
const {Price} = require('../models/price');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {
  var start = req.query.start;
  if(typeof start === 'undefined' || start === '') start = 0;
  else start = Number(start);

  var count = req.query.count;
  if(typeof count === 'undefined' || count === '') count = 20;
  else count = Number(count);

  const status = req.query.status;
  if ( typeof status === 'undefined' || status === 'ALL' || status === ''){
    var findParam1 = true;
    var findParam2 = false;
  }
  else if (status === 'WITHDRAWN'){
    var findParam1 = true;
    var findParam2 = true;
  }
  else if (status ==='ACTIVE'){
    var findParam1 = false;
    var findParam2 = false;
  }
  else return res.status(400).send('Λάθος τιμή για την κατάσταση (status)');

  const sort = req.query.sort;
  if (typeof sort === 'undefined' || sort === 'id|DESC'|| sort === '') var sortParam = { _id: -1};
  else if (sort === 'id|ASC') var sortParam = { _id: 1};
  else if (sort === 'name|ASC') var sortParam = { name: 1};
  else if (sort === 'name|DESC') var sortParam = { name: -1};
  else return res.status(400).send('Λάθος τιμή για την ταξινόμηση (sort)');

  const search = req.query.search;

  if (typeof search === 'undefined'|| search === '') {
    var shops = await Shop
      .find()
      .or([ {withdrawn: findParam1}, {withdrawn: findParam2} ])
      .sort(sortParam);
  }
  else{ 
    var shops = await Shop
      .find( { name: {$regex: ".*" + search + ".*", $options: "i"} })
      .or([ {withdrawn: findParam1}, {withdrawn: findParam2} ])
      .sort(sortParam);
  }
  
  const totalShops = shops.length;
  var shops = shops.slice(start, start + count);
  shops = shops.map( obj => {
    var output = {};
    output["id"] = obj._id;
    output["name"] = obj.name;
    output["address"] = obj.address;
    output["lat"] = obj.lat;
    output["lng"] = obj.lng;
    output["tags"] = obj.tags;
    output["withdrawn"] = obj.withdrawn;
    return output;
  });

  res.send(
    {
      "start": start,
      "count": count,
      "total": totalShops,
      "shops": shops
    }
  );
});

router.post('/', auth, async (req, res) => {
  const { error } = validateShop(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  var shop = await Shop.findOne({$and:[
    { name: req.body.name },
    { lat: req.body.lat },
    { lng: req.body.lng }
    ]});
  if (shop) res.status(400).send("Shop already registered.");  
  else{
    var shop = new Shop({ 
      name: req.body.name,
      address: req.body.address,
      lat: req.body.lat,
      lng: req.body.lng,
      tags: req.body.tags,
      withdrawn: req.body.withdrawn
    });
    await shop.save();   //xwris const shop giati to mongoose milaei me to mongodb driver kai dinei monadiko objectID
    
    var output = {};
    output["id"] = shop._id;
    output["name"] = shop.name;
    output["address"] = shop.address;
    output["lat"] = shop.lat;
    output["lng"] = shop.lng;
    output["tags"] = shop.tags;
    output["withdrawn"] = shop.withdrawn;
    res.send(output);
  }
});

router.put('/:id', auth, async (req, res) => {
  const { error } = validateShop(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const shop = await Shop.findByIdAndUpdate(req.params.id, 
    { 
      name: req.body.name,
      address: req.body.address,
      lat: req.body.lat,
      lng: req.body.lng,
      tags: req.body.tags
    }, 
    {new: true}
  );

  if (!shop) return res.status(404).send('The shop with the given ID was not found.');
  await Price.updateMany({'shopId': {'$eq': shop._id}}, 
    {
      shopName: req.body.name, 
      shopTags: req.body.tags, 
      shopAddress: req.body.address,
      shopLat: req.body.lat, 
      shopLng: req.body.lng
    } 
  );

  var output = {};
  output["id"] = shop._id;
  output["name"] = shop.name;
  output["address"] = shop.address;
  output["lat"] = shop.lat;
  output["lng"] = shop.lng;
  output["tags"] = shop.tags;
  output["withdrawn"] = shop.withdrawn;
  res.send(output);
}); 

router.patch('/:id', auth, async (req, res) => {
  
  const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, {new: true});

  if (!shop) return res.status(404).send('The shop with the given ID was not found.');
  await Price.updateMany({'shopId': {'$eq': shop._id}}, 
    {
      shopName: shop.name, 
      shopTags: shop.tags, 
      shopAddress: shop.address,
      shopLat: shop.lat, 
      shopLng: shop.lng
    } 
  );
  
  var output = {};
  output["id"] = shop._id;
  output["name"] = shop.name;
  output["address"] = shop.address;
  output["lat"] = shop.lat;
  output["lng"] = shop.lng;
  output["tags"] = shop.tags;
  output["withdrawn"] = shop.withdrawn;
  res.send(output);
});

router.delete('/:id', auth, async (req, res) => {
  
  const shop = await Shop.findById(req.params.id);
  if (!shop) return res.status(404).send('The shop with the given ID was not found.');

  if(req.user.isAdmin) {
    const shop = await Shop.findByIdAndRemove(req.params.id);
    await Price.deleteMany({'shopId': {'$eq': shop._id}});
    res.send({ "message": "OK" });
  }   
  else {
    const shop = await Shop.findByIdAndUpdate(req.params.id, {withdrawn: true}, {new: true});
    res.send({ "message": "OK" });
  }
});

router.get('/:id', async (req, res) => {
  const shop = await Shop.findById(req.params.id);
  if (!shop) return res.status(404).send('The shop with the given ID was not found.');
  
  var output = {};
  output["id"] = shop._id;
  output["name"] = shop.name;
  output["address"] = shop.address;
  output["lat"] = shop.lat;
  output["lng"] = shop.lng;
  output["tags"] = shop.tags;
  output["withdrawn"] = shop.withdrawn;
  res.send(output);
});



module.exports = router;