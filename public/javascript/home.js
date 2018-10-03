/* A big portion of this app has been created with the framework socket.io, a reference to this framework can be found
along with the source for the first code snippet in the file APP.JS*/

/*The code snippet (1. Connect to localhost:3000 from another computer | expressjs, nodejs [duplicate]) below has been
sourced from:
https://stackoverflow.com/questions/30712141/connect-to-localhost3000-from-another-computer-expressjs-nodejs
The code snippet appears in its original form.
*/

// Make connection
//http://localhost:3000
let socket = io.connect('localhost:3000');

/*
End code snippet (1. Connect to localhost:3000 from another computer | expressjs, nodejs [duplicate])
*/

let playerName = document.getElementById('player-name'),
    btnReady = document.getElementById('btn-ready'),
    btnStart = document.getElementById('btn-start-game'),
    output = document.getElementById('output'),
    cssFile = document.getElementById('css-file'),
    cmdWinTextP1 = document.getElementById('command-window-textfield-p1'),
    coolingLampOne = document.getElementById('cooling-lamp-one'),
    coolingLampTwo = document.getElementById('cooling-lamp-two'),
    coolingLampThree = document.getElementById('cooling-lamp-three'),
    coolingLampFour = document.getElementById('cooling-lamp-four'),
    cmdWinTextP2 = document.getElementById('command-window-textfield-p2'),
    genLampOne = document.getElementById('generator-lamp-one'),
    genLampTwo = document.getElementById('generator-lamp-two'),
    genLampThree = document.getElementById('generator-lamp-three'),
    genLampFour = document.getElementById('generator-lamp-four');

let gameIsRunning = false;
let taskCriteriaP1 = '';
let taskCriteriaP2 = '';
let playerNumber = 0;
let checkingP1 = false;
let checkingP2 = false;


// LANDING PAGE
btnReady.addEventListener('click', function() {
    /* When the 'ready' button is clicked by a user, the player number is checked and details consisting of player name
    and player number are sent to the server.

    param: 'click'(str): checks if the event is a click event.
    param: func(no param): on click executes the following function.
    */

    let checkedOption = '';
    try {
        /*
        The code snippet (2. How to get the selected radio button’s value?) below has been adapted from:
        https://stackoverflow.com/questions/9618504/how-to-get-the-selected-radio-button-s-value
        I have altered the name="options" part of this code to fit with this code's names.
        */

        checkedOption = document.querySelector('input[name="options"]:checked').value.toString();

        /*
        End of code snippet (2. How to get the selected radio button’s value?)
        */

    } catch {
        checkedOption = 'player-one';
    }

    if(checkedOption === 'player-one') {
        socket.emit('ready', {
            playerNumber: 1,
            playerName: playerName.value
        });
        playerNumber = 1;
    } else {
        socket.emit('ready', {
            playerNumber: 2,
            playerName: playerName.value
        });
        playerNumber = 2;
    }
});

socket.on('addPlayerToOutput', function(data){
    /* When the server emits 'addPlayerToOutput' to the clients, the clients disable the player option that has already
    been chosen and appends the player number and name to the screen for all clients to see.

    param: 'addToPlayers'(str): checks if emit from server is 'addPlayerToOutput'.
    param: func(data obj): includes playerNumber(int) and playerName(str) key value pairs.
    */

    if(data.playerNumber === 1) {
        document.getElementById('player-option-one').disabled = true;
    } else {
        document.getElementById('player-option-two').disabled = true;
    }

    output.innerHTML += '<p><strong>' + 'Player ' + data.playerNumber + ': ' + data.playerName + '</strong></p>';
});

socket.on('changeScreen', function(data){
    cssFile.setAttribute("href", data);
        socket.emit('readyToRun');
});

