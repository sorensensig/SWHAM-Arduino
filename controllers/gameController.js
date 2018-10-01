const five = require('johnny-five');

let socketIdList = []; // backup socket id
let playerList = [];

let allButtons = [];

let gameReady = 0;

let taskCriteriaP1;
let taskCriteriaP2;

module.exports = function(app, io) {

    // Routes
    app.get('/', function(req, res){
        res.render('index', {
            css_file : '/css/home.css',
            js_file : '/javascript/home.js'
        });
    });

    app.get('/player-one', function(req, res){
       res.render('player_one', {
           css_file : '/css/player_one.css',
           js_file : '/javascript/playerOne.js'
       })
    });

    app.get('/player-two', function(req, res){
        res.render('player_two', {
            css_file : '/css/player_two.css',
            js_file : '/javascript/playerTwo.js'
        })
    });

    // Johnny Five
    let board = new five.Board(/*{
        port: "COM3" // COM5 on laptop, COM3 on desktop.
    }*/);

    board.on('ready', function(){

        // Creating Arduino buttons with Johnny-five event listeners
        let pinNum = 2;

        for (let i=0; i < 8; i++) {
            allButtons.push(new five.Button(pinNum));
            let playerNum = 1;

            if (i > 4) {
                playerNum = 2;
            }

            allButtons[i].on('down', async function(){
                await checkCriteria(i+1, playerNum);
            });

            pinNum++;
        }


        // Socket connection event
        io.on('connection', function(socket) {
            console.log('made socket connection: ', socket.id + '\n');

            socketIdList.push(socket.id);
            console.log('connected sockets: ' + socketIdList + '\n');

            // Socket Listener events
            socket.on('ready', async function(data) {
                /* Receives message from client when the user clicks the ready button. Adds user data to player list, sends
                player information back to both clients, and when both players are listed sends data on which css file the
                individual client should use.

                param: 'ready'(str): listens to the clients emit on when the user clicks the ready button.
                param: func(data obj): contains the data playerName(str) and playerNumber(int).
                */

                console.log('\n' + playerList + '\n');

                playerList.push(new Player(socket.id, data.playerName, data.playerNumber));

                console.log(playerList);

                io.sockets.emit('addPlayerToOutput', data);

                if(playerList.length === 2) {
                    // https://stackoverflow.com/questions/42499698/sorting-an-array-of-objects-based-on-a-property-value-int
                    await playerList.sort((a, b) => a.playerNumber - b.playerNumber);

                    io.to(playerList[0].socketId).emit('redirectToGameScreen', '/player-one');
                    io.to(playerList[1].socketId).emit('redirectToGameScreen', '/player-two');

                    /*for (let i in playerList) {
                        if (playerList[i].playerNumber === 1) {
                            io.to(playerList[i].socketId).emit('runGame', dataPlayerOne);

                        } else if (playerList[i].playerNumber === 2) {
                            io.to(playerList[i].socketId).emit('runGame', dataPlayerTwo);
                        }
                    }*/
                }
            });

            socket.on('readyToRun', function(){
                gameReady ++;

                if(gameReady === 2) {
                    io.to(playerList[0].socketId).emit('runGame');
                    io.to(playerList[1].socketId).emit('runGame');
                }
            });

            socket.on('disconnect', function(socket){
                /* When the client disconnects from the server. Removes the socket id from the socketIdList.
                FEATURE IDEA: Does not account for a game that has been finished yet.

                param: 'disconnect'(str): listens to when clients emit that they have disconnected from the server.
                param: func(socket obj): the socket identifier of the unique connection to the server that is to be disconnected.
                */

                let index = socketIdList.indexOf(socket.id);
                socketIdList.splice(index, 1);

                for (let i in playerList) {
                    if (socket.id === playerList[i].socketId) {
                        playerList.splice(i, 1);
                    }
                }
            });
        });
    });
};

function Player(socketId, playerName, playerNumber) {
    /* Constructor for the object Player.

    param: socketId(str): unique identifier of that specific object.
    param: playerName(str): the name of which the user has written down.
    param: playerNumber(int): the selected player number of the user.
    */
    this.socketId = socketId;
    this.playerName = playerName;
    this.playerNumber = playerNumber;
}

function checkPlayerNumber(id) {
    /* Checks the player number of the incoming emit and returns said number.

    param: id(str): id number that needs to be checked with playerNumber.
    return: noName(int): returns playerNumber that belongs to id.
    */

    for (let i in playerList) {
        if(playerList[i].socketId === id) {
            return i;
        }
    }
}

function checkCriteria(btnPressed, playerNum) {
    if (btnPressed === taskCriteriaP1) {
        // run command completed p1
    } else if (btnPressed === taskCriteriaP2) {
        // run command completed p2
    } else {
        // wrong choice
        if (playerNum === 1) {
            io.to(playerList[0].socketId).emit('wrongCommand');
        } else {
            io.to(playerList[1].socketId).emit('wrongCommand');
        }
    }
}
