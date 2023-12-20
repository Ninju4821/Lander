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
            ctx.fillStyle = "blue";
            var hitboxWidth = Math.sin(Math.abs(this.angle) * Math.PI / 180) * (this.height * 1.5 - this.width) + this.width;
            var hitboxHeight = Math.abs(Math.cos(Math.abs(this.angle) * Math.PI / 180) * (this.height * 1.5 - this.width)) + this.width;
            //Math.sin(Math.abs(this.angle) * Math.PI / 180) * (this.width - this.height * 1.5) + this.height * 1.5;
            ctx.fillRect(this.x - hitboxWidth / 2 + Math.sin(this.angle * Math.PI / 180) * 10, this.y - hitboxHeight / 2 - Math.cos(this.angle * Math.PI / 180) * 10, hitboxWidth, hitboxHeight);
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
            var hitboxWidth = Math.sin(Math.abs(this.angle) * Math.PI / 180) * (this.height * 1.5 - this.width) + this.width;
            var hitboxHeight = Math.sin(Math.abs(this.angle) * Math.PI / 180) * (this.width - this.height * 1.5) + this.height * 1.5;
            var myleft = this.x - hitboxWidth / 2 + Math.sin(this.angle * Math.PI / 180) * 10
            var myright = myleft + hitboxWidth;
            var mytop = this.y - hitboxHeight / 2 - Math.cos(this.angle * Math.PI / 180) * 10;
            var mybottom = mytop + hitboxHeight;
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

class Path {
    constructor(points, color) {
        this.points = points;
        this.update = function () {
            var ctx = gameWindow.context;
            ctx.strokeStyle = color;
            ctx.beginPath();
            this.points.forEach(point => {
                if (!point.isEdge) {
                    ctx.lineTo(point.x, point.y);
                } else {
                    ctx.moveTo(point.x, point.y);
                }
            });
            ctx.stroke();
        };
    }
}

class PathPoint {
    constructor(x, y, isEdge) {
        this.x = x;
        this.y = y;
        this.isEdge = isEdge;
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