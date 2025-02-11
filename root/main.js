const gravity = 0.061;  //The gravity of the moon. (Calculated to scale based on the sizing proportions of the Lander)
var startTime;  //Landing start time. (When the game is reset)
var endTime;    //Landing end time. (When the Lander hits the ground)
var flips= 0;   //Number of completed flips.
var flipAngle;  //Tracks the angle for the flip counter. (Goes up to 360 in either direction)
var loops = 0;  //Number of times you've looped the screen.
var doConfetti = true;  //Can confetti spawn? Can be disabled in options menu.
var drawLander = true;  //Should we continue drawing the lander?    //NOTE: Cannot be simplified into isLanded because it relies on whether or not the Lander crashed
var escDown = false;    //Prevents the options menu from spamming open/close when esc is pressed
var difficulty = 1; //Game difficulty (Defaults to normal)
var isLanded = false;   //Keeps track of whether or not the lander has landed yet
var numOfPathPoints = 360; //Number of points in the path
var pathResolution = 1; //How many subdivisions in the path

//Special messages used when you land or crash
var landingMessages = ["Well... you landed", "You do know it's supposed to be slow and straight, right?", "That's kinda good, I guess...", "Now you're getting somewhere!", "Woah, great landing!", "Almost perfect!", "Perfect, flawless, amazing!"];
var crashMessages = ["Oh so close!", "Uhhh, I think you have the wrong game", "That's... actually kind of impressive", "You smashed it to bits!", "KABOOOM!", "Who called in the ICBM?", "There is no more lander."];

//Holds the game window information
var gameWindow = {
    canvas : document.createElement("canvas"), //Holds the canvas HTML element
    start : function()
    {
        //Fit the canvas to the screen
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - 1;
        //Get the context from the canvas
        this.context = this.canvas.getContext("2d");

        //Put the canvas at the top of the body
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);

        //Start looping at 60fps
        this.interval = setInterval(loop, 16);
        //Track the frame number
        this.frameNo = 0;

        //Listen for keyboard input
        window.addEventListener('keydown', function (e) {
          gameWindow.keys = (gameWindow.keys || []);
          gameWindow.keys[e.keyCode] = true;
        })
        window.addEventListener('keyup', function (e) {
          gameWindow.keys[e.keyCode] = false;
        })
    },
    clear : function()
    { //CLear the canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function()
    { //Stop looping
        clearInterval(this.interval);
    }
}

