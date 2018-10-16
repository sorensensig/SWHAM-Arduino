const five = require('johnny-five');

let socketIdList = []; // backup socket id
let playerList = [];
let inLoopP1 = false;
let inLoopP2 = false;
let allButtons = [];
let playersReady = 0;
let checking = false;

// Player One Variables
let commandListP1 = [
    'Activate sector <b>3 cooling system</b>',
    'Activate <b>generator</b> output level <b>3</b>',
    'Activate sector <b>1 cooling system</b>',
    'Activate sector <b>4 cooling system</b>',
    'Activate <b>generator</b> output level <b>2</b>',
    'Switch off <b>generator</b> output level <b>3</b>',
    'Deactivate sector <b>1 cooling system</b>',
    'Switch off <b>generator</b> output level <b>1</b>'
];

let commandCriteriaP1 = [3, 7, 1, 4, 6, 7, 1, 5];
let commandsCompletedP1 = [];
let cmdIndexP1 = 0;
let newCommandTimerP1 = 3000;
let checkCommandTimerP1 = 0;
let checkCommandMinTimerP1 = 5000;
let checkCommandMaxTimerP1 = 8000;

// Player Two Variables
let commandListP2 = [
    'Activate <b>generator</b> output level <b>4</b>',
    'Switch off sector <b>3 cooling system</b>',
    'Activate <b>generator</b> output level <b>1</b>',
    'Switch off <b>generator</b> output level <b>4</b>',
    'Activate sector <b>2 cooling system</b>',
    'Deactivate sector <b>2 cooling system</b>',
    'Switch off <b>generator</b> output level <b>2</b>',
    'Deactivate sector <b>4 cooling system</b>'
];

let commandCriteriaP2 = [8, 3, 5, 8, 2, 2, 6, 4];
let commandsCompletedP2 = [];
let cmdIndexP2 = 0;
let newCommandTimerP2 = 3000;
let checkCommandTimerP2 = 0;
let checkCommandMinTimerP2 = 5000;
let checkCommandMaxTimerP2 = 8000;


