// canvas.js

var MIN_WIDTH  = 400;
var MIN_HEIGHT = 400;

var canvas = false;
var context = false;

var origoX = false;
var origoY = false;
var time = 0;

var mouse = {
	isPressed: false,
	xpos: 0,
	ypos: 0,
	xvel: 0,
	yvel: 0,
	lastReadTime: 0,
	hasMoved: false,
};

var R2D = Math.PI / 180;
var D2R = 180 / Math.PI;

var deltaTime = 0;
var lastTime = new Date().getTime();

window.onload = initCanvas;

function initCanvas() {
	canvas = document.getElementById('canvas');

	if(window.innerWidth < MIN_WIDTH) {
		document.write('<h1>Window width is too slim.</h1>');
		return;
	}

	if(window.innerHeight < MIN_HEIGHT) {
		document.write('<h1>Window height is too slim.</h1>');
		return;
	}

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	origoX = canvas.width / 2;
	origoY = canvas.height / 2;
	context = canvas.getContext('2d');
	canvas.addEventListener('mousemove', getMouseStatus, false);
	window.addEventListener('keydown', getKeyboardStatus, false);
	lastTime = new Date().getTime();
	initDemo();
}

function writeMessage(message, xpos, ypos, color) {
	context.font = '12pt Verdana';
	context.fillStyle = color;
	context.fillText(message, xpos, ypos);
}

function getMouseStatus(event) {
	var rect = canvas.getBoundingClientRect();
	var xpos = event.clientX - rect.left;
	var ypos = event.clientY - rect.top;
	mouse.xvel = (xpos - mouse.xpos) / (time - mouse.lastReadTime);
	mouse.yvel = (ypos - mouse.ypos) / (time - mouse.lastReadTime);
	mouse.lastReadTime = time;
	mouse.xpos = xpos;
	mouse.ypos = ypos;

	if(typeof window.mouseMoveCallback == 'function') {
		mouseMoveCallback(event);
	}

	return {
		x: xpos,
		y: ypos
	};
}

//function mouseDown(event) {
//	mouse.isPressed = true;
//}

//function mouseUp(event) {
//	mouse.isPressed = false;
//}

function getKeyboardStatus(event) {
	if(typeof window.keyboardCallback == 'function') {
		keyboardCallback(event);
	}
}

function createRandomColorRGB() {
	var r = Math.floor((Math.random() * 255) + 10);
	var g = Math.floor((Math.random() * 255) + 10);
	var b = Math.floor((Math.random() * 255) + 10);
	return('rgb(' + r + ',' + g + ',' + b + ')');
}

function drawDot(x, y, width, height, color) {
	context.fillStyle = color;
	context.fillRect(x, y, width, height);
}

function drawCircle(xpos, ypos, radius, startAngle, endAngle, clockwise, filled, color) {
	context.beginPath();
	//context.arc(	xpos - Math.floor((radius / 2)),
	//		ypos - Math.ceil((radius / 2)),
	context.arc(	xpos,
			ypos,
			radius,
			startAngle * R2D,
			endAngle * R2D,
			clockwise);
	if(filled) {
		context.fillStyle = color;
		context.fill();
	} else {
		context.strokeStyle = color;
		context.stroke();
	}
}

function drawLine(startx, starty, stopx, stopy, lineWidth, color) {
	context.lineWidth = 1;
	context.strokeStyle = color;
	context.beginPath();
	context.moveTo(startx, starty);
	context.lineTo(stopx, stopy);
	context.stroke();
}

function clearScreen(backgroundColor) {
	context.fillStyle = backgroundColor;
	context.fillRect(0, 0, canvas.width, canvas.height);
	//context.clearRect(0, 0, canvas.width, canvas.height);
}

function drawCoordinateSystem(xNumSteps, yNumSteps, axisColor, origoAxisColor, backgroundColor) {
	//context.fillStyle = backgroundColor;
	//context.fillRect(0, 0, canvas.width, canvas.height);

	var stepX = canvas.width / xNumSteps;
	for(i = 1; i < xNumSteps; i++) {
		if(stepX * i == origoX) {
			context.lineWidth = 2;
			context.strokeStyle = origoAxisColor;
		} else {
			context.lineWidth = 1;
			context.strokeStyle = axisColor;
		}

		drawLine(stepX * i, 0, stepX * i, canvas.height);
	}

	var stepY = canvas.height / yNumSteps;
	for(i = 1; i < yNumSteps; i++) {
		if(stepY * i == origoY) {
			context.lineWidth = 2;
			context.strokeStyle = origoAxisColor;
		} else {
			context.lineWidth = 1;
			context.strokeStyle = axisColor;
		}

		drawLine(0, stepY * i, canvas.width, stepY * i);
	}
}

function updateTime() {
	var now = new Date().getTime();
	deltaTime = (now - lastTime) / 1000;
	if(deltaTime > 1) deltaTime = 1;
	lastTime = now;
}

// CoordinateSystem
function CoordinateSystem(startPos, stopPos, startX, stopX, startY, stopY, axisColor, origoAxisColor, backgroundColor) {
	this.startPos = startPos;
	this.stopPos = stopPos;
	this.startX = startX;
	this.stopX = stopX;
	this.startY = startY;
	this.stopY = stopY;
	this.axisColor = axisColor;
	this.origoAxisColor = origoAxisColor;
	this.backgroundColor = backgroundColor;
	this.setup();
}

CoordinateSystem.prototype.setup = function () {
	this.columnsX = this.stopX - this.startX;
	this.columnsY = this.stopY - this.startY;
	this.stepX = (this.stopPos.x - this.startPos.x) / this.columnsX;
	this.stepY = (this.stopPos.y - this.startPos.y) / this.columnsY;
	if(this.startX <= 0 && this.stopX >= 0) {
		this.origoX = this.startPos.x + Math.abs(0 - this.startX) * this.stepX;
		this.origoY = this.startPos.y + Math.abs(0 - this.startY) * this.stepX;
	} else {
		this.origoX = false;
		this.origoY = false;
	}
}

CoordinateSystem.prototype.render = function () {
	context.save();
	context.fillStyle = this.backgroundColor;
	context.fillRect(this.startPos.x, this.startPos.y, this.stopPos.x - this.startPos.x, this.stopPos.y - this.stopPos.y);

	// X-axis
	for(var i = 1; i < this.columnsX; i++) {
		if(this.origoX && this.startPos.x + this.stepX * i === this.origoX) {
			context.lineWidth = 2;
			context.strokeStyle = this.origoAxisColor;
		} else {
			context.lineWidth = 1;
			context.strokeStyle = this.axisColor;
		}

		drawLine(this.startPos.x + this.stepX * i, this.startPos.y, this.startPos.x + this.stepX * i, this.stopPos.y);
	}

	// Y-axis
	for(var i = 1; i < this.columnsY; i++) {
		if(this.origoY && this.startPos.y + this.stepY * i === this.origoY) {
			context.lineWidth = 2;
			context.strokeStyle = this.origoAxisColor;
		} else {
			context.lineWidth = 1;
			context.strokeStyle = this.axisColor;
		}

		drawLine(this.startPos.x, this.startPos.y + this.stepY * i, this.stopPos.x, this.startPos.y + this.stepY * i);
	}

	context.restore();
}

CoordinateSystem.prototype.plot = function (x, y, color) {
	if(x < this.startX || x > this.stopX || y < this.startY || y > this.stopY) {
		return false;
	}

	drawDot(this.origoX + this.stepX * x, this.origoY - this.stepY * y, 1, 1, color);
}