function init ()
{

    //Get settings from cookies
    settingsString = getCookie("settings");
    if (settingsString != "")
    {
        settingArray = Array.from(settingsString);
        if (settingArray[0] == "t") {document.getElementById("confetti_check").checked = true;} else {document.getElementById("confetti_check").checked = false;}
        if (settingArray[1] == "t") {document.getElementById("music_check").checked = true;} else {document.getElementById("music_check").checked = false;}
        if (settingArray[2] == "t") {document.getElementById("simple_shade_check").checked = true;} else {document.getElementById("simple_shade_check").checked = false;}
        if (settingArray[3] == "t") {document.getElementById("epilepsy_check").checked = true;} else {document.getElementById("epilepsy_check").checked = false;}
        document.getElementById("difficulty_drop").value = parseInt(settingArray[4]);
    }
    color1String = getCookie("color1");
    color2String = getCookie("color2");
    if (color1String != "" ) {document.getElementById("color1_picker").value = color1String}
    if (color2String != "" ) {document.getElementById("color2_picker").value = color2String}
    pathPointsString = getCookie("pathPointsCookie");
    pathResolutionString = getCookie("pathResolutionCookie");
    if (pathPointsString != "" ) {document.getElementById("numOfPathPoints").value = pathPointsString}
    if (pathResolutionString != "" ) {document.getElementById("pathResolution").value = pathResolutionString}

    startTime = new Date(); //Get the run/landing start time

    flips = 0; //Reset flip count
    loops = 0; //Reset loop count

    gameWindow.start(); //Re-initialize the game window

    //NOTE: The player object is called "square" in code as a remnant from early development of the game, this is NOT intended to be fixed
    square = new Player(24, 40, 150, 120, document.getElementById("color1_picker").value, document.getElementById("color2_picker").value, true); //Make the player
    ground = new GameObject(gameWindow.canvas.width, 12, "rgb(100, 100, 100)", 0, gameWindow.canvas.height - 12); //Make the ground
    //Make the text objects
    angleText = new Text("20px Consolas", "white", 10, 50);
    angleArrow = new Arrow(260, 40, "left", 16, "white");
    accelArrow = new Arrow(260, 40, "none", 4, "black");
    speedText = new Text("20 px Consolas", "white", 10, 80);
    heightText = new Text("20px Consolas", "white", 10, 110);

    //Randomize the player position, rotation, starting speed, and starting torque
    square.angle = Math.random() > 0.5 ? Math.random() * 75 : Math.random() * -75; //Angle (-75 to 75 degrees)
    square.speedX = Math.random() > 0.5 ? Math.random() * 8 : Math.random() * -8; //Speed (-8 to 8 m/s; only in the x direction)
    square.torque = Math.random() > 0.5 ? Math.random() * 1 : Math.random() * -1; //Torque (-1 to 1 degrees/frame)
    flipAngle = square.angle; //Set the flip angle to match the starting angle
    //Position  //TODO: Make this snippet more readable, also make it properly spawn 15 pixels from BOTH edges
    var positionXRandNum;
    do {
        positionXRandNum = Math.random() * gameWindow.canvas.width - 15;
    } while (positionXRandNum < 15)
    square.x = positionXRandNum;

    //Resets the isLanded status
    isLanded = false;

    document.getElementById("info_div").style.display = "none"; //Make the landing info clear

    //Get path information
    numOfPathPoints = document.getElementById("numOfPathPoints").value;
    pathResolution = document.getElementById("pathResolution").value;
    //Path variables
    pathPoints = [];
    for (let i = 0; i < numOfPathPoints * pathResolution; i++) {
        pathPoints.push(new PathPoint(0, 0, false));
    }
    path = new Path(pathPoints, "white");

    //Confetti variable
    confettiObjs = [];

    //Generate stars randomly   //TODO: (Possibly) Add option to range stars from 0-250
    stars = [];
    for (let i = 0; i < 50; i++) {
        stars.push(new GameObject(1, 1, "white", Math.random() * gameWindow.canvas.width, Math.random() * gameWindow.canvas.height));
    }

    crashParts = []; //Will hold the crash parts when summoned
    drawLander = true; //Allows lander to be drawn again

    //Gets the current difficulty
    difficulty = document.getElementById("difficulty_drop").value;
}

function loop () { //Internal loop; runs 60 times per second
    //Clear the game window
    gameWindow.clear();
    gameWindow.frameNo += 1; //Add one to the frame counter

    //Run logic loop
    Update();

    //Redraw background stars (First as to be drawn in the background)
    stars.forEach(star => {
        star.update();
    });

    //Redraw the path if we haven't landed yet and difficulty allows it (Normal or Easy)
    if (!isLanded && difficulty <= 1) {
        path.update();
    }

    //Update each confettis' internal position and redraw
    confettiObjs.forEach(confetti => {
        confetti.newPos();
        confetti.update();
    });

    //Update player internal position and redraw (Do second to last to draw over path & confetti)
    square.newPos();
    if (drawLander) {
        square.update();
    }

    //Redraw the ground (Do last to be on top of all but text)
    ground.update();

    //Redraw the text objects if the difficulty allows it (Hard or lower)
    if (difficulty <= 2) {
        angleText.update();
        speedText.update();
        heightText.update();
    }
    //Draw the torque arrow if the difficulty allows it (Normal or Easy)
    if (difficulty <= 1) {
        angleArrow.update();
        accelArrow.update();
    }

    //Update each crash parts' position and draw it (Order doesn't matter as this only happens if the player crashed)
    crashParts.forEach(part => {
        part.newPos();
        part.update();
    });
}

