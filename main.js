const gravity = 0.061;
var speedUpdates = true; //Used to stop speed from changing after the landing
var startTime; //Run start time
var endTime; //Run end time
var getTime; //Bool used to stop the end time from changing after the landing
var flips; //How many flips have been done?
var flipAngle; //Tracks the angle for the flip counter
var loops = 0;
var doConfetti = true; //Should confetti spawn? Disabled by "c"
var doCrashParts = true;
var drawLander = true;

//Holds the game window information
var gameWindow = {
    canvas : document.createElement("canvas"), //Holds the canvas HTML element
    start : function() {
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
    clear : function() { //CLear the canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function() { //Stop looping
        clearInterval(this.interval);
    }
}

function init () {
    startTime = new Date(); //Get the run start time
    getTime = true; //Allow the game to end the run

    flips = 0; //Reset flip count
    loops = 0;

    gameWindow.start(); //Re-initialize the game window

    square = new Player(24, 40, "rgb(120, 120, 120)", 150, 120, true); //Make the player
    ground = new GameObject(gameWindow.canvas.width, 12, "rgb(65, 65, 65)", 0, gameWindow.canvas.height - 12); //Make the ground
    //Make the text objects
    angleText = new Text("20px Consolas", "white", 10, 50);
    angleArrow = new Arrow(260, 40, "left", 16, "white");
    accelArrow = new Arrow(260, 40, "none", 4, "black");
    speedText = new Text("20 px Consolas", "white", 10, 80);
    heightText = new Text("20px Consolas", "white", 10, 110);

    //Randomize the player position, rotation, starting speed, and starting torque
    square.angle = Math.random() > 0.5 ? Math.random() * 75 : Math.random() * -75; //Angle
    square.speedX = Math.random() > 0.5 ? Math.random() * 8 : Math.random() * -8; //Speed
    square.torque = Math.random() > 0.5 ? Math.random() * 1 : Math.random() * -1; //Torque
    flipAngle = square.angle; //Set the flip angle to match the starting angle
    //Position
    var positionXRandNum;
    do {
        positionXRandNum = Math.random() * gameWindow.canvas.width - 15;
    } while (positionXRandNum < 15)
    square.x = positionXRandNum;

    speedUpdates = true; //Allow the game to update the player speed total

    document.getElementById("info_div").style.display = "none"; //Make the landing info clear

    //Path variables
    pathPoints = [];
    for (let i = 0; i < 80; i++) {
        pathPoints.push(new PathPoint(0, 0, false));
    }
    path = new Path(pathPoints, "white");

    //Confetti variable
    confettiObjs = [];

    stars = [];
    for (let i = 0; i < 50; i++) {
        stars.push(new GameObject(1, 1, "white", Math.random() * gameWindow.canvas.width, Math.random() * gameWindow.canvas.height));
    }

    crashParts = []; //Will hold the crash parts when summoned
    doCrashParts = true;
    drawLander = true;
}

function loop () { //Internal loop
    //Clear the game window
    gameWindow.clear();
    gameWindow.frameNo += 1; //Add one to the frame counter

    //Run logic loop
    Update();

    //Redraw background stars
    stars.forEach(star => {
        star.update();
    });

    //Redraw the path
    if (drawLander) {
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

    //Redraw the ground (Do last to be on top)
    ground.update();

    //Redraw the text objects
    angleText.update();
    angleArrow.update();
    accelArrow.update();
    speedText.update();
    heightText.update();

    crashParts.forEach(part => {
        part.newPos();
        part.update();
    });
}

function Update () { //Logic loop
    //Apply gravity to the player
    square.speedY += gravity;

    confettiObjs.forEach(confetti => { //For each confetti
        confetti.speedY += gravity; //Apply gravity
        confetti.speedX *= 0.99; //Slow down it's horizontal speed

        //Loop across the screen
        if (confetti.x < 0) {
            confetti.x += gameWindow.canvas.width;
        }
        if (confetti.x > gameWindow.canvas.width) {
            confetti.x -= gameWindow.canvas.width;
        }
    });

    crashParts.forEach(part => {
        part.speedY += gravity;
        //part.speedX *= 0.99;
        //part.torque *= 0.99;

        if (part.x < 0) {
            part.x += gameWindow.canvas.width;
        }
        if (part.x > gameWindow.canvas.width) {
            part.x -= gameWindow.canvas.width;
        }
    })

    //Apply user input to the Lander and set the variables to display jet flames
    if (gameWindow.keys && (gameWindow.keys[38] || gameWindow.keys[87])) {square.addSpeed(0.162); square.isAccel=true;} else {square.isAccel=false;}
    if (gameWindow.keys && (gameWindow.keys[39] || gameWindow.keys[68])) {square.torque += 0.055; square.isLeftRCS=true; accelArrow.changeDir("right");} else {square.isLeftRCS=false; accelArrow.changeDir("none");}
    if (gameWindow.keys && (gameWindow.keys[37] || gameWindow.keys[65])) {square.torque -= 0.055; square.isRightRCS=true; accelArrow.changeDir("left");} else {square.isRightRCS=false;}
    if (gameWindow.keys && (gameWindow.keys[67])) {confettiObjs = []; doConfetti = false;}

    flipAngle += square.torque; //Add the current torque to the flip tracker angle

    //Check for flips
    if (flipAngle > 360) {
        flipAngle -= 360; //Undo the flip
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
                //Add new confetti to the array at player's position
                confettiObjs.push(new Player(4, 4, color, square.x, square.y));
                //Give it random x speed (half negative, half positive) and random upwards y speed
                confettiObjs[i].speedX = i % 2 == 0 ? Math.random() * 20 : Math.random() * -20;
                confettiObjs[i].speedY = Math.random() * -10;
                //Start at a random angle with random torque (half positive, half negative)
                confettiObjs[i].angle = Math.random() * 360;
                confettiObjs[i].torque = i % 2 == 0 ? Math.random() * 25 : Math.random() * -25;
            }
        }
    } else if (flipAngle < -360) {
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
                confettiObjs.push(new Player(4, 4, color, square.x, square.y));
                confettiObjs[i].speedX = i % 2 == 0 ? Math.random() * 20 : Math.random() * -20;
                confettiObjs[i].speedY = Math.random() * -10;
                confettiObjs[i].angle = Math.random() * 360;
                confettiObjs[i].torque = i % 2 == 0 ? Math.random() * 25 : Math.random() * -25;
            }
        }
    }

    for (let i = 0; i < pathPoints.length; i++) {
        if (i != 0) {
            pathPoints[i] = new PathPoint(pathPoints[i - 1].x + square.speedX * 5, pathPoints[i - 1].y + (square.speedY + (gravity * i * i)) * 5, false)
        } else {
            pathPoints[i] = new PathPoint(square.x, square.y, false);
        }
        if (pathPoints[i].x > gameWindow.canvas.width) {
            pathPoints[i].x = gameWindow.canvas.width;
            i++;
            pathPoints[i] = new PathPoint(0, pathPoints[i - 1].y, true);
        } else if (pathPoints[i].x < 0) {
            pathPoints[i].x = 0;
            i++;
            pathPoints[i] = new PathPoint(gameWindow.canvas.width, pathPoints[i - 1].y + (square.speedY + (gravity * i * i)) * 5, true);
        }
    }

    //Loop square across screen
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

    crashParts.forEach(part => {
        if (part.crashWith(ground) || part.y > gameWindow.canvas.height) {
            index = crashParts.indexOf(part);
            if (index > -1) {
                part.y -= (part.y - ground.y) - part.height / -1.8;
                part.speedY = -part.speedY * 0.65;
                part.speedX *= 0.75;
                part.torque *= 0.75;
                part.torque += part.speedX * 0.8;
                part.speedX *= 0.7;
            }
        }
    })

    //Checks if lander collides with ground
    if (square.crashWith(ground) || square.y > gameWindow.canvas.height) {
        document.getElementById("info_div").style.display = "block";
        if (speed < 8 && Math.abs(square.angle) < 16) {
            let score = ((8 - speed + (16 - Math.abs(square.angle))) / 24) * 100;
            document.getElementById("score_text").innerHTML = "Landing Score: " + String(Math.round(score * 10) / 10);
            if (getTime) {
                endTime = new Date();
                getTime = false;
            }
            document.getElementById("time_text").innerHTML = "Time: " + String(Math.round((endTime - startTime) / 100)/10);
            document.getElementById("flips_text").innerHTML = "Flips: " + String(flips) + (doConfetti ? "" : " (Confetti was disabled by pressing \"c\". Reload to reenable confetti)");
            document.getElementById("loops_text").innerHTML = "Loops: " + String(Math.abs(loops) + (loops >= 0 ? " right" : " left"));
            console.log("Win");
            square.speedX = 0;
            square.speedY = 0;
            square.torque = 0;
            speedUpdates = false;
        } else {
            let score = Math.min(speed, Math.abs(square.angle)) / 180 * 100;
            document.getElementById("score_text").innerHTML = "Crash Score: " + String(Math.round(score * 10) / 10);
            if (getTime) {
                endTime = new Date();
                getTime = false;
            }
            document.getElementById("time_text").innerHTML = "Time: " + String(Math.round((endTime - startTime) / 100)/10);
            document.getElementById("flips_text").innerHTML = "Flips: " + String(flips) + (doConfetti ? "" : " (Confetti was disabled by pressing \"c\". Reload to reenable confetti)");
            document.getElementById("loops_text").innerHTML = "Loops: " + String(Math.abs(loops) + (loops >= 0 ? " right" : " left"));
            if (doCrashParts) {
                crashParts.push(new CrashPart(24, 20, square.x, square.y - (square.height / 2), false));
                crashParts.push(new CrashPart(24, 20, square.x, square.y + (square.height / 2), false));
                crashParts.push(new CrashPart(24, 20, square.x, square.y, true));
                crashParts.forEach(part => {
                    part.angle = square.angle;
                    part.torque = square.torque;
                    part.speedX = square.speedX + max(0.5, Math.random() * 2) * (Math.random() > 0.5 ? 1 : -1);
                    part.speedY = min(-square.speedY * 0.65, -max(0.5, Math.random() * 2));
                });
                doCrashParts = false;
            }
            square.speedX = 0;
            square.speedY = 0;
            square.torque = 0;
            speedUpdates = false;
            drawLander = false;
            console.log("lose");
        }
        if (gameWindow.keys && gameWindow.keys[32]) {
            gameWindow.stop();
            document.getElementById("info_div").style.display = "none";
            init();
        }
        square.isAccel = false;
        square.isLeftRCS = false;
        square.isRightRCS = false;
        accelArrow.changeDir("none");
    }

    //Update angle text
    angleText.changeText("Angle: " + String(Math.round(square.angle * 10) / 10) + " degrees");
    angleArrow.changeDir(square.torque > 0 ? "right" : "left");
    if (square.torque == 0) {
        angleArrow.changeDir("none");
    }
    //Get total speed if speedUpdates are on
    speed = speedUpdates ? Math.round((Math.sqrt(Math.pow(square.speedY, 2) + Math.pow(square.speedX, 2))) * 10) / 10 : speed;
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