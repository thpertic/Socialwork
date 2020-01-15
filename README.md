# Socialwork

Socialwork is a simple social network builded with the MEVN (MongoDB, Express.js, Vue.js, Node.js) stack.
I started this project because I wanted to start some full-stack web app.

### Development

Right now it's just in development, so this will be the instructions for how to test it.

In one terminal based in ```./server/``` execute
```bash
npm start
```

while in another terminal based in ```./client``` execute
```bash
npm run dev
```

If everything goes fine, you should be able to see something at: 
```bash
localhost:8080
```

If the terminal complains for some package be sure to have the following packages  install, otherwise install it with:
```bash
npm install <package-name>
```

### Packages

Server-side, these packages are used to:
* ```nodemon``` 
Automatically restarts the server after a change.
* ```mongodb.ObjectId```
Create an ObjectId.
* ```mongoose```
Connect the server to the actual db.
It also sanitize the input before querying it.
* ```express```
This is the Express.js package.
* ```body-parser```
Parse the body of the request from the client.
* ```morgan```
Log the requests.
* ```cors```
Enable Cross Origin Resource Sharing
* ```argon2```
Hash the passwords.
* ```express-session```
Create a session.
* ```cookie-parser```
Parse the cookies.
* ```connect-mongodb-session```
Store the sessions with the server in the database.

Client-side, apart from Vue.js, are used to:
* ```axios```
Make HTTP requests.

### Features
 - Signup and login creates a session 
 - Home from which you can see the posts

License
----

MIT