function Update () { //Logic loop
    //Apply gravity to the player with difficulty scaling (75% normal gravity on Easy)
    square.speedY += gravity * (difficulty == 0 ? 0.75 : 1);

    confettiObjs.forEach(confetti => { //For each confetti
        confetti.speedY += gravity; //Apply gravity
        confetti.speedX *= 0.99; //Slow down it's horizontal speed by 1%

        //Loop across the screen
        if (confetti.x < 0) {
            confetti.x += gameWindow.canvas.width;
        }
        if (confetti.x > gameWindow.canvas.width) {
            confetti.x -= gameWindow.canvas.width;
        }
    });

    //For each crash part
    crashParts.forEach(part => {
        part.speedY += gravity * (difficulty == 0 ? 0.75 : 1); //Apply gravity (with difficulty scaling for consistency)

        //Loop across screen
        if (part.x < 0) {
            part.x += gameWindow.canvas.width;
        }
        if (part.x > gameWindow.canvas.width) {
            part.x -= gameWindow.canvas.width;
        }
    })

    //Apply user input to the Lander with difficulty scaling (75% normal accelerations on Easy), set the variables to display jet flames, and set accel arrow direction
    if (gameWindow.keys && (gameWindow.keys[38] || gameWindow.keys[87])) {square.addSpeed(0.162 * (difficulty == 0 ? 0.75 : 1)); square.isAccel=true;} else {square.isAccel=false;}
    if (gameWindow.keys && (gameWindow.keys[39] || gameWindow.keys[68])) {square.torque += 0.055 * (difficulty == 0 ? 0.75 : 1); square.isLeftRCS=true; accelArrow.changeDir("right");} else {square.isLeftRCS=false; accelArrow.changeDir("none");}
    if (gameWindow.keys && (gameWindow.keys[37] || gameWindow.keys[65])) {square.torque -= 0.055 * (difficulty == 0 ? 0.75 : 1); square.isRightRCS=true; accelArrow.changeDir("left");} else {square.isRightRCS=false;}

    //Options checks
    if (gameWindow.keys && gameWindow.keys[27]) {if (!escDown) {document.getElementById("options_div").style.display = document.getElementById("options_div").style.display == "none" ? "block" : "none"} escDown = true; HandleSettingsChange()} else {escDown = false;}
    if (document.getElementById("confetti_check").checked) {doConfetti = true;} else {doConfetti = false; confettiObjs = []}
    if (document.getElementById("music_check").checked) {document.getElementById("music").play()} else {document.getElementById("music").pause()}
    if (document.getElementById("simple_shade_check").checked) {square.color2 = square.color1;} else {square.color2 = document.getElementById("color2_picker").value;}
    if (document.getElementById("epilepsy_check").checked) {square.epilepsyMode = true;} else {square.epilepsyMode = false;}

    flipAngle += square.torque; //Add the current torque to the flip tracker angle

    //Check for flips
    if (flipAngle > 360) {
        flipAngle -= 360; //Undo the flip on the tracker
        flips += 1; //Count the flip

        if (doConfetti) {
            //Set the starting length to the current number of confettis
            startingLength = confettiObjs.length;
            //Do 50 times, starting at startingLength
            for (let i = startingLength; i < startingLength + 50; i++) {
                //Set color to be red, blue, green, or magenta randomly
                let color;
                let rand = Math.random();
                if (rand < 0.25) {
                    color = "rgb(0, 0, 220)";
                } else if (rand < 0.5) {
                    color = "rgb(0, 220, 0)";
                } else if (rand < 0.75) {
                    color = "rgb(220, 0, 180)"
                } else {
                    color = "rgb(200, 0, 0)";
                }
                //Add new confetti to the array at player's position    //NOTE: Confetti use the same object as the player for simplicity, but scaled down enough to be mostly unnoticable
                confettiObjs.push(new Player(4, 4, square.x, square.y, color));
                //Give it random x speed (half negative, half positive) and random upwards y speed
                confettiObjs[i].speedX = i % 2 == 0 ? Math.random() * 20 : Math.random() * -20;
                confettiObjs[i].speedY = Math.random() * -10;
                //Start at a random angle with random torque (half positive, half negative)
                confettiObjs[i].angle = Math.random() * 360;
                confettiObjs[i].torque = i % 2 == 0 ? Math.random() * 25 : Math.random() * -25;
            }
        }
    } else if (flipAngle < -360) {  //Same as above but for negative flips
        flipAngle += 360; //Only different line. Same purpose
        flips += 1;
        startingLength = confettiObjs.length;
        if (doConfetti) {
            for (let i = startingLength; i < startingLength + 50; i++) {
                let color;
                let rand = Math.random();
                if (rand < 0.25) {
                    color = "rgb(0, 0, 220)";
                } else if (rand < 0.5) {
                    color = "rgb(0, 220, 0)";
                } else if (rand < 0.75) {
                    color = "rgb(220, 0, 180)"
                } else {
                    color = "rgb(200, 0, 0)";
                }
                confettiObjs.push(new Player(4, 4, square.x, square.y, color));
                confettiObjs[i].speedX = i % 2 == 0 ? Math.random() * 20 : Math.random() * -20;
                confettiObjs[i].speedY = Math.random() * -10;
                confettiObjs[i].angle = Math.random() * 360;
                confettiObjs[i].torque = i % 2 == 0 ? Math.random() * 25 : Math.random() * -25;
            }
        }
    }

    var numberOfPathLoops = 0;
    //Update each path point to be the next spot the Lander would be if it continued on it's current trajectory
    for (let i = 0; i < pathPoints.length; i++) {
        if (numberOfPathLoops > 2)
        {
            //If the path has looped twice, stop drawing it
            pathPoints[i] = new PathPoint(0, 0, true);
            continue;
        }
        //Get the position of the point
        if (i != 0)
        {
            pathPoints[i] = new PathPoint(pathPoints[i - 1].x + square.speedX / pathResolution, pathPoints[i - 1].y + (square.speedY + (gravity / pathResolution) * i) / pathResolution, false);
        } else { //First point is at the Lander
            pathPoints[i] = new PathPoint(square.x, square.y, false);
        }
        
        //Check if it is out of bounds while above ground and loop across the screen if it is
        if (pathPoints[i].x > gameWindow.canvas.width && pathPoints[i].y < gameWindow.canvas.height)
        {
            pathPoints[i].x = gameWindow.canvas.width;
            i++;
            pathPoints[i] = new PathPoint(0, pathPoints[i - 1].y, true);
            numberOfPathLoops++;
        } else if (pathPoints[i].x < 0 && pathPoints[i].y < gameWindow.canvas.height) {
            pathPoints[i].x = 0;
            i++;
            pathPoints[i] = new PathPoint(gameWindow.canvas.width, pathPoints[i - 1].y, true);
            numberOfPathLoops++;
        }
    }

    //Loop player across screen
    if (square.x > gameWindow.canvas.width) {
        square.x -= gameWindow.canvas.width;
        loops++;
    } else if (square.x < 0) {
        square.x += gameWindow.canvas.width;
        loops--;
    }

    //Removes confetti that collides with the ground
    confettiObjs.forEach(confetti => {
        if (confetti.crashWith(ground) || confetti.y > gameWindow.canvas.height) {
            index = confettiObjs.indexOf(confetti);
            if (index > -1) { // only splice array when item is found
                confettiObjs.splice(index, 1); // 2nd parameter means remove one item only
            }
        }
    })

    //Detect crash part colision
    crashParts.forEach(part => {
        if (part.crashWith(ground) || part.y > gameWindow.canvas.height) {
            index = crashParts.indexOf(part);
            if (index > -1) {
                part.y -= (part.y - ground.y) - part.height / -1.8; //Bounce it with bounce decay
                part.speedY = -part.speedY * 0.65; //Slow its Y speed down
                part.speedX *= 0.75; //Slow its X speed down
                part.torque *= 0.75; //Slow down it's spinning
                part.torque += part.speedX * 0.8; //Spin it based on X speed
                part.speedX *= 0.7; //Speed decay as transitioned to torque
            }
        }
    })

    //Checks if lander collides with ground
    //TODO: Go through and comment this mess of if-statements
    if (square.crashWith(ground) || square.y > gameWindow.canvas.height) {
        document.getElementById("info_div").style.display = "block";
        if (speed < 8 && Math.abs(square.angle) < 16) {
            let score = ((8 - speed + (16 - Math.abs(square.angle))) / 24) * 100;
            document.getElementById("score_text").innerHTML = "Landing Score: " + String(Math.round(score * 10) / 10);
            var msg = "";
            if (score > 10) {
                if (score > 35) {
                    if (score > 60) {
                        if (score > 80) {
                            if (score > 90) {
                                if (score == 100) {
                                    msg = landingMessages[6];
                                } else {
                                    msg = landingMessages[5];
                                }
                            } else {
                                msg = landingMessages[4];
                            }
                        } else {
                            msg = landingMessages[3];
                        }
                    } else {
                        msg = landingMessages[2];
                    }
                } else {
                    msg = landingMessages[1];
                }
            } else {
                msg = landingMessages[0];
            }
            document.getElementById("special_header").innerHTML = msg;
            document.getElementById("time_text").innerHTML = "Time: " + String(Math.round((endTime - startTime) / 100)/10);
            document.getElementById("flips_text").innerHTML = "Flips: " + String(flips) + (doConfetti ? "" : " (Confetti was disabled in the options menu. Press \"esc\" to open it.)");
            document.getElementById("loops_text").innerHTML = "Loops: " + String(Math.abs(loops) + (loops >= 0 ? " right" : " left"));
            document.getElementById("difficulty_text").innerHTML = "Difficulty: " + (difficulty == 0 ? "Easy" : (difficulty == 1 ? "Normal" : (difficulty == 2 ? "Hard" : "Apollo")));
            square.speedX = 0;
            square.speedY = 0;
            square.torque = 0;
        } else {
            let score = Math.min(speed, Math.abs(square.angle)) / 180 * 100;
            document.getElementById("score_text").innerHTML = "Crash Score: " + String(Math.round(score * 10) / 10);
            var msg = "";
            if (score > 5) {
                if (score > 30) {
                    if (score > 65) {
                        if (score > 80) {
                            if (score > 90) {
                                if (score == 100) {
                                    msg = crashMessages[6];
                                } else {
                                    msg = crashMessages[5];
                                }
                            } else {
                                msg = crashMessages[4];
                            }
                        } else {
                            msg = crashMessages[3];
                        }
                    } else {
                        msg = crashMessages[2];
                    }
                } else {
                    msg = crashMessages[1];
                }
            } else {
                msg = crashMessages[0];
            }
            document.getElementById("special_header").innerHTML = msg;
            document.getElementById("time_text").innerHTML = "Time: " + String(Math.round((endTime - startTime) / 100)/10);
            document.getElementById("flips_text").innerHTML = "Flips: " + String(flips) + (doConfetti ? "" : " (Confetti was disabled in the options menu. Press \"esc\" to open it.)");
            document.getElementById("loops_text").innerHTML = "Loops: " + String(Math.abs(loops) + (loops >= 0 ? " right" : " left"));
            document.getElementById("difficulty_text").innerHTML = "Difficulty: " + (difficulty == 0 ? "Easy" : (difficulty == 1 ? "Normal" : (difficulty == 2 ? "Hard" : "Apollo")));
            if (!isLanded) {
                crashParts.push(new CrashPart(24, 20, square.x, square.y - (square.height / 2), square.color1, square.color2, false));
                crashParts.push(new CrashPart(24, 20, square.x, square.y + (square.height / 2), square.color1, square.color2, false));
                crashParts.push(new CrashPart(24, 20, square.x, square.y, square.color1, square.color2, true));
                crashParts.forEach(part => {
                    part.angle = square.angle;
                    part.torque = square.torque;
                    part.speedX = square.speedX + max(0.5, Math.random() * 2) * (Math.random() > 0.5 ? 1 : -1);
                    part.speedY = min(-square.speedY * 0.65, -max(0.5, Math.random() * 2));
                });
            }
            square.speedX = 0;
            square.speedY = 0;
            square.torque = 0;
            drawLander = false;
        }

        //If we haven't yet been considered to land, get the end time and set isLanded to true
        if (!isLanded) {
            endTime = new Date();
            isLanded = true;
        }
        //If space is pressed, reset the game
        if (gameWindow.keys && gameWindow.keys[32]) {
            gameWindow.stop();
            document.getElementById("info_div").style.display = "none";
            init();
        }
        //Make sure no flames are drawn
        square.isAccel = false;
        square.isLeftRCS = false;
        square.isRightRCS = false;
        //Make sure the torque arrow is set to none
        accelArrow.changeDir("none");
    }

    //Update angle text
    angleText.changeText("Angle: " + String(Math.round(square.angle * 10) / 10) + " degrees");
    //Update angle arrow direction
    angleArrow.changeDir(square.torque > 0 ? "right" : "left");
    if (square.torque == 0) {
        angleArrow.changeDir("none");
    }
    //Get total speed if it isn't yet landed.
    speed = !isLanded ? Math.round((Math.sqrt(Math.pow(square.speedY, 2) + Math.pow(square.speedX, 2))) * 10) / 10 : speed;
    //Update speed text
    speedText.changeText("Speed: " + String(speed) + "m/s");
    //Get height from ground
    height = Math.round((gameWindow.canvas.height - 5 - square.y) / 20 * 100) / 100;
    //Update height text
    heightText.changeText("Height: " + String(height) + "m");

    //Keep game window the right size
    gameWindow.canvas.width = window.innerWidth;
    gameWindow.canvas.height = window.innerHeight - 1;
    ground.width = gameWindow.canvas.width; 
}

