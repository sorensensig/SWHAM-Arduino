let socket = io.connect('localhost:3000');

let gameIsRunning;

let cmdWinText = document.getElementById('command-window-textfield-p1');

document.onload(function(){
    socket.emit('readyToRun');
});

socket.on('runGame', function() {
    /* Sets the index file to use a css file appropriate to the users chosen player number, starts the game countdown
    and emits a request for the game to start.

    param: 'runGame'(str): checks if emit from server is 'runGame'.
    param: func(data str): contains a string with a reference to the specific css file of which the client is supposed
    to use.
    */

    gameIsRunning = true;
    /* The code snippet (3. Javascript, setTimeout loops?) below has been adapted from:
    https://stackoverflow.com/questions/22154129/javascript-settimeout-loops
    The if statement and counter variable has been changed to fit this particular case.
    */

    function start(counter){
        if(counter > 0){
            setTimeout(function(){
                cmdWinText.innerHTML += '<p><strong>' + counter + ', ' + '</strong></p></br>';
                counter--;
                start(counter);
            }, 1000);
        }
    }

    let counter = 4;
    start(counter);
    console.log('counter running p1');

    /*
    End of code snippet (3. Javascript, setTimeout loops?)
    */

    // socket.emit('getFirstCommand');
});