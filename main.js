const gravity = 0.061;
var speedUpdates = true;
var startTime;
var endTime;
var getTime;
var flips;
var flipAngle;

var gameWindow = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = window.innerWidth - 5;
        this.canvas.height = window.innerHeight - 5;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(loop, 16);
        this.frameNo = 0;
        window.addEventListener('keydown', function (e) {
          gameWindow.keys = (gameWindow.keys || []);
          gameWindow.keys[e.keyCode] = true;
        })
        window.addEventListener('keyup', function (e) {
          gameWindow.keys[e.keyCode] = false;
        })
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function() {
        clearInterval(this.interval);
    }
}

function init () {
    startTime = new Date();
    getTime = true;
    flips = 0;
    gameWindow.start();
    square = new Player(24, 40, "grey", 150, 120);
    ground = new GameObject(gameWindow.canvas.width, 5, "black", 0, gameWindow.canvas.height - 5);
    angleText = new Text("20px Consolas", "black", 10, 50);
    speedText = new Text("20 px Consolas", "black", 10, 80);
    heightText = new Text("20px Consolas", "black", 10, 110);

    square.angle = Math.random() > 0.5 ? Math.random() * 75 : Math.random() * -75;
    square.speedX = Math.random() > 0.5 ? Math.random() * 8 : Math.random() * -8;
    square.torque = Math.random() > 0.5 ? Math.random() * 1 : Math.random() * -1;
    flipAngle = square.angle;
    var positionXRandNum;
    do {
        positionXRandNum = Math.random() * gameWindow.canvas.width - 15;
    } while (positionXRandNum < 15)

    square.x = positionXRandNum;

    speedUpdates = true;

    document.getElementById("info_div").style.display = "none";

    path1 = new GameObject(5, 5, "grey", 0, 0);
    path2 = new GameObject(5, 5, "grey", 0, 0);
    path3 = new GameObject(5, 5, "grey", 0, 0);

    confettiObjs = [];
}

function loop () {
    gameWindow.clear();
    gameWindow.frameNo += 1;
    Update();
    square.newPos();
    path1.x = square.x + square.speedX * 10;
    path2.x = path1.x + square.speedX * 10;
    path3.x = path2.x + square.speedX * 10;
    path1.y = square.y + (square.speedY + (gravity * 1)) * 10;
    path2.y = path1.y + (square.speedY + (gravity * 2)) * 10;
    path3.y = path2.y + (square.speedY + (gravity * 3)) * 10;
    if (path1.x > gameWindow.canvas.width) {
        path1.x -= gameWindow.canvas.width;
    } else if (path1.x < 0) {
        path1.x += gameWindow.canvas.width;
    }
    if (path2.x > gameWindow.canvas.width) {
        path2.x -= gameWindow.canvas.width;
    } else if (path2.x < 0) {
        path2.x += gameWindow.canvas.width;
    }
    if (path3.x > gameWindow.canvas.width) {
        path3.x -= gameWindow.canvas.width;
    } else if (path3.x < 0) {
        path3.x += gameWindow.canvas.width;
    }
    square.update();
    ground.update();
    angleText.update();
    speedText.update();
    heightText.update();
    path1.update();
    path2.update();
    path3.update();
    confettiObjs.forEach(confetti => {
        confetti.newPos();
        confetti.update();
    });
}

function Update () {
    square.speedY += gravity;
    confettiObjs.forEach(confetti => {
        confetti.speedY += gravity;
        confetti.speedX *= 0.95;
    })
    if (gameWindow.keys && (gameWindow.keys[38] || gameWindow.keys[87])) {square.addSpeed(0.162) }
    if (gameWindow.keys && (gameWindow.keys[37] || gameWindow.keys[65])) {square.torque -= 0.055 }
    if (gameWindow.keys && (gameWindow.keys[39] || gameWindow.keys[68])) {square.torque += 0.055 }
    flipAngle += square.torque;
    if (flipAngle > 360) {
        flipAngle -= 360;
        flips += 1;
        startingLength = confettiObjs.length;
        for (let i = startingLength; i < startingLength + 50; i++) {
            let color;
            if (i % 3 == 0) {
                color = "blue";
            } else if (i % 2 == 0) {
                color = "green";
            } else {
                color = "red";
            }
            confettiObjs.push(new Player(4, 4, color, square.x, square.y));
            confettiObjs[i].speedX = i % 2 == 0 ? Math.random() * 20 : Math.random() * -20;
            confettiObjs[i].speedY = Math.random() * -10;
            confettiObjs[i].angle = Math.random() * 360;
            confettiObjs[i].torque = i % 2 == 0 ? Math.random() * 25 : Math.random() * -25;
        }
    } else if (flipAngle < -360) {
        flipAngle += 360;
        flips += 1;
        startingLength = confettiObjs.length;
        for (let i = startingLength; i < startingLength + 50; i++) {
            let color;
            if (i % 3 == 0) {
                color = "blue";
            } else if (i % 2 == 0) {
                color = "green";
            } else {
                color = "red";
            }
            confettiObjs.push(new Player(4, 4, color, square.x, square.y));
            confettiObjs[i].speedX = i % 2 == 0 ? Math.random() * 20 : Math.random() * -20;
            confettiObjs[i].speedY = Math.random() * -10;
            confettiObjs[i].angle = Math.random() * 360;
            confettiObjs[i].torque = i % 2 == 0 ? Math.random() * 25 : Math.random() * -25;
            if (i == 500) {
                confettiObjs[i].color = "orange";
                confettiObjs[i].width = 50;
                confettiObjs[i].height = 50;
            }
        }
    }
    angleText.changeText("Angle: " + String(Math.round(square.angle * 10) / 10) + " degrees");
    speed = speedUpdates ? Math.round((Math.sqrt(Math.pow(square.speedY, 2) + Math.pow(square.speedX, 2))) * 10) / 10 : speed;
    speedText.changeText("Speed: " + String(speed) + "m/s");
    height = Math.round((gameWindow.canvas.height - 5 - square.y) / 20 * 100) / 100;
    heightText.changeText("Height: " + String(height) + "m");
    if (square.x > gameWindow.canvas.width) {
        square.x -= gameWindow.canvas.width;
    } else if (square.x < 0) {
        square.x += gameWindow.canvas.width;
    }
    confettiObjs.forEach(confetti => {
        if (confetti.crashWith(ground) || confetti.y > gameWindow.canvas.height) {
            index = confettiObjs.indexOf(confetti);
            if (index > -1) { // only splice array when item is found
                confettiObjs.splice(index, 1); // 2nd parameter means remove one item only
            }
        }
    })
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
            document.getElementById("flips_text").innerHTML = "Flips: " + String(flips);
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
            document.getElementById("flips_text").innerHTML = "Flips: " + String(flips);
            square.color = "red";
            square.speedX = 0;
            square.speedY = 0;
            square.torque = 0;
            speedUpdates = false;
            console.log("lose");
        }
        if (gameWindow.keys && gameWindow.keys[32]) {
            gameWindow.stop();
            document.getElementById("info_div").style.display = "none";
            init();
        }
    }
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