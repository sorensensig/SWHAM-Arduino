# SWHAM-Arduino

## ABOUT
Shit We're Having A Meltdown is the third out of four prototype deliverables in the course Digital Prototyping at the University of Queensland.
This prototype is a Digital/Physical prototype that utilises an Arduino for physical input which is sent to a local node.js server that utilises 
socket.io to render the digital output in the two connected clients.

## HOW TO RUN
### Requirements:
- Arduino
- 8 Buttons
- Wires
- 8 10k resistors
- Node.js

Build two controllers following the breadboard image, download the codebase and connect the arduino to the host computer.

It is preferable to run this locally hosted with two connected computers, where the host connects to the Arduino. 
Both computers will have to connect to a wifi that allows for localhosted environments, e.g., home internet or phone hotspot. 
Open cmd on the host computer and run the command 'ipconfig'. Copy the IPv4 adress and go to this filepath: 
SWHAM-Arduino/public/javascript/ to find the home.js file.
Alter the line with the following code 
from: let socket = io.connect('localhost:3000'); 
to: let socket = io.connect('youripv4adress:3000');
Now, in your cmd run the command 'npm install' and wait for it to be finished. Then run the command 'node app.js', given that you are in the root folder of the project. This should run the server.
Open up one browser on each computer and write in the url 'youripv4adress:3000' in your browser.
At this time you should have the landing page come up on both computers. Make sure that each player selects a unique player number as the
code will bug if there are two players with the same player number. Moreover, for each runthrough of the game, the server will have to be
restarted.

P.S: The project does not run if the Arduino controllers are faulty or not plugged in at all.
