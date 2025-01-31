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
    constructor(width, height, x, y, color1, color2="#000000", isLander = false) {
        this.width = width;
        this.height = height;
        this.speedX = 0;
        this.speedY = 0;
        this.torque = 0;
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.color1 = color1;
        this.color2 = color2;
        this.isAccel = false;
        this.isLeftRCS = false;
        this.isRightRCS = false;
        this.isLander = isLander;
        this.epilepsyMode = false;
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
            if (this.isLander) {
                const grd = ctx.createLinearGradient(this.width / -2, 0, 12, 0);
                grd.addColorStop(0, this.color1);
                grd.addColorStop(0.8, this.color2);
                ctx.fillStyle = grd;
            } else {
                ctx.fillStyle = this.color1;
            }
            ctx.fill();
            if (this.isAccel && this.isLander) {
                if (this.epilepsyMode) {
                    ctx.beginPath();
                    ctx.moveTo(this.width / -2, this.height / 2);
                    ctx.lineTo(this.width / 2, this.height / 2);
                    ctx.lineTo(0, this.height * 1.75);
                    ctx.closePath();
                    ctx.fillStyle = "red";
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    ctx.moveTo(this.width / -2, this.height / 2);
                    ctx.lineTo(this.width / 2, this.height / 2);
                    ctx.lineTo(0, this.height * 1.75 * max(0.75, Math.random()));
                    ctx.closePath();
                    ctx.fillStyle = Math.random() < 0.5 ? "red" : (Math.random() < 0.75 ? "orange" : "yellow");
                    ctx.fill();
                }
            }
            if (this.isLeftRCS && this.isLander) {
                if (this.epilepsyMode) {
                    ctx.beginPath();
                    ctx.moveTo(this.width / -2, this.height / -2);
                    ctx.lineTo(this.width * -1.5, this.height * -0.4);
                    ctx.lineTo(this.width / -2, this.height * -0.3);
                    ctx.closePath();
                    ctx.fillStyle = "red";
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    ctx.moveTo(this.width / -2, this.height / -2);
                    ctx.lineTo(this.width * -1.5 * max(0.75, Math.random()), this.height * -0.4);
                    ctx.lineTo(this.width / -2, this.height * -0.3);
                    ctx.closePath();
                    ctx.fillStyle = Math.random() < 0.5 ? "red" : (Math.random() < 0.75 ? "orange" : "yellow");
                    ctx.fill();
                }
            }
            if (this.isRightRCS && this.isLander) {
                if (this.epilepsyMode) {
                    ctx.beginPath();
                    ctx.moveTo(this.width / 2, this.height / -2);
                    ctx.lineTo(this.width * 1.5, this.height * -0.4);
                    ctx.lineTo(this.width / 2, this.height * -0.3);
                    ctx.closePath();
                    ctx.fillStyle = "red";
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    ctx.moveTo(this.width / 2, this.height / -2);
                    ctx.lineTo(this.width * 1.5 * max(0.75, Math.random()), this.height * -0.4);
                    ctx.lineTo(this.width / 2, this.height * -0.3);
                    ctx.closePath();
                    ctx.fillStyle = Math.random() < 0.5 ? "red" : (Math.random() < 0.75 ? "orange" : "yellow");
                    ctx.fill();
                }
            }
            ctx.restore();
            /* ctx.fillStyle = "blue";
            var hitboxWidth = Math.sin(Math.abs(this.angle) * Math.PI / 180) * (this.height * 1.5 - this.width) + this.width;
            var hitboxHeight = Math.abs(Math.cos(Math.abs(this.angle) * Math.PI / 180) * (this.height * 1.5 - this.width)) + this.width;
            ctx.fillRect(this.x - hitboxWidth / 2 + Math.sin(this.angle * Math.PI / 180) * 10, this.y - hitboxHeight / 2 - Math.cos(this.angle * Math.PI / 180) * 10, hitboxWidth, hitboxHeight); */
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
            var hitboxHeight = Math.abs(Math.cos(Math.abs(this.angle) * Math.PI / 180) * (this.height * 1.5 - this.width)) + this.width;
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

class CrashPart {
    constructor(width, height, x, y, color1, color2, isTop) {
        this.width = width;
        this.height = height;
        this.speedX = 0;
        this.speedY = 0;
        this.torque = 0;
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.color1 = color1;
        this.color2 = color2;
        this.isTop = isTop;
        this.update = function () {
            var ctx = gameWindow.context;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.beginPath();
            if (!this.isTop) {
                ctx.moveTo(this.width / -2, this.height / -2);
                ctx.lineTo(this.width / 2, this.height / -2);
                ctx.lineTo(this.width / 2, this.height / 2);
                ctx.lineTo(this.width / -2, this.height / 2);
            } else {
                ctx.moveTo(this.width / -2, this.height / 2);
                ctx.lineTo(0, this.height / -2);
                ctx.lineTo(this.width / 2, this.height / 2);
            }
            ctx.closePath();
            const grd = ctx.createLinearGradient(this.width / -2, 0, 12, 0);
            grd.addColorStop(0, this.color1);
            grd.addColorStop(0.8, this.color2);
            ctx.fillStyle = grd;
            ctx.fill();
            ctx.restore();
            /*ctx.fillStyle = "blue";
            var hitboxWidth = Math.abs(Math.cos(Math.abs(this.angle) * Math.PI / 180) * (this.width - this.height)) + this.height;
            var hitboxHeight = Math.sin(Math.abs(this.angle) * Math.PI / 180) * (this.width - this.height) + this.height;
            ctx.fillRect(this.x - hitboxWidth / 2, this.y - hitboxHeight / 2, hitboxWidth, hitboxHeight);*/
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
            var hitboxWidth = Math.abs(Math.cos(Math.abs(this.angle) * Math.PI / 180) * (this.width - this.height)) + this.height;
            var hitboxHeight = Math.sin(Math.abs(this.angle) * Math.PI / 180) * (this.width - this.height) + this.height;
            var myleft = this.x - hitboxWidth / 2;
            var myright = myleft + hitboxWidth;
            var mytop = this.y - hitboxHeight / 2;
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

class Arrow {
    constructor (x, y, dir, size, color) {
        this.x = x;
        this.y = y;
        this.dir = dir;
        this.size = size;
        this.color = color;
        this.update = function () {
            var ctx = gameWindow.context;
            ctx.fillStyle = this.color;
            if (this.dir == "left") {
                ctx.beginPath();
                ctx.moveTo(x + this.size, y - this.size);
                ctx.lineTo(x - this.size, y);
                ctx.lineTo(x + this.size, y + this.size);
                ctx.closePath();
                ctx.fill();
            } else if (this.dir == "right") {
                ctx.beginPath();
                ctx.moveTo(x - this.size, y - this.size);
                ctx.lineTo(x + this.size, y);
                ctx.lineTo(x - this.size, y + this.size);
                ctx.closePath();
                ctx.fill();
            } else if (this.dir == "none") {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.fill();
            }
        }
        this.changeDir = function (dir) {
            this.dir = dir;
        }
    }
}

function max (a, b) {
    if (b > a) {
        return b;
    } else {
        return a;
    }
}