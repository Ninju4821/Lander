class GameObject {
    constructor(width, height, color, x, y) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.update = function () {
            var ctx = gameWindow.context;
            //ctx.save();
            //ctx.translate(this.x, this.y);
            //ctx.rotate(this.angle * Math.PI / 180);
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            //ctx.restore();
        };
    }
}

class Player {
    constructor(width, height, color, x, y) {
        this.width = width;
        this.height = height;
        this.speedX = 0;
        this.speedY = 0;
        this.torque = 0;
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.color = color;
        this.update = function () {
            var ctx = gameWindow.context;
            //ctx.fillStyle = "blue";
            //ctx.fillRect(this.x - (this.width / 2), this.y - (this.height / 2), this.width, this.height);
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.beginPath();
            ctx.moveTo(this.width / -2, this.height / -2);
            ctx.lineTo(0, -this.height);
            ctx.lineTo(this.width / 2, this.height / -2);
            ctx.lineTo(this.width / 2, this.height / 2);
            ctx.lineTo(this.width / -2, this.height / 2);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        };
        this.addSpeed = function(speed) {
            this.speedX += speed * Math.sin(this.angle * Math.PI / 180);
            this.speedY -= speed * Math.cos(this.angle * Math.PI / 180);
        };
        this.newPos = function () {
            this.x += this.speedX;
            this.y += this.speedY;
            this.angle += this.torque;
            if (this.angle > 180) {
                this.angle = this.angle - 360;
            }
            if (this.angle < -180) {
                this.angle = 360 + this.angle;
            }
        };
        this.crashWith = function (otherobj) {
            var myleft = this.x - (this.width / 2);
            var myright = this.x + (this.width / 2);
            var mytop = this.y - (this.height / 2);
            var mybottom = this.y + (this.height / 2);
            var otherleft = otherobj.x;
            var otherright = otherobj.x + (otherobj.width);
            var othertop = otherobj.y;
            var otherbottom = otherobj.y + (otherobj.height);
            var crash = true;
            if ((mybottom < othertop) ||
                (mytop > otherbottom) ||
                (myright < otherleft) ||
                (myleft > otherright)) {
                crash = false;
            }
            return crash;
        };
    }
}

class Text {
    constructor(font, color, x, y) {
        this.x = x;
        this.y = y;
        this.text = "";
        this.font = font;
        this.update = function() {
            var ctx = gameWindow.context;
            ctx.font = this.font;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        }
        this.changeText = function(text) {
            this.text = text;
        }
    }
}