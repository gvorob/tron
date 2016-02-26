/*In the "Tron" rule, the transition function leaves each 
block unchanged except when all four of its cells have the 
same state, in which case their states are all reversed
*/

console.log("Loading tron.js...")

var Grid = function(width, height) {
	this.makeGrid(width, height);
}

Grid.prototype.makeGrid = function(width, height) {
	this.width = width;
	this.height = height;
	this.margOffset = false;//-1, -1

	//creates a w x h matrix
	//indexed by x, y from the top
	this.data = new Array(width);
	this.dataNext = new Array(width);
	for(var i = 0; i < width; i++){
		this.data[i] = new Array(height);
		this.dataNext[i] = new Array(height);
		for(var j = 0; j < height; j++){
			//element i,j
			this.data[i][j] = 0;
		}
	}
}

Grid.prototype.init = function(f) {
	for(var i = 0; i < this.width; i++){
		for(var j = 0; j < this.height; j++){
			this.data[i][j] = f(i,j);
		}
	}
}

Grid.prototype.isInBounds = function(x, y) {
	return (
		x >= 0 &&
		y >= 0 &&
		x < this.width &&
		y < this.height);
}


Grid.prototype.wrap = function(x, size) {
	if(x < 0) { return x + size; }
	if(x >= size) {return x - size; }
	return x;
}

Grid.prototype.checkAlive = function(x, y) {
	if(!this.isInBounds(x,y)) { 
		x = this.wrap(x, this.width);
		y = this.wrap(y, this.height);
	}
	return this.data[x][y];
}

Grid.prototype.setAlive = function(x, y, life) {
	if(!this.isInBounds(x,y)) { 
		x = this.wrap(x, this.width);
		y = this.wrap(y, this.height);
	}
	this.dataNext[x][y] = life;
}

//toggles IMMEDIATELY (for mouse click)
Grid.prototype.toggle = function(x, y) {
	if(!this.isInBounds(x,y)) { return; }
	this.data[x][y] = !this.data[x][y];
}

Grid.prototype.swapBuffers = function() {
	var temp = this.data;
	this.data = this.dataNext;
	this.dataNext = temp;
}

Grid.prototype.countNeighbors = function(x, y) {
	var count = 0;
	count += this.checkAlive(x - 1, y - 1);
	count += this.checkAlive(x + 1, y - 1);
	count += this.checkAlive(x - 1, y + 1);
	count += this.checkAlive(x + 1, y + 1);
	count += this.checkAlive(x - 1, y);
	count += this.checkAlive(x + 1, y);
	count += this.checkAlive(x    , y - 1);
	count += this.checkAlive(x    , y + 1);
	return count;
}


Grid.prototype.updateConway = function() {
	for(var i = 0; i < this.width; i++){
		for(var j = 0; j < this.height; j++){

			var count = this.countNeighbors(i, j);
			if(!this.data[i][j]) {
				this.dataNext[i][j] = (count == 3);
			} else {
				this.dataNext[i][j] = (count == 3) || (count == 2);
			}

		}
	}
	this.swapBuffers();
}

//Counts alive cells in a block whose TL is x,y
Grid.prototype.countBlock = function(x,y) {
	var count = 0;
	count += this.checkAlive(x, y);
	count += this.checkAlive(x + 1, y);
	count += this.checkAlive(x, y + 1);
	count += this.checkAlive(x + 1, y + 1);
	return count;
}

//Sets all cells in block to x,y
Grid.prototype.setBlock = function(x,y, life) {
	this.setAlive(x, y,         life);
	this.setAlive(x + 1, y,     life);
	this.setAlive(x, y + 1,     life);
	this.setAlive(x + 1, y + 1, life);
}

Grid.prototype.sameBlock = function(x,y, life) {
	this.setAlive(x, y,         this.checkAlive(x, y));
	this.setAlive(x + 1, y,     this.checkAlive(x + 1, y));
	this.setAlive(x, y + 1,     this.checkAlive(x, y + 1));
	this.setAlive(x + 1, y + 1, this.checkAlive(x + 1, y + 1));
}

Grid.isEven = function(x,y) {
	return !(x % 2 || y % 2);
}

Grid.prototype.updateTron = function() {
	if(!Grid.isEven(this.width, this.height)) {
		console.log("Uneven size ")
		return;
	}

	//loop over all blocks, offsetting appropriately each time
	for(var i = this.margOffset|0; i < this.width + 1; i+=2){
		for(var j = this.margOffset|0; j < this.height + 1; j+=2){
			var c = this.countBlock(i, j);
			if(c == 0) {
				this.setBlock(i,j,1)
			} else if(c == 4) {
				this.setBlock(i,j,0)
			} else {
				this.sameBlock(i,j); //needed to propagate no change into second buffer
			}
		}
	}

	this.margOffset = !this.margOffset;

	this.swapBuffers();
}