// GAME SCREEN - SHARED
socket.on('runGame', async function() {
    /* Sets the index file to use a css file appropriate to the users chosen player number, starts the game countdown
    and emits a request for the game to start.

    param: 'runGame'(str): checks if emit from server is 'runGame'.
    param: func(data str): contains a string with a reference to the specific css file of which the client is supposed
    to use.
    */

    /* The code snippet (3. Javascript, setTimeout loops?) below has been adapted from:
    https://stackoverflow.com/questions/22154129/javascript-settimeout-loops
    The if statement and counter variable has been changed to fit this particular case.
    */

    function start(counter){
        if(counter > 0){
            setTimeout(function(){
                cmdWinTextP1.innerHTML += '<p class="countdown"><strong>' + counter + ', ' + '</strong></p></br>';
                cmdWinTextP2.innerHTML += '<p class="countdown"><strong>' + counter + ', ' + '</strong></p></br>';
                counter--;
                start(counter);
            }, 1000);
        }
    }

    let counter = 4;
    await start(counter);

    /*
    End of code snippet (3. Javascript, setTimeout loops?)
    */

    socket.emit('getFirstCommand');
});

// GAME SCREEN PLAYER ONE
socket.on('newCommandP1', function(command, criteria) {
    /* Receives a new command and a criteria to fulfill that command from the server and renders it to the player one
    screen.

    param: 'newCommandP1'(str): checks if emit from server is newCommandP1'.
    param: func(command str, criteria str): function with two string params that include a string that contains the
    information of which the player is about to do, and a string that includes the correct answer to the command.
    */

    cmdWinTextP1.innerHTML += '<p class="blue"> > ' + command + '</p><br/>';
    scrollP1();
    taskCriteriaP1 = criteria;
});

/*function checkCriteriaP1(actionEvent) {
    /!* Checks to see if the button pressed was the correct one in regards to solving the given command.

    param: 'actionEvent'(str): the string element from the button clicked to be compared with the solution.
    *!/

    if (checkingP1 === false) {
        checkingP1 = true;
        if (actionEvent === taskCriteriaP1) {
            socket.emit('commandCompleted');
            setTimeout(function(){
                checkingP1 = false;
            }, 2000);
        } else {
            checkingP1 = false;
            // increase heat level or something for being wrong.
        }
    }
}*/


// GAME SCREEN PLAYER TWO
socket.on('newCommandP2', function(command, criteria) {
    /* Receives a new command and a criteria to fulfill that command from the server and renders it to the player two
    screen.

    param: 'newCommandP2'(str): checks if emit from server is newCommandP1'.
    param: func(command str, criteria str): function with two string params that include a string that contains the
    information of which the player is about to do, and a string that includes the correct answer to the command.
    */

    cmdWinTextP2.innerHTML += '<p class="blue"> > ' + command + '</p><br/>';
    scrollP2();
    taskCriteriaP2 = criteria;
});

/*function checkCriteriaP2(actionEvent) { // SET TO BACK END ------------------------------------------
    /!* Checks to see if the button pressed was the correct one in regards to solving the given command.

    param: 'actionEvent'(str): the string element from the button clicked to be compared with the solution.
    *!/

    if (checkingP2 === false) {
        checkingP2 = true;
        if(actionEvent === taskCriteriaP2) {
            socket.emit('commandCompleted');
            setTimeout(function(){
                checkingP2 = false;
            }, 2000);
        } else {
            checkingP2 = false;
            // increase heat level or something for being wrong.
        }
    }
}*/

socket.on('taskFailed', function() {
    /* Renders a string in red 'Task failed' to the appropriate player's screen.

    param: 'taskFailed'(str): listening to when the server emits 'taskFailed'.
    param: func(no param): function as a parameter, where the code underneath is run whenever socket.on('taskFailed) is
    emitted from the server.
    */

    // FEATURE IDEA: Set fail condition, e.g., increase heat level or something
    if (playerNumber === 1) {
        cmdWinTextP1.innerHTML += '<p class="red wide-text"> > Task failed </p><br/>';
        scrollP1();
    } else {
        cmdWinTextP2.innerHTML += '<p class="red wide-text"> > Task failed </p><br/>';
        scrollP2();
    }

    socket.emit('commandCompleted'); // MAYBE SET TO BACK END -------------------------------------------
});

socket.on('getNewTask', function(){
   socket.emit('commandCompleted');
});

