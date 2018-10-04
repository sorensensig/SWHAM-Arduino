/* A big portion of this app has been created with the framework socket.io, a reference to this framework can be found
along with the source for the first code snippet as can be seen below this text.*/

/*
The code snippet (1. What Socket.iO is, Express.js - Static Files) below has been adapted from
https://socket.io/docs/
AND
https://www.youtube.com/watch?v=8lY9u3JFr5I
The code has been adapted from these sources and mixed together.
*/

// App Setup

const express = require('express');
const app = express();
const server =  require('http').createServer(app);
const io = require('socket.io').listen(server);
const gameController = require('./controllers/gameController');

/*
End code snippet (1. What Socket.IO is, Express.js - Static Files)
*/

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Static files & Routing
/* The code snippet (2. 3- Making Multiplayer HTML5 Game: Multiple WebSocket Connections. NodeJs Tutorial Guide) below
has been sourced from:
https://www.youtube.com/watch?v=_GioD4LpjMw
The code snippet appears in its original form.
*/

app.use(express.static(__dirname + '/public'));

/*
End code snippet (2. 3- Making Multiplayer HTML5 Game: Multiple WebSocket Connections. NodeJs Tutorial Guide)
*/

gameController(app, io);

/*The code snippet (3. Connect to localhost:3000 from another computer | expressjs, nodejs [duplicate]) below has been
sourced from:
// https://stackoverflow.com/questions/30712141/connect-to-localhost3000-from-another-computer-expressjs-nodejs
The appears in its original form.
*/

server.listen(3000, '0.0.0.0', function() {
    console.log('listening to requests on port 3000');
});

/*
End code snippet (3. Connect to localhost:3000 from another computer | expressjs, nodejs [duplicate])
*/


/* REFERENCE LIST APP.JS

1. socket io(n.d)What Socket.iO is. Retrieved from:
https://socket.io/docs/

1. Nodecasts(2016)Express.js - Static Files. Retrieved from:
https://www.youtube.com/watch?v=8lY9u3JFr5I

2. RainingChain(2016)3- Making Multiplayer HTML5 Game: Multiple WebSocket Connections. NodeJs Tutorial Guide. Retrieved
from: https://www.youtube.com/watch?v=_GioD4LpjMw

3. Stackoverflow(2015)Connect to localhost:3000 from another computer | expressjs, nodejs [duplicate]. Retrieved from:
https://stackoverflow.com/questions/30712141/connect-to-localhost3000-from-another-computer-expressjs-nodejs


GLOBAL REFERENCES USED
Express(n.d.)Express. Retrieved from: http://expressjs.com/
Bocoup(n.d.)Johnny-Five. Retrieved from: http://johnny-five.io/
Nodemon(2018)Nodemon. Retrieved from: https://www.npmjs.com/package/nodemon
Socket.io(n.d.)Socket.io. Retrieved from: https://socket.io/
ejs(n.d.)ejs. Retrieved from: http://ejs.co/
Bootstrap(n.d.)getBootstrap. Retrieved from: http://getbootstrap.com/
Node.js Foundation(n.d.)Node.js. Retrieved from: https://nodejs.org/en/
*/