const five = require('johnny-five');

let socketIdList = []; // backup socket id
let playerList = [];
let inLoopP1 = false;
let inLoopP2 = false;
let allButtons = [];
let playersReady = 0;

// Player One Variables
let commandListP1 = ['Activate safety valve one', 'Activate sector 3 cooling system', 'Activate sector 1 cooling system',
    'Activate safety valve two', 'Activate safety valve four', 'Activate sector 2 cooling system',
    'Activate safety valve three', 'Activate sector 4 cooling system'];
let commandCriteriaP1 = [1, 2, 3, 4, 5, 6, 7, 8];
let commandsCompletedP1 = [];
let cmdIndexP1 = 0;

// Player Two Variables
let commandListP2 = ['Activate generator output level three', 'Activate top reserve', 'activate middle reserve',
    'Activate generator output level one', 'Activate bottom reserve', 'Activate generator output level four',
    'Activate generator output level two'];
let commandCriteriaP2 = [1, 2, 3, 4, 5, 6, 7, 8];
let commandsCompletedP2 = [];
let cmdIndexP2 = 0;


module.exports = function(app, io) {

    // Routes
    app.get('/', function(req, res){
        res.render('index', {
            css_file : '/css/home.css',
            js_file : '/javascript/home.js'
        });
    });

    /*
    app.get('/player-one', function(req, res){
       res.render('player_one', {
           css_file : '/css/player_one.css',
           js_file : '/javascript/home.js'
       })
    });

    app.get('/player-two', function(req, res){
        res.render('player_two', {
            css_file : '/css/player_two.css',
            js_file : '/javascript/home.js'
        })
    });*/


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

                    io.to(playerList[0].socketId).emit('changeScreen', 'css/player_one.css');
                    io.to(playerList[1].socketId).emit('changeScreen', 'css/player_two.css');
                }
            });

            socket.on('readyToRun', function(){
                playersReady ++;

                if(playersReady === 2) {
                    io.to(playerList[0].socketId).emit('runGame');
                    io.to(playerList[1].socketId).emit('runGame');
                }
            });

            socket.on('getFirstCommand', async function() {
                /* Sends the first command to the clients after five seconds and checks back after five seconds if the task
                has been completed or not, if not emits that command has been failed.

                param: 'getFirstCommand'(str): listens to the clients emit of 'getFirstCommand'.
                param: func(no param): runs the code below.
                */

                let playerIndex = await checkPlayerNumber(socket.id);
                let playerId = playerList[playerIndex].socketId;


                function createFirstCommand() {
                    return new Promise(function(resolve){
                        setTimeout(function () { // starts the function content after five seconds.

                            if (playerList[playerIndex].playerNumber === 1) {
                                io.to(playerId).emit('newCommandP1', commandListP1[cmdIndexP1]);
                                commandsCompletedP1[0] = 'initiated';

                            } else {
                                io.to(playerId).emit('newCommandP2', commandListP2[cmdIndexP2]);
                                commandsCompletedP2[0] = 'initiated';
                            }
                            resolve();
                        }, 5000);
                    });
                }

                function checkFirstCommand() {
                    return new Promise(function(resolve){
                        setTimeout(function () { // checks if the task has been completed after five seconds.

                            // check which player
                            if (playerList[playerIndex].playerNumber === 1) {
                                if (commandsCompletedP1[cmdIndexP1] === 'initiated') {
                                    io.to(playerId).emit('taskFailed');
                                    commandsCompletedP1[cmdIndexP1] = 'failed';
                                } // else do nothing as the task has been completed.

                            } else {
                                if (commandsCompletedP2[cmdIndexP2] === 'initiated') {
                                    io.to(playerId).emit('taskFailed');
                                    commandsCompletedP2[cmdIndexP2] = 'failed';
                                } // else do nothing as the task has been completed.
                            }
                            resolve();
                        }, 10000);
                    });
                }

                await createFirstCommand();
                await checkFirstCommand();

            });

            socket.on('commandCompleted', async function() {
                /* function that filters through the tasks that have been completed by the clients and sends a new one after
                two seconds, and checks back if that very same task has been completed five seconds after that again.

                param: 'commandCompleted'(str): listens to emits from the clients of type 'commandCompleted'.
                param: func(no param): runs the code below.
                */

                let playerIndex = checkPlayerNumber(socket.id);
                let playerId = playerList[playerIndex].socketId;

                if (playerList[playerIndex].playerNumber === 1) {

                    if(inLoopP1 === false) {
                        inLoopP1 = true;

/*                        if (commandsCompletedP1[cmdIndexP1] === 'initiated') {
                            commandsCompletedP1[cmdIndexP1] = 'completed';
                            io.to(playerId).emit('taskSucceeded');
                        }*/

                        cmdIndexP1 ++;
                        if(cmdIndexP1 <= commandListP1.length -1) {

                            function newCommandPlayerOne() {
                                return new Promise(function(resolve) {
                                    console.log('playerOne - new Command');
                                    setTimeout(function(){ // gives the player a new task after two seconds.

                                        io.to(playerId).emit('newCommandP1', commandListP1[cmdIndexP1]);
                                        commandsCompletedP1[cmdIndexP1] = 'initiated';
                                        resolve();
                                    }, 5000);
                                });
                            }

                            function checkIfCompletedPlayerOne() {
                                return new Promise(function(resolve) {
                                    console.log('playerOne - is task completed?');
                                    setTimeout(function() { // checks if the task has been completed after five seconds.

                                        if(commandsCompletedP1[cmdIndexP1] === 'initiated') {
                                            io.to(playerId).emit('taskFailed');
                                            commandsCompletedP1[cmdIndexP1] = 'failed';
                                        } // else do nothing as the task has been completed.
                                        resolve();
                                    }, 10000);
                                });
                            }

                            await newCommandPlayerOne();
                            await checkIfCompletedPlayerOne();

                        } else {
                            io.to(playerId).emit('prototypeFinished');
                        }
                        inLoopP1 = false;
                    }

                } else {
                    if (inLoopP2 === false) {
                        inLoopP2 = true;
/*                        if (commandsCompletedP2[cmdIndexP2] === 'initiated') {
                            commandsCompletedP2[cmdIndexP2] = 'completed';
                            io.to(playerId).emit('taskSucceeded');
                        }*/

                        cmdIndexP2 ++;
                        if (cmdIndexP2 <= commandListP2.length -1) {

                            function newCommandPlayerTwo() {
                                return new Promise(function(resolve) {
                                    setTimeout(function () { // gives the player a new task after two seconds.
                                        io.to(playerId).emit('newCommandP2', commandListP2[cmdIndexP2]);
                                        commandsCompletedP2[cmdIndexP2] = 'initiated';
                                        resolve();
                                    }, 5000);
                                });
                            }

                            function checkIfCompletedPlayerTwo() {
                                return new Promise(function(resolve) {
                                    setTimeout(function () { // checks if the task has been completed after five seconds.

                                        if (commandsCompletedP2[cmdIndexP2] === 'initiated') {
                                            io.to(playerId).emit('taskFailed');
                                            commandsCompletedP2[cmdIndexP2] = 'failed';
                                        } // else do nothing as the task has been completed.
                                        resolve();
                                    }, 10000);
                                })
                            }

                            await newCommandPlayerTwo();
                            await checkIfCompletedPlayerTwo();


                        } else {
                            io.to(playerId).emit('prototypeFinished');
                        }
                    }
                    inLoopP2 = false;
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
    return new Promise(function(resolve) {
        if (btnPressed === commandCriteriaP1[cmdIndexP1]) {
            if (commandsCompletedP1[cmdIndexP1] === 'initiated') {
                commandsCompletedP1[cmdIndexP1] = 'completed';
                io.to(playerList[0].socketId).emit('taskSucceeded');
            }

        } else if (btnPressed === commandCriteriaP2[cmdIndexP2]) {
            if (commandsCompletedP2[cmdIndexP2] === 'initiated') {
                commandsCompletedP2[cmdIndexP2] = 'completed';
                io.to(playerList[1].socketId).emit('taskSucceeded');
            }

        } else {
            // wrong choice
            if (playerNum === 1) {
                io.to(playerList[0].socketId).emit('wrongAction');
            } else {
                io.to(playerList[1].socketId).emit('wrongAction');
            }
        }
        resolve();
    });

}