module.exports = function(app, io) {
    /* exports the contents so that it is made a callable function.

    param: app(app obj): object instance of the express app.
    param: io(io obj): object instance of the socket.io object.
    */

    // Routes
    app.get('/', function(req, res){
        /* Route for the root file.

        param: '/'(str): string representing the root filepath.
        param: function(request obj, response obj): HTTP request and response objects.
        */

        res.render('index', {
            css_file : '/css/home.css',
            js_file : '/javascript/home.js'
        });
    });

    // Johnny-Five
    let board = new five.Board();

        // Socket connection event
        io.on('connection', function(socket) {
            /* looks for connections to the server and saves the connecting socket id on connection. Upper level function that
            contains all other communications with the clients.

            param: 'connection'(str): listens to when clients emit that they have connected to the server.
            param: func(socket obj): the socket identifier of the unique connection to the server.
            */

            console.log('made socket connection: ', socket.id + '\n');
            socketIdList.push(socket.id);
            console.log('connected sockets: ' + socketIdList + '\n');

            function setUpArduino() {
                /* Setting up the Arduino.
                */

                board.on('ready', function() {
                    /* Creating Arduino buttons with Johnny-five event listeners
                    */

                    let pinNum = 2;

                    for (let i = 0; i < 8; i++) {
                        allButtons.push(new five.Button(pinNum));

                        allButtons[i].on('press', async function () {
                            await checkCriteria(i + 1);
                        });

                        pinNum++;
                    }
                });
            }
            setUpArduino();

            function checkCriteria(btnPressed) {
                /* Checking if the button pressed is equal to the criteria of which the current command have, kn order
                to be successfully completed or not.

                param: btnPressed(int): number of which button was pressed.
                param: playerNum(int): number representing the player number.
                return: function(resolve obj): function that runs the content within it's brackets.
                */

                // button 1-4 = player 1, button 5-8 = player 2
                return new Promise(function(resolve) {
                    changeLight(btnPressed);
                    if (!checking) {
                        checking = true;
                        setTimeout(function () {
                            checking = false;
                        }, 50);
                        if (btnPressed === commandCriteriaP1[cmdIndexP1]) {
                            if (commandsCompletedP1[cmdIndexP1] === 'initiated') {
                                commandsCompletedP1[cmdIndexP1] = 'completed';
                                io.to(playerList[0].socketId).emit('taskSucceeded', 1);
                            }

                        } else if (btnPressed === commandCriteriaP2[cmdIndexP2]) {
                            if (commandsCompletedP2[cmdIndexP2] === 'initiated') {
                                commandsCompletedP2[cmdIndexP2] = 'completed';
                                io.to(playerList[1].socketId).emit('taskSucceeded', 2);
                            }

                        } else {
                            if (btnPressed < 5) {
                                if (commandsCompletedP1[cmdIndexP1] === 'initiated') {
                                    commandsCompletedP1[cmdIndexP1] = 'failed';
                                    io.to(playerList[0].socketId).emit('wrongAction', 1);
                                    setTimeout(function () {
                                        changeLight(btnPressed);
                                    }, 200);
                                }
                            } else {
                                if (commandsCompletedP2[cmdIndexP2] === 'initiated') {
                                    commandsCompletedP2[cmdIndexP2] = 'failed';
                                    io.to(playerList[1].socketId).emit('wrongAction', 2);
                                    setTimeout(function () {
                                        changeLight(btnPressed);
                                    }, 200);
                                }
                            }
                        }
                    }

                    resolve();
                });
            }

            function changeLight(lightNum) {
                /* function of which toggles a light corresponding to the button pressed.

                param: lightNum(int): number representing the number of the button pressed.
                */
                if(lightNum < 5) {
                    io.to(playerList[0].socketId).emit('toggleLight', lightNum);
                } else {
                    io.to(playerList[1].socketId).emit('toggleLight', lightNum);
                }
            }

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

                    /*
                    The code snippet (1. Sorting an array of objects based on a property value (int) [duplicate]) below
                    has been adapted from: /https://stackoverflow.com/questions/42499698/sorting-an-array-of-objects-
                    based-on-a-property-value-int
                    The code has been altered to fit the spesific purpose of sorting the array in this code.
                    */

                    await playerList.sort((a, b) => a.playerNumber - b.playerNumber);

                    /*
                    End code snippet (1. Sorting an array of objects based on a property value (int) [duplicate])
                    */

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
                    /* creates the first command and sends it to the front-end.

                    return: function(resolve): runs the content within the brackets of this function.
                    */

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
                    /* checks the first command to see if it has been finished or not.

                    return: function(resolve): runs the content within the brackets of this function.
                    */

                    return new Promise(function(resolve){
                        setTimeout(function () { // checks if the task has been completed after eight seconds.

                            // check which player
                            if (playerList[playerIndex].playerNumber === 1) {
                                if (commandsCompletedP1[cmdIndexP1] === 'initiated') {
                                    io.to(playerId).emit('taskFailed', 1);
                                    commandsCompletedP1[cmdIndexP1] = 'failed';
                                } else if(commandsCompletedP1[cmdIndexP1] === 'completed' || commandsCompletedP1[cmdIndexP1] === 'failed') {
                                    io.to(playerId).emit('getNewTask');
                                }

                            } else {
                                if (commandsCompletedP2[cmdIndexP2] === 'initiated') {
                                    io.to(playerId).emit('taskFailed', 2);
                                    commandsCompletedP2[cmdIndexP2] = 'failed';
                                } else if(commandsCompletedP2[cmdIndexP2] === 'completed' || commandsCompletedP2[cmdIndexP2] === 'failed') {
                                    io.to(playerId).emit('getNewTask');
                                }
                            }
                            resolve();
                        }, 8000);
                    });
                }

                await createFirstCommand();
                if (playerList[playerIndex].playerNumber === 1) {
                    io.to(playerId).emit('timerP1', 8000);
                } else {
                    io.to(playerId).emit('timerP2', 8000);
                }
                setTimeout(async function(){
                    await checkFirstCommand();
                }, 250);


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

                        cmdIndexP1 ++;
                        if(cmdIndexP1 <= commandListP1.length -1) {

                            function newCommandPlayerOne() {
                                return new Promise(function(resolve) {
                                    setTimeout(function(){ // gives the player a new task after three seconds.

                                        io.to(playerId).emit('newCommandP1', commandListP1[cmdIndexP1]);
                                        commandsCompletedP1[cmdIndexP1] = 'initiated';
                                        resolve();
                                    }, newCommandTimerP1);
                                });
                            }

                            function checkIfCompletedPlayerOne() {
                                return new Promise(function(resolve) {
                                    setTimeout(function() { // checks if the task has been completed after eight seconds.

                                        if(commandsCompletedP1[cmdIndexP1] === 'initiated') {
                                            io.to(playerId).emit('taskFailed', 1);
                                            commandsCompletedP1[cmdIndexP1] = 'failed';
                                        } else if(commandsCompletedP1[cmdIndexP1] === 'completed' || commandsCompletedP1[cmdIndexP1] === 'failed') {
                                            io.to(playerId).emit('getNewTask');
                                        }
                                        resolve();
                                    }, checkCommandTimerP1);
                                });
                            }

                            // change timer new command
                            newCommandTimerP1 -= 250;
                            // change timer check command
                            checkCommandMaxTimerP1 -= 500;
                            checkCommandMinTimerP1 -= 500;
                            checkCommandTimerP1 = Math.floor(Math.random() * checkCommandMaxTimerP1) + checkCommandMinTimerP1;
                            checkCommandTimerP1 =  parseInt(checkCommandTimerP1/250)*250;

                            await newCommandPlayerOne();
                            io.to(playerId).emit('timerP1', checkCommandTimerP1);
                            setTimeout(async function(){
                                await checkIfCompletedPlayerOne();
                            },250);


                        } else {
                            io.to(playerId).emit('prototypeFinished');
                        }
                        inLoopP1 = false;
                    }

                } else {
                    if (inLoopP2 === false) {
                        inLoopP2 = true;

                        cmdIndexP2 ++;
                        if (cmdIndexP2 <= commandListP2.length -1) {

                            function newCommandPlayerTwo() {
                                return new Promise(function(resolve) {
                                    setTimeout(function () { // gives the player a new task after three seconds.
                                        io.to(playerId).emit('newCommandP2', commandListP2[cmdIndexP2]);
                                        commandsCompletedP2[cmdIndexP2] = 'initiated';
                                        resolve();
                                    }, newCommandTimerP2);
                                });
                            }

                            function checkIfCompletedPlayerTwo() {
                                return new Promise(function(resolve) {
                                    setTimeout(function () { // checks if the task has been completed after eight seconds.

                                        if (commandsCompletedP2[cmdIndexP2] === 'initiated') {
                                            io.to(playerId).emit('taskFailed', 2);
                                            commandsCompletedP2[cmdIndexP2] = 'failed';
                                        } else if(commandsCompletedP2[cmdIndexP2] === 'completed' || commandsCompletedP2[cmdIndexP2] === 'failed') {
                                            io.to(playerId).emit('getNewTask');
                                        }
                                        resolve();
                                    }, checkCommandTimerP2);
                                })
                            }

                            // change timer new command
                            newCommandTimerP2 -= 250;
                            // change timer check command
                            checkCommandMinTimerP2 -= 500;
                            checkCommandMaxTimerP2 -= 500;
                            checkCommandTimerP2 = Math.floor(Math.random() * checkCommandMaxTimerP2) + checkCommandMinTimerP2;
                            checkCommandTimerP2 =  parseInt(checkCommandTimerP2/250)*250;

                            await newCommandPlayerTwo();
                            io.to(playerId).emit('timerP2', checkCommandTimerP2);
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

/* REFERENCE LIST GAMECONTROLLER.JS

 1. stackoverflow(2017)Sorting an array of objects based on a property value (int) [duplicate]. Retrieved from:
  /https://stackoverflow.com/questions/42499698/sorting-an-array-of-objects-based-on-a-property-value-int

*/
