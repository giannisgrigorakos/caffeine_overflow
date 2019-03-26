# caffeine_overflow

 ~ A sophisticated REST api of an e-commerce site for selling coffee using Node.js with express.js framework and MongoDB. ~
 
--> First you need to install node, nodemon and MongoDB in your system.<br>
--> cd /path_to_index.js
--> sudo npm i (to install the npm packages included in package.json)
--> export caffeine_overflow_jwtPrivateKey=a_string_of_your_choice(for linux users. For windows users replace export with set. We do this in order to set the key that we are going to use for the encryption of the token used in authentication and authorization)
--> (in an new terminal...) sudo mongod (only for linux users..windows users can skip this step because the mongo daemon runs automatically)
--> nodemon (the app listens to port 8765)