Grid.prototype.draw = function(g, cellSize, vstart) {
	g.save();
	g.translate(-vstart.x, -vstart.y);
	
	//Draw cells
	g.fillStyle = "#420"// : "#EEE";
	for(var i = 0; i < this.width; i++){
		for(var j = 0; j < this.height; j++){
			if(this.data[i][j]) { g.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);}
		}
	}

	//Draw outlines
	g.lineWidth = 1;
	g.strokeStyle = "#888";
	for(var i = 0; i <= this.width; i++){
		g.beginPath();
		g.moveTo(i * cellSize + 0.5, 0)
		g.lineTo(i * cellSize + 0.5, this.height * cellSize);
		g.stroke()
	}
	for(var j = 0; j <= this.height; j++){
		g.beginPath();
		g.moveTo(0, j * cellSize + 0.5)
		g.lineTo(this.width * cellSize, j * cellSize + 0.5);
		g.stroke()
	}
	g.restore();
}

Grid.prototype.exportRLE = function() {
	var rleString = "x = " + this.width + ", y = " + this.height + "\n";
	
	//encode all rows
	for(var j = 0; j < this.height; j++){
		//encode one row

		//grab first
		var last = this.data[0][j]
		var runlength = 1;
		//grab rest
		for(var i = 1; i < this.width; i++) {
			if(this.data[i][j] == last) {
				runlength++;
			} else {
				if(runlength > 1)
					rleString += runlength;
				rleString += last ? "o" : "b";
				last = this.data[i][j];
				runlength = 1;
			}
		}
		//do last one
		if(runlength > 1)
			rleString += runlength;
		rleString += last ? "o" : "b";
		rleString += "$\n";
	}
	//terminate RLE
	if(runlength > 1)
		rleString += runlength;
	rleString += last ? "o" : "b";
	rleString += "$!";


	return rleString;
}

Grid.parseRLEHeader = function(string) {
	string = string.replace(/\s+/g,"");
	params = string.match(/^x=(\d+),y=(\d+)$/);

	if(params == null) 
		{throw "malformed header"}
	var v = new Vector(parseInt(params[1]), parseInt(params[2]));
	if(v.isNaN())
		{throw "malformed header"}

	return v;
}

Grid.prototype.importRLE = function(string) {
	var i = 0;
	var j = 0;
	var _this = this; //needed for addNCells

	//cell can be "o", "b", or "$"
	function addNCells(n, cell) {
		if(n < 0) {throw "negative RLE";}

		//Handle newlines
		if(cell == "$") {
			j += n;
			i = 0;
		}

		//Handle other cells
		else {
			if(j >= _this.width) {return;}

			//decode char
			if		(cell == "o") {cell = 1}
			else if	(cell == "b") {cell = 0}
			else {throw "Cell not in [ob$]";}

			//Add n cells
			for(var k = 0; k < n; k++) {
				if(i >= _this.width) {break;}
				_this.data[i][j] = cell;
				i++;
			}
		}
	}

	//Parse header
	var lines = string.split('\n');
	var size = Grid.parseRLEHeader(lines[0]);

	console.log(size);
	this.makeGrid(size.x, size.y);

	//Prepare body parsing
	var rest = lines.slice(1).join("");
	var re = /^\s*(!|(\d*)([ob\$]))/;
	var flag = true;
	var lastindex = 0;

	//main parse loop
	while(true) {
		//Find subsequent matches
		var match = re.exec(rest.slice(lastindex));
		if(match == null) {throw "malformed body";}
		if(match[0] == "!") { break;}
		lastindex += match[0].length;

		//Parse run length
		var runlength;
		if(match[2] == "") { runlength = 1;}
		else { runlength = parseInt(match[2]); }
		if(isNaN(runlength)) {throw "failed to parse runlength"}

		//Add cells
		addNCells(runlength, match[3]);
	}

	Wrapper.redraw();
}



var Wrapper = new Object();

Wrapper.init = function(grid, canvas, cellsize) {
	Wrapper.playing = 1;
	Wrapper.grid = grid;
	grid.init(function(x,y) {
		return 0;
	})
	Wrapper.canvas = canvas;
	Wrapper.cellSize = cellsize;
	Wrapper.viewStart = new Vector(0,0);
	Wrapper.mouse = new Vector(0,0);
	Wrapper.pan.init(60, 5)

	Wrapper.redraw();
	Wrapper.drawAtFPS(60);
}

//Redraws the screen at intervals when it gets dirty
Wrapper.drawAtFPS = function(fps){
	Wrapper.drawDelay = 1000.0 / fps;
	setInterval(Wrapper.draw, Wrapper.drawDelay)
}

//marks the screen as dirty
Wrapper.redraw = function() {
	Wrapper.redrawFlag = true;
}

Wrapper.tick = function() {
	if(!Wrapper.playing) {return;}
	Wrapper.step()
	setTimeout(Wrapper.tick, 200);
}