socket.on('taskSucceeded', function() {
    /* Renders a string in green when a task has been successfully completed.

    param: 'taskSucceeded'(str): listens to the server for it's emit of 'taskSucceeded'.
    param: func(no param): runs the code beneath.
    */

    if (playerNumber === 1) {
        cmdWinTextP1.innerHTML += '<p class="green wide-text"> > Task successful </p><br/>';
        scrollP1();
    } else {
        cmdWinTextP2.innerHTML += '<p class="green wide-text"> > Task successful </p><br/>';
        scrollP2();
    }

});

// Somehow fires multiple times (2-4 times).
/*socket.on('wrongAction', function(){
    if (playerNumber === 1) {
        cmdWinTextP1.innerHTML += '<p class="red wide-text"> > Incorrect Action Performed </p><br/>';
        scrollP1();
    } else {
        cmdWinTextP2.innerHTML += '<p class="red wide-text"> > Incorrect Action Performed </p><br/>';
        scrollP2();
    }
});*/

socket.on('toggleLight', function(lightNum) {
    switch(lightNum) {
        case 1:
            if (coolingLampOne.src.match("-grey")) {
                coolingLampOne.src = coolingLampOne.src.replace("-grey", "-yellow");
            } else {
                coolingLampOne.src = coolingLampOne.src.replace("-yellow", "-grey");
            }
            break;
        case 2:
            if (coolingLampTwo.src.match("-grey")) {
                coolingLampTwo.src = coolingLampTwo.src.replace("-grey", "-yellow");
            } else {
                coolingLampTwo.src = coolingLampTwo.src.replace("-yellow", "-grey");
            }
            break;
        case 3:
            if (coolingLampThree.src.match("-grey")) {
                coolingLampThree.src = coolingLampThree.src.replace("-grey", "-yellow");
            } else {
                coolingLampThree.src = coolingLampThree.src.replace("-yellow", "-grey");
            }
            break;
        case 4:
            if (coolingLampFour.src.match("-grey")) {
                coolingLampFour.src = coolingLampFour.src.replace("-grey", "-yellow");
            } else {
                coolingLampFour.src = coolingLampFour.src.replace("-yellow", "-grey");
            }
            break;
        case 5:
            if (genLampOne.src.match("-grey")) {
                genLampOne.src = genLampOne.src.replace("-grey", "-yellow");
            } else {
                genLampOne.src = genLampOne.src.replace("-yellow", "-grey");
            }
            break;
        case 6:
            if (genLampTwo.src.match("-grey")) {
                genLampTwo.src = genLampTwo.src.replace("-grey", "-yellow");
            } else {
                genLampTwo.src = genLampTwo.src.replace("-yellow", "-grey");
            }
            break;
        case 7:
            if (genLampThree.src.match("-grey")) {
                genLampThree.src = genLampThree.src.replace("-grey", "-yellow");
            } else {
                genLampThree.src = genLampThree.src.replace("-yellow", "-grey");
            }
            break;
        case 8:
            if (genLampFour.src.match("-grey")) {
                genLampFour.src = genLampFour.src.replace("-grey", "-yellow");
            } else {
                genLampFour.src = genLampFour.src.replace("-yellow", "-grey");
            }
            break;
    }
});


socket.on('prototypeFinished', function() {
    /* Renders a string in black to inform the user when the prototyping is completed.

    param: 'prototypeFinished(str): listens to the server for it's emit of 'prototypeFinished'.
    param: func(no param): runs the code beneath.
    */

    if (playerNumber === 1) {
        cmdWinTextP1.innerHTML += '<p> > Prototype Finished </p><br/>';
        scrollP1();
    } else {
        cmdWinTextP2.innerHTML += '<p> > Prototype Finished </p><br/>';
        scrollP2();
    }

});

function scrollP1() {
    /* Scrolls the command window of player one down to the bottom.*/

    /* The code snippet (4. Scroll to bottom of div?) below has been altered from:
    https://stackoverflow.com/questions/270612/scroll-to-bottom-of-div
    The variables calling the scrollTop has been altered from the original example.
    */

    cmdWinTextP1.scrollTop = cmdWinTextP1.scrollHeight - cmdWinTextP1.clientHeight;
}

function scrollP2() {

    cmdWinTextP2.scrollTop = cmdWinTextP2.scrollHeight - cmdWinTextP2.clientHeight;
}