The project located in the testing Website folder is a personal website with three sections, About, Portfolio, and Contact.

About is a brief introduction of myself, and the photos/Apps in the portfolio will be soon replaced by apps that are made by myself in the near future. I have additionally made a contact section for people who want to collaborate or hire me.
# Live Streaming Project
This is a nodejs live streaming group project with websockets

## Getting Started
 - Add .env file to the home directory which includes the following information:
    - FACEBOOK_ID
    - FACEBOOK_CLIENT_SECRET
    - CALLBACK_URL
    - GOOGLE_clientID
    - GOOGLE_clientSecret
    - GOOGLE_callbackURL
 - Update config.json to match PostGreSQL config information
 - Call `sequelize db:migrate` in command line to update SQL table.

 - Click [here](URL) to use     
 - Start postgresql
    - sudo service postgresql start

## Features


## Built With
 - HTML/CSS/Javascript
 - jQuery 3.2.1
 - Nodejs
    - Expressjs
    - Passportjs
    - Postgresql
    - Redis

## Contributors
 - [Brock Wei](https://brockwei.github.io) 
 - [Michelle Bae](https://github.com/michelleb01)
 - [Isaac Yuen](https://github.com/Isaacwhyuenac)

## Acknowledgements
 - [Gordon Lau](https://github.com/gordonlau) - For his guidance with this project
 - [Michael Fung](https://github.com/MICFTK) - For his guidance with this project
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