Wrapper.step = function() {
	Wrapper.grid.updateConway();
	Wrapper.redraw();
}

Wrapper.draw = function() {
	var w = Wrapper;

	if(!w.redrawFlag) { return; }
	var g = w.canvas.getContext("2d");

	g.clearRect(0,0,w.canvas.width, w.canvas.height);
	w.grid.draw(g, w.cellSize, w.viewStart);

	//Draw mouse outline
	if(w.mouse.onScreen && w.grid.isInBounds(w.mouse.x, w.mouse.y)) {
		g.save();
		g.translate(-w.viewStart.x, -w.viewStart.y);
		
		//Draw outline
		g.lineWidth = 5;
		g.strokeStyle = "#0A0";
		g.strokeRect(
				w.mouse.x * w.cellSize + 0.5, 
				w.mouse.y * w.cellSize + 0.5, 
				w.cellSize, w.cellSize);
		g.restore();
	}

	//Draw panning bounds
	g.lineWidth = 0.5;
	g.strokeStyle = "#800";
	for(var i = 0; i < w.pan.zones.length; i++) {
		w.pan.zones[i].bounds.draw(g);
	}

	w.redrawFlag = false;
}

Wrapper.playPause = function () {
	if(Wrapper.playing) {
		Wrapper.playing = 0;
		document.getElementById("pauseButton").value="Play";
	} else {
		Wrapper.playing = 1;
		document.getElementById("pauseButton").value="Pause";
	}
	Wrapper.tick();
}

Wrapper.clear = function () {
	Wrapper.grid.init(function() { return 0;});
	Wrapper.redraw();
}

Wrapper.mouseToTile = function(v) {
	var v2 = v.clone();
	v2.addV( Wrapper.viewStart);
	v2.scale(1. / Wrapper.cellSize);

	return Vector.floor(v2);
}

//interprets a click on the canvas
Wrapper.doClick = function(m){
	m = Wrapper.mouseToTile(m);

	Wrapper.grid.toggle(m.x, m.y);
	Wrapper.redraw();
}

Wrapper.doMove = function(m){
	Wrapper.mouse.pixelCoords = m.clone();
	m = Wrapper.mouseToTile(m);
	Wrapper.pan.checkPan();
	Wrapper.mouse.onScreen = true;
	Wrapper.mouse.setV(m);
	Wrapper.redraw();
}

Wrapper.doMouseOut = function(){
	Wrapper.mouse.onScreen = false;
	Wrapper.pan.checkPan();
	Wrapper.redraw();
}


Wrapper.pan = new Object();
Wrapper.pan.init = function(limit, speed){
	Wrapper.pan.panLimit = limit; //number of pixels from edge s.t. you pan
	Wrapper.pan.panSpeed = speed

	Wrapper.pan.panDirection = new Vector(0,0);
	
	var cSize = Wrapper.canvas.getBoundingClientRect();
	var w = cSize.width;
	var h = cSize.height;
	var lim = limit;

	Wrapper.pan.zones = [
		//Left
		{	bounds:		new Bounds(new Vector(0,0), new Vector(lim,h)),
			direction:	new Vector(-1, 0)},
		//Top
		{	bounds:		new Bounds(new Vector(0,0), new Vector(w,lim)),
			direction:	new Vector(0, -1)},
		//Right
		{	bounds:		new Bounds(new Vector(w - lim, 0), new Vector(lim,h)),
			direction:	new Vector(1, 0)},
		//Bottom
		{	bounds:		new Bounds(new Vector(0, h - lim), new Vector(w,lim)),
			direction:	new Vector(0, 1)},
	];

	Wrapper.pan.doPan();
}

//Get the direction to pan based on mouse coords
Wrapper.pan.checkPan = function(){
	var p = Wrapper.pan;

	var result = new Vector(0,0);
	if(Wrapper.mouse.onScreen) {
		for(var i = 0; i < p.zones.length; i++) {
			if(p.zones[i].bounds.contains(Wrapper.mouse.pixelCoords)) {
				result.addV(p.zones[i].direction);
			}
		}
	}
	Wrapper.pan.panDirection = result;
}

//Pan the screen every amount of time
Wrapper.pan.doPan = function() {
	if(!Wrapper.pan.panDirection.equals(0,0)) {
		Wrapper.viewStart.addScaledV(Wrapper.pan.panSpeed, Wrapper.pan.panDirection);
		Wrapper.redraw();
	}
	setTimeout(Wrapper.pan.doPan, 20);
}

function Bounds(pos,size){//pos and size are vectors
	this.pos = pos;
	this.size = size;}
Bounds.prototype.contains = function(pos){
	return pos.x > this.pos.x && pos.y > this.pos.y && pos.x < this.pos.x + this.size.x && pos.y < this.pos.y + this.size.y;}
Bounds.prototype.draw = function(g){
	g.strokeRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
}

console.log("Done");
