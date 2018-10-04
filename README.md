# SWHAM-Arduino

ABOUT
Shit We're Having A Meltdown is the third of four prototypes in the course Digital Prototyping at the University of Queensland.
This here prototype is a digital/Physical prototype of which utilises an Arduino for physical input and runs on a node server as the digital output.

HOW TO RUN
Requirements:
- Arduino
- 8 Buttons
- Wires
- 8 10k resistors
- Node.js

It is preferable to run this locally hosted on two computers whereas the hosting computer connects the Arduino. 
To do this you will have to connect both computers to a wifi that allows for localhosted environments, e.g., phone hot spot. 
Run cmd on the hosting computer and run the command 'ipconfig'. Copy the IPv4 adress and go to this filepath: 
SWHAM-Arduino/public/javascript/ to find the home.js file.
Alter the line with the following code 
from: let socket = io.connect('localhost:3000'); 
to: let socket = io.connect('youripv4adress:3000');
Now in your cmd run node app.js given that you are in the root folder of the project. This should run the server.
Open up one browser on each computer and write in the url 'youripv4adress:3000' in your browser.
At this time you should have the landing page come up on both computers. Make sure that each player selects a unique player number, as the
code will bug if there are two players with the same player number. Moreover, for each runthrough of the game, the server will have to be
restarted.

P.S: The project does not run if the Arduino controllers are wrong or not plugged in at all.
