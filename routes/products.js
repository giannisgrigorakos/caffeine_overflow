const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const {Product, validateProduct} = require('../models/product');
const {Price} = require('../models/price');
require('lodash');
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
  if (typeof sort === 'undefined' || sort === 'id|DESC' || sort === '') var sortParam = { _id: -1};
  else if (sort === 'id|ASC') var sortParam = { _id: 1};
  else if (sort === 'name|ASC') var sortParam = { name: 1};
  else if (sort === 'name|DESC') var sortParam = { name: -1};
  else return res.status(400).send('Λάθος τιμή για την ταξινόμηση (sort)');

  const search = req.query.search;

  if (typeof search === 'undefined' || search === '') {
    var products = await Product
      .find()
      .or([ {withdrawn: findParam1}, {withdrawn: findParam2} ])
      .sort(sortParam);
  }
  else {
    var products = await Product
      .find({ name: {$regex: ".*" + search + ".*", $options: "i"} })
      .or([ {withdrawn: findParam1}, {withdrawn: findParam2} ])
      .sort(sortParam);
  }

  const totalProducts = products.length;
  var products = products.slice(start, start + count);
  products = products.map( obj => {
    var output = {};
    output["id"] = obj._id;
    output["name"] = obj.name;
    output["description"] = obj.description;
    output["category"] = obj.category;
    output["tags"] = obj.tags;
    output["withdrawn"] = obj.withdrawn;
    output["extraData"] = obj.extraData;
    return output;
  });
  res.send(
    {
      "start": start,
      "count": count,
      "total": totalProducts,
      "products": products
    }
  );
});

router.post('/', auth, async (req, res) => {
  const { error } = validateProduct(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  var product = await Product.findOne({ name: req.body.name });
  if (product) res.status(400).send("Product already registered.");
  else {
    var product = new Product({ 
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      tags: req.body.tags,
      withdrawn: req.body.withdrawn,
      extraData: {
        brand: req.body.extraData.brand,
        quantity: req.body.extraData.quantity,
        typeOfQuantity: req.body.extraData.typeOfQuantity,
        type: req.body.extraData.type
      } 
    });
    await product.save();   //xwris const product giati to mongoose milaei me to mongodb driver kai dinei monadiko objectID
  }    
  var output = {}
  output["id"] = product._id;
  output["name"] = product.name;
  output["description"] = product.description;
  output["category"] = product.category;
  output["tags"] = product.tags;
  output["withdrawn"] = product.withdrawn;
  output["extraData"] = product.extraData;
  res.send(output);  

});

router.put('/:id', auth, async (req, res) => {
  const { error } = validateProduct(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const product = await Product.findByIdAndUpdate(req.params.id, 
    { 
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      tags: req.body.tags,
      extraData:{
        brand: req.body.extraData.brand,
        quantity: req.body.extraData.quantity,
        typeOfQuantity: req.body.extraData.typeOfQuantity,
        type: req.body.extraData.type
      } 
    }, 
    {new: true}
  );

  if (!product) return res.status(404).send('The product with the given ID was not found.');
  await Price.updateMany({'productId': {'$eq': product._id}}, 
    {
      productName: product.name, 
      productTags: product.tags
    } 
  );

  var output = {}
  output["id"] = product._id;
  output["name"] = product.name;
  output["description"] = product.description;
  output["category"] = product.category;
  output["tags"] = product.tags;
  output["withdrawn"] = product.withdrawn;
  output["extraData"] = product.extraData;
  res.send(output);  
}); 

router.patch('/:id', auth, async (req, res) => {
  
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {new: true});

  if (!product) return res.status(404).send('The product with the given ID was not found.');
  await Price.updateMany({'productId': {'$eq': product._id}}, 
    {
      productName: product.name, 
      productTags: product.tags
    } 
  );
  
  var output = {}
  output["id"] = product._id;
  output["name"] = product.name;
  output["description"] = product.description;
  output["category"] = product.category;
  output["tags"] = product.tags;
  output["withdrawn"] = product.withdrawn;
  output["extraData"] = product.extraData;
  res.send(output);  

});


router.delete('/:id', auth, async (req, res) => {
  
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).send('The product with the given ID was not found.');

  if(req.user.isAdmin) {
    const product = await Product.findByIdAndRemove(req.params.id);
    await Price.deleteMany({'productId': {'$eq': product._id}});
    res.send({ "message": "OK" });
  }
  else {
    const product = await Product.findByIdAndUpdate(req.params.id, {withdrawn: true}, {new: true});
    res.send({ "message": "OK" });
  }  
});

router.get('/:id',async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).send('The product with the given ID was not found.');

  var output = {}
  output["id"] = product._id;
  output["name"] = product.name;
  output["description"] = product.description;
  output["category"] = product.category;
  output["tags"] = product.tags;
  output["withdrawn"] = product.withdrawn;
  output["extraData"] = product.extraData;
  res.send(output);  
});



module.exports = router;