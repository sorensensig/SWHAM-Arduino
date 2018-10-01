const express = require('express');
const app = express();
const server =  require('http').createServer(app);
const io = require('socket.io').listen(server);
const gameController = require('./controllers/gameController');

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

gameController(app, io);

server.listen(3000, '0.0.0.0', function() {
    console.log('listening to requests on port 3000');
});
