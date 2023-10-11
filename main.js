const gravity = 0.075;

var gameWindow = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 1024;
        this.canvas.height = 640;
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
    gameWindow.start();
    square = new Player(30, 50, "grey", 150, 120);
    ground = new GameObject(gameWindow.canvas.width, 5, "light_grey", 0, gameWindow.canvas.height - 5);
    text = new Text("20px Consolas", "black", 10, 50);
}

function loop () {
    gameWindow.clear();
    gameWindow.frameNo += 1;
    Update();
    square.newPos();
    square.update();
    ground.update();
    text.update();
}

function Update () {
    square.speedY += gravity;
    if (gameWindow.keys && (gameWindow.keys[38] || gameWindow.keys[87])) {square.addSpeed(0.275) }
    if (gameWindow.keys && (gameWindow.keys[37] || gameWindow.keys[65])) {square.torque -= 0.05 }
    if (gameWindow.keys && (gameWindow.keys[39] || gameWindow.keys[68])) {square.torque += 0.05 }
    if (square.x > gameWindow.canvas.width) {
        square.x -= gameWindow.canvas.width;
    } else if (square.x < 0) {
        square.x += gameWindow.canvas.width;
    }
    if (square.crashWith(ground)) {
        gameWindow.stop();
    }
    text.changeText("Angle: " + String(square.angle));
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