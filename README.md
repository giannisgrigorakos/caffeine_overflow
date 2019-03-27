# caffeine_overflow

 <br>~ A sophisticated REST api of an e-commerce site for selling coffee using Node.js with express.js framework and MongoDB. ~<br>
    
    System's assumptions:
    --> A user has to be loged in in order to post/update/patch/delete a product
    --> A user cant really delete a product. Every product has an isActive flag set to true by default. When he 'delets it' he
    simply sets this boolean to false. The same goes for shops, too. Only the admin has the right to delete a product/shop. 
    --> 
    ==================================================================
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

    =================================================================
    Endpoints:
    
    
