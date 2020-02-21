/*In the "Tron" rule, the transition function leaves each 
block unchanged except when all four of its cells have the 
same state, in which case their states are all reversed
*/

console.log("Loading tron.js...")

var Grid = function(size) {
	this.makeGrid(size);
}

Grid.checkValidGridSize = function(size) {
	return size.isInt() && 
			!size.isNaN() &&
			size.x >= 1 &&
			size.y >= 1;
}

Grid.prototype.makeGrid = function(size) {
	if(!Grid.checkValidGridSize(size)) throw "Invalid size in makeGrid";
	this.size = size.clone();
	this.margOffset = false;//-1, -1

	//creates a w x h matrix
	//indexed by x, y from the top
	this.data = new Array(size.x);
	this.dataNext = new Array(size.x);
	for(var i = 0; i < size.x; i++){
		this.data[i] = new Array(size.y);
		this.dataNext[i] = new Array(size.y);
		for(var j = 0; j < size.y; j++){
			//element i,j
			this.data[i][j] = 0;
		}
	}
}

Grid.prototype.resizeGrid = function(size) {
	if(!Grid.checkValidGridSize(size)) throw "Invalid size in resizeGrid";
	var dataOld = this.data;
	var copyW = Math.min(this.size.x, size.x);
	var copyH = Math.min(this.size.y, size.y);
	this.makeGrid(size);
	for(var i = 0; i < copyW; i++){
		for(var j = 0; j < copyH; j++){
			this.data[i][j] = dataOld[i][j];
		}
	}
}

//init every cell with a 2-element function
Grid.prototype.init = function(in_func) {
	for(var i = 0; i < this.size.x; i++){
		for(var j = 0; j < this.size.y; j++){
			this.data[i][j] = in_func(i,j);
		}
	}
}

Grid.prototype.isInBounds = function(x, y) {
	return (
		x >= 0 &&
		y >= 0 &&
		x < this.size.x &&
		y < this.size.y);
}


Grid.wrap = function(x, size) {
	x %= size;
	return x + ((x < 0) ? size : 0);
}

Grid.prototype.checkAlive = function(x, y) {
	if(!this.isInBounds(x,y)) { 
		x = Grid.wrap(x, this.size.x);
		y = Grid.wrap(y, this.size.y);
	}
	return this.data[x][y];
}

Grid.prototype.setAlive = function(x, y, life) {
	if(!this.isInBounds(x,y)) { 
		x = Grid.wrap(x, this.size.x);
		y = Grid.wrap(y, this.size.y);
	}
	this.dataNext[x][y] = life;
}