function HandleSettingsChange () { //Set all of the settings into cookies
    settingsCookieString = "";
    if (document.getElementById("confetti_check").checked) {settingsCookieString += "t"} else {settingsCookieString += "f"}
    if (document.getElementById("music_check").checked) {settingsCookieString += "t"} else {settingsCookieString += "f"}
    if (document.getElementById("simple_shade_check").checked) {settingsCookieString += "t"} else {settingsCookieString += "f"}
    if (document.getElementById("epilepsy_check").checked) {settingsCookieString += "t"} else {settingsCookieString += "f"}
    settingsCookieString += String(document.getElementById("difficulty_drop").value);
    setCookie("settings", settingsCookieString, 9999);
    setCookie("color1", document.getElementById("color1_picker").value, 9999);
    setCookie("color2", document.getElementById("color2_picker").value, 9999);
    setCookie("pathPointsCookie", String(document.getElementById("numOfPathPoints").value), 9999);
    setCookie("pathResolutionCookie", String(document.getElementById("pathResolution").value), 9999);
}

function everyinterval(n) {
    if ((gameWindow.frameNo / n) % 1 == 0) {return true;}
    return false;
}

function max (a, b) {
    if (b > a) {
        return b;
    } else {
        return a;
    }
}

function min (a, b) {
    if (b < a) {
        return b;
    } else {
        return a;
    }
}

function setCookie(name, value, exdays) {
    const exdate = new Date(); //Date of expiration
    //Set the time to be now + expiration days
    exdate.setTime(exdate.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ exdate.toUTCString(); //Expiration time
    //Set the cookie with name, value, and expiration date provided
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}
  
function getCookie(name) {
    let cname = name + "="; //Add an "=" to the inputted name
    let decodedCookie = decodeURIComponent(document.cookie); //Decoded version of the pages cookies
    let cookieArray = decodedCookie.split(';'); //Split the pages cookies into an array
    //For each cookie
    for (let i = 0; i < cookieArray.length; i++) {
      //Track the current cookie in one variable
      let cookie = cookieArray[i];
      //Loop through the cookie until there are no spaces infront of it
      while (cookie.charAt(0) == ' ') {
        cookie = cookie.substring(1);
      }
      //If this cookie is the one we want
      if (cookie.indexOf(cname) == 0) {
        //Return the cookies value
        return cookie.substring(cname.length, cookie.length);
      }
    }
    //If it wasn't found, return an empty string
    return "";
}