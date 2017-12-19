# Live Streaming Project
This is a nodejs live streaming group project with websockets and WebRTC

## Getting Started
 - Type `npm install` to install all the dependencies
 - Add .env file to the home directory which includes the following information:
    - FACEBOOK_ID
    - FACEBOOK_CLIENT_SECRET
    - CALLBACK_URL
    - GOOGLE_clientID
    - GOOGLE_clientSecret
    - GOOGLE_callbackURL
    - PORT
 - Update config.json to match PostGreSQL config information
 - Call `sequelize db:migrate` in command line to update SQL table.

Before using: 
 - Start postgresql
    - sudo service postgresql start

 - Click [here](https://www.hk-goto.com/) to test the app!

## Features
 - Direct chat with real time Video and Audio streams
 - Encrypted login with optional facebook and google+ login methods

## Built With
 - HTML/CSS/Javascript
 - jQuery 3.2.1
 - Nodejs
    - Expressjs
    - Passportjs
    - PostGreSQL
    - Redis
    - Socket.io
 - WebRTC

## Contributors
 - [Brock Wei](https://brockwei.github.io) 
 - [Michelle Bae](https://github.com/michelleb01)
 - [Isaac Yuen](https://github.com/Isaacwhyuenac)

## Acknowledgements
 - [Alex Lau](https://github.com/alexlau811) - For his guidance with this project
 - [Gordon Lau](https://github.com/gordonlau) - For his guidance with this project
 - [Michael Fung](https://github.com/MICFTK) - For his guidance with this project
 - [Shane Tully](https://shanetully.com/2014/09/a-dead-simple-webrtc-example/) - For his WebRTC tutorial 
 - [Icons8](https://icons8.com/) - For use of their icons


## Notes:
fs
bodyparser


Need to be installed:
Base:
Express
Express-Handlebars

Authentication:
Passport
Passport-Facebook
dotenv

Databases and Storage:
postgres
Sequelize //npm install --save sequelize pg@6.3.0 pg-hstore
Sequelize-cli
Redis

Websockets:
Socket.io

Needed Code:

All assets can be stored in public folder
app.use(express.static('public'));

https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