Grid.prototype.setAliveNow = function(x, y, life) {
	if(!this.isInBounds(x,y)) { 
		x = Grid.wrap(x, this.size.x);
		y = Grid.wrap(y, this.size.y);
	}
	this.data[x][y] = life;
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
	for(var i = 0; i < this.size.x; i++){
		for(var j = 0; j < this.size.y; j++){

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
	if(!Grid.isEven(this.size.x, this.size.y)) 
		{ throw "Uneven size in updateTron"; }

	//loop over all blocks, offsetting appropriately each time
	for(var i = this.margOffset|0; i < this.size.x + 1; i+=2){
		for(var j = this.margOffset|0; j < this.size.y + 1; j+=2){
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

Grid.drawLine = function(g, x1, y1, x2, y2) {
	g.beginPath();
	//add 0.5 to draw on pixels, instead of between them
	g.moveTo(x1 + 0.5, y1 + 0.5);
	g.lineTo(x2 + 0.5, y2 + 0.5);
	g.stroke()
}

Grid.prototype.draw = function(g, cellSize, vstart, drawGrid, color="#420") {
	g.save();
	g.translate(-vstart.x, -vstart.y);

	
	if(drawGrid === undefined) { drawGrid = true; }
	
	//Draw cells
	g.fillStyle = color// : "#EEE";
	for(var i = 0; i < this.size.x; i++){
		for(var j = 0; j < this.size.y; j++){
			if(this.data[i][j]) { g.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);}
		}
	}

	var gridBottom = this.size.y * cellSize;
	var gridRight  = this.size.x * cellSize;
	if(drawGrid) {
		//Draw outlines
		var lineX, lineY;
		g.lineWidth = 1;
		g.strokeStyle = "#888";
		//Draw vertical lines
		for(var i = 0; i <= this.size.x; i++){
			lineX = i * cellSize;
			Grid.drawLine(g, lineX, 0, lineX, gridBottom);
		}
		//Draw horizontal lines
		for(var i = 0; i <= this.size.y; i++){
			lineY = i * cellSize;
			Grid.drawLine(g, 0, lineY, gridRight, lineY);
		}
	} else {
		/*
		Grid.drawLine(g, 0,         0,          gridRight, 0         );
		Grid.drawLine(g, 0,         gridBottom, gridRight, gridBottom);
		Grid.drawLine(g, 0,         0,          0,         gridBottom);
		Grid.drawLine(g, gridRight, 0,          gridRight, gridBottom);
		*/
	}
	g.restore();
}

Grid.prototype.exportRLE = function() {
	var rleString = "x = " + this.size.x + ", y = " + this.size.y + "\n";
	
	//encode all rows
	for(var j = 0; j < this.size.y; j++){
		//encode one row

		//grab first
		var last = this.data[0][j]
		var runlength = 1;
		//grab rest
		for(var i = 1; i < this.size.x; i++) {
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

Grid.extractRLEHeader = function(string) {
	var lines = string.split('\n');
	var i;
	for(i = 0; i < lines.length; i++) {
		if(lines[i].charAt(0) != "#")
			{break;}}
	if(i == lines.length) {throw "Header not found";}
	return lines[i];
}

Grid.extractRLEBody = function(string) {
	var lines = string.split('\n');
	var i;
	for(i = 0; i < lines.length; i++) {
		if(lines[i].charAt(0) != "#")
			{break;}}
	if(i == lines.length) {throw "Body not found";}
	return lines.slice(i + 1).join("");
}

Grid.parseRLEHeader = function(string) {
	string = Grid.extractRLEHeader(string);
	string = string.replace(/\s+/g,"");
	params = string.match(/^x=(\d+),y=(\d+)(,.*)?$/);

	if(params == null) 
		{throw "malformed header"}
	var v = new Vector(parseInt(params[1]), parseInt(params[2]));
	if(v.isNaN())
		{throw "malformed header"}

	return v;
}

Grid.prototype.importRLEAtCoords = function(string, coords) {
	var _that = this;
	var cellAdder = function() {
		var startCoords = coords.clone();
		var currCoords = coords.clone();
		var maxCoords = Grid.parseRLEHeader(string);
		maxCoords.addV(startCoords);
		var grid = _that;

		if(startCoords.isNaN() ||
		   currCoords.isNaN() ||
		   maxCoords.isNaN()) 
			{throw "NaN in Grid.*.importRLEAtCoords";}
	
		//cell can be "o", "b", or "$"
		function addNCells(n, cell) {
			if(n < 0) {throw "negative RLE";}

			//Handle newlines
			if(cell == "$") {
				currCoords.y += n;
				currCoords.x = startCoords.x;
			}

			//Handle other cells
			else {
				if(currCoords.y >= maxCoords.y) {return;}

				//decode char
				if		(cell == "o") {cell = 1}
				else if	(cell == "b") {cell = 0}
				else {throw "Cell not in [ob$]";}

				//Add n cells
				for(var k = 0; k < n; k++) {
					if(currCoords.x >= maxCoords.x) {break;}
					grid.setAliveNow(currCoords.x, currCoords.y, cell);
					currCoords.x++;
				}
			}
		}

		return {
			addNCells: addNCells
		}
	}();


	//Prepare body parser
	var rest = Grid.extractRLEBody(string);
	var re = /^\s*(!|(\d*)([ob\$]))/;
	var flag = true;
	var lastindex = 0;

	//main parse loop
	while(true) {
		//Find successive matches
		var match = re.exec(rest.slice(lastindex));
		if(match == null) {throw "malformed body or not '!'-terminated";}
		if(match[0] == "!") { break;}
		lastindex += match[0].length;

		//Parse run length
		var runlength;
		if(match[2] == "") { runlength = 1;}
		else { runlength = parseInt(match[2]); }
		if(isNaN(runlength)) {throw "failed to parse runlength"}

		//Add cells
		//console.log(runlength, match[3]);
		cellAdder.addNCells(runlength, match[3]);
	}

}



var Wrapper = function(){
	var tickTimer; //from timer.js
	var grid, canvas, cellSize, gridDraw;
	var viewStart = new Vector(0,0);
	var mouse = new Vector(0,0);
	var pan = {}

	var minCellSize = 1;

	function init(gridSize, in_canvas, in_cellSize) {
		grid = new Grid(gridSize);
		grid.init(function(x,y) {
			return 0;
		})
		canvas = in_canvas;
		cellSize = in_cellSize;

		PAN_UI_SIZE = 60;
		PAN_TPS = 50;
		PAN_DISTANCE = 5;
		pan.init(PAN_UI_SIZE, PAN_TPS, PAN_DISTANCE);

		tickTimer = new Timer(step, 5);

		redraw();
		drawAtFPS(60);
	}

	//Redraws the screen at intervals when it gets dirty
	function drawAtFPS(fps){
		var drawDelay = 1000.0 / fps;
		setInterval(draw, drawDelay)
	}


	//marks the screen as dirty
	function redraw() { redrawFlag = true; }

	function step() {
		grid.updateConway();
		redraw();
	}

	function draw() {
		if(!redrawFlag) { return; }
		var g = canvas.getContext("2d");

		g.clearRect(0,0, canvas.width, canvas.height);
		grid.draw(g, cellSize, viewStart, gridDraw);

		//Draw mouse outline
		if(mouse.onScreen && grid.isInBounds(mouse.x, mouse.y)) {
			g.save();
			g.translate(-viewStart.x, -viewStart.y);
			
			//Draw outline
			g.lineWidth = 5;
			g.strokeStyle = "#0A0";
			g.strokeRect(
					mouse.x * cellSize + 0.5, 
					mouse.y * cellSize + 0.5, 
					cellSize, cellSize);
			g.restore();
		}

		//Draw panning bounds
		g.lineWidth = 0.5;
		g.strokeStyle = "#800";
		for(var i = 0; i < pan.zones.length; i++) {
			pan.zones[i].bounds.draw(g);
		}

		redrawFlag = false;
	}

	function pixelToTile(v) {
		var v2 = v.clone();
		v2.addV(viewStart);
		v2.scale(1 / cellSize);
		return Vector.floor(v2);
	}

	function tileToPixel(v) {
		var v2 = v.clone();
		v2.scale(cellSize);
		v2.addScaledV(-1, viewStart);
		return v2;
	}

	pan.init = function(limit, tps, distance){
		pan.panLimit = limit; //number of pixels from edge s.t. you pan
		pan.panDistance = distance
		pan.panDirection = new Vector(0,0);
		
		pan.timer = new Timer(pan.doPan, tps);

		var cSize = canvas.getBoundingClientRect();
		var w = cSize.width;
		var h = cSize.height;
		var lim = limit;

		pan.zones = [
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

		pan.clampView();
	
		//slides the screen repeatedly if need be
		pan.checkPan();
	}

	//Get the direction to pan based on mouse coords
	pan.checkPan = function(){
		pan.panDirection = new Vector(0,0);
		//Check which zones mouse is in
		if(mouse.onScreen) {
			for(var i = 0; i < pan.zones.length; i++) {
				if(pan.zones[i].bounds.contains(mouse.pixelCoords)) {
					pan.panDirection.addV(pan.zones[i].direction);
				}
			}
		}
		//Play/pause pan timer
		var panning = !pan.panDirection.equals(0,0);
		pan.timer.playingProp(panning);	
	}

	//Pan the screen by panDistance in the appropriate direction
	pan.doPan = function() {
		viewStart.addScaledV(pan.panDistance, pan.panDirection);
		//$("#debug").html(pan.timer.getFPS());
		pan.clampView();
		redraw();
	}

	pan.clampView = function() {
		//viewStart = -1 * tile(0,0)_coords
		var tlCoords = viewStart.clone().scale(-1);
		var gridSize = grid.size.clone().scale(cellSize);
		if(tlCoords.x > canvas.width / 2)
			{tlCoords.x = canvas.width / 2; }
		if(tlCoords.y > canvas.height / 2)
			{tlCoords.y = canvas.height / 2; }
		var brCoords = tlCoords.clone().addV(gridSize);
		if(brCoords.x < canvas.width / 2)
			{brCoords.x = canvas.width / 2; }
		if(brCoords.y < canvas.height / 2)
			{brCoords.y = canvas.height / 2; }
		
		tlCoords = brCoords.addScaledV(-1, gridSize);

		viewStart = tlCoords.scale(-1);
	}

	function test(tile) {
		redraw();
		return pan.centerOnTile(tile);
	}

	pan.getCenterTile = function() {
		return pixelToTile(new Vector(canvas.width / 2, canvas.height / 2))
	}

	pan.centerOnTile = function(tile) {
		if(tile.isNaN() || !tile.isInt()) { throw "invalid tile in pan.centerOnTile"; }
		var tileCoords = tile.clone().scale(cellSize);
		tileCoords.add(canvas.width / -2, canvas.height / -2);
		viewStartProp(tileCoords);
	}

	function Bounds(pos,size){//pos and size are vectors
		this.pos = pos;
		this.size = size;}
	Bounds.prototype.contains = function(pos){
		return pos.x > this.pos.x && pos.y > this.pos.y && pos.x < this.pos.x + this.size.x && pos.y < this.pos.y + this.size.y;}
	Bounds.prototype.draw = function(g){
		g.strokeRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
	}

	function playingProp(newVal) {
		return tickTimer.playingProp(newVal);
	}

	function clear () {
		grid.init(function() { return 0;});
		redraw();
	}

	//interprets a click on the canvas
	function doClick(m){
		m = pixelToTile(m);

		grid.toggle(m.x, m.y);
		redraw();
	}

	function doMove(m){
		mouse.pixelCoords = m.clone();
		m = pixelToTile(m);
		pan.checkPan();
		mouse.onScreen = true;
		mouse.setV(m);
		redraw();
	}

	function doMouseOut(){
		mouse.onScreen = false;
		pan.checkPan();
		redraw();
	}

	//returns true or false if succeeded
	function gridSizeProp(vec_size) {
		if(vec_size !== undefined && Grid.checkValidGridSize(vec_size)) {
			grid.resizeGrid(vec_size);
			pan.clampView();
			redraw()
		}
		return grid.size.clone();
	}

	//cellSizeProp() is a getter
	//cellSizeProp(v) sets to v if valid, returns v or old val if not
	function cellSizeProp(newVal) {
		if(newVal != null && newVal >= minCellSize) { 
			var oldCenterTile = pan.getCenterTile();
			cellSize = newVal; 
			pan.centerOnTile(oldCenterTile);
			redraw();
		}
		return cellSize;
	}

	function gridDrawProp(newVal) {
		if(newVal != null) {
			gridDraw = newVal;
			redraw();
		}
		return gridDraw;
	}

	function viewStartProp(newVal) {
		if(newVal != null && !newVal.isNaN()) { 
			viewStart = newVal; 
			redraw();
		}
		return viewStart;
	}

	function exportRLE()     {return grid.exportRLE();}

	function importWhole(data) {
		grid.makeGrid(Grid.parseRLEHeader(data));
		importAtCoords(data, new Vector(0,0));
	}

	function importAtCoords(data, coords) {
		grid.importRLEAtCoords(data, coords);
		gridSizeProp(grid.size);
		redraw();
	}
	
	return {
		test:           test,
		init:           init,
		playingProp:    playingProp,
		getFPS:         function() {return tickTimer.getFPS();},
		clear:          clear,
		doClick:        doClick,
		doMove:         doMove,
		doMouseOut:     doMouseOut,
		gridSizeProp:   gridSizeProp,
		gridDrawProp:   gridDrawProp,
		cellSizeProp:   cellSizeProp,
		exportRLE:      exportRLE,
		importWhole:    importWhole,
		importAtCoords: importAtCoords};
}();

console.log("Done");
