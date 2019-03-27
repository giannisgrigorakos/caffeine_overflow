# caffeine_overflow
    
    System's assumptions:
      --> A user has to be logged in, in order to post/update/patch/delete and he has to provide a valid token 
      which is returned to him when he logins in the header section under the X-OBSERVATORY-AUTH variable. He has to send it 
      in the X-OBSERVATORY-AUTH variable as well to perform the post/update/patch/delete method.
      --> A user cant really delete a product. Every product has an isActive flag set to true by default. When he 'delets it'he
      simply sets this boolean to false. The same goes for shops, too. Only the admin has the right to delete a product/shop. 
      --> All CRUD operations are HTTPS.
      --> start variable in the header takes a number of the items that is going to skip in order to start counting. 
      e.g start=2 starts counting from the third item and so on. By default the value is 0(zero).
      --> count varaible in the header takes a number and shows that many items in a single page. e.g count=20 in this page 20
      items are going to be displayed starting from index 'start'. By default the value is 20(twenty).
      --> status variable in the header has 3 options. ALL, which shows all the items, ACTIVE, which shows only the items with
      the isActive bool set to true and WITHDRAWN which shows only the items with the isActive bool set to false. By default
      the value is 'ALL'.
      --> sort variable in the header consists of 2 variables united with the '|'. The first variable has 2 options. The id and
      the name,meaning sort by id/name. The second variable is ASC or DESC for ascending or descending. By default the value 
      is id|DESC.
      --> Shops support WGS84 coordination stored in lan,for langtitude,and lng,for longtitude, variables.
      --> Prices have the same header variables as shops/products except sort. sort suppost as first variable one of the
      following options: price, which sorts the price items by the value of the price, geo.dist which sorts the price items
      by distance between the shop and the current's user location and date which sorts the price items by the date they were 
      created. The second variable is ASC or DESC and they behave as above.
      --> If the current date is bigger than the date of a price the system deletes automatically these prices.
      --> Users have the same header variables as shops/products except status which has the following options: ALL, which 
      gets all the users, ACTIVE, which gets all the users with the isActive bool set to true, NOTACTIVE which gets all the
      users with the isActive bool set to false and isAdmin which gets all the users with the isAdmin bool set to true.
      --> In users the GET /id and PUT methods can only be executed by an admin.
      --> 
    Initial installs: 
      --> First you need to install node, nodemon and MongoDB in your system.
      --> cd /path_to_index.js
      --> sudo npm i (to install the npm packages included in package.json)
      --> export caffeine_overflow_jwtPrivateKey=a_string_of_your_choice(for linux users. For windows users replace export with
      set. We do this in order to set the key that we are going to use for the encryption of the token used in authentication
      and authorization)
      --> (in an new terminal...) sudo mongod (only for linux users..windows users can skip this step because the mongo daemon
      runs automatically)
      --> nodemon (the app listens to port 8765)

    Endpoints:
      -->products:
           GET  observatory/api/products?start=&count=&status=&sort= --> get all products
           POST observatory/api/products --> create a product. The body of the product is name,description,category,tags,
           withdrawn, extraData: brand, quantity, typeOfQuantity, type.
           PUT  observatory/api/products/'id' --> update all the fields of a product
           PATCH observatory/api/products/'id'--> update certain field of a product
           DELETE observatory/api/products/'id' --> delete behaves as explained above
           GET observatory/api/products/'id'--> get information for a certain product
      -->shops:
           GET  observatory/api/shops?start=&count=&status=&sort= --> get all shops
           POST observatory/api/shops --> create a shop. The body of the shop is id,name,address,lat,lng,tags,withdrawn
           PUT  observatory/api/shops/'id' --> update all the fields of a shop
           PATCH observatory/api/shops/'id'--> update certain field of a shop
           DELETE observatory/api/shops/'id' --> delete besaves as explained above
           GET observatory/api/shops/'id'--> get information for a certain shop
      -->prices:
           GET  observatory/api/prices?start=&count=&status=&sort= --> get all prices
           POST observatory/api/prices --> create a price. The body of the price is price,date,productId,productName,
           productTags,shopId,shopName,shopAddress,shopLat,shopLng,shopTags,shopDist
      -->users:
           GET  observatory/api/users/me --> each user can get the information about himself
           POST observatory/api/users --> create a user. The body of the user is id,email,username,password,isAdmin,isActive
           PUT  observatory/api/users/'id' --> update all the fields of a user
           GET observatory/api/users/'id'--> get information for a certain user
      -->login:
           POST observatory/api/login --> a user logins. The body of the login is username and password.
      -->logout:
           returns the message ok.
