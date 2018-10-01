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
    output = document.getElementById('output');

    /*coolingLampOne = document.getElementById('cooling-lamp-one'),
    coolingLampTwo = document.getElementById('cooling-lamp-two'),
    coolingLampThree = document.getElementById('cooling-lamp-three'),
    coolingLampFour = document.getElementById('cooling-lamp-four'),
    reserveLampOne = document.getElementById('reserve-lamp-one'),
    reserveLampTwo = document.getElementById('reserve-lamp-two'),
    reserveLampThree = document.getElementById('reserve-lamp-three');*/


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
    } else {
        socket.emit('ready', {
            playerNumber: 2,
            playerName: playerName.value
        });
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

socket.on('redirectToGameScreen', function(route){
    window.location.pathname = route;
});

socket.on('test', function(data){
   console.log(data);
});