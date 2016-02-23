/*In the "Tron" rule, the transition function leaves each 
block unchanged except when all four of its cells have the 
same state, in which case their states are all reversed
*/

console.log("Loading tron.js...")

var Grid = function(width, height) {
	this.width = width;
	this.height = height;
	
	//for testing, fill a circle 2 wide radius 5 from 7,7
	var foo = 0;
	//creates a w x h matrix
	//indexed by x, y from the top
	this.data = new Array(width);
	this.data2 = new Array(width);
	for(var i = 0; i < width; i++){
		this.data[i] = new Array(height);
		this.data2[i] = new Array(height);
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


Grid.prototype.checkAlive = function(x, y) {
	if(!this.isInBounds(x,y)) { return 0; }
	return this.data[x][y];
}

Grid.prototype.setAlive = function(x, y, life) {
	if(!this.isInBounds(x,y)) { return; }
	this.data[x][y] = life;
}

Grid.prototype.toggle = function(x, y) {
	if(!this.isInBounds(x,y)) { return; }
	this.data[x][y] = !this.data[x][y];
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

Grid.prototype.update = function() {
	for(var i = 0; i < this.data.length; i++){
		for(var j = 0; j < this.data[0].length; j++){
			//element i,j
			var c = this.countNeighbors(i, j);

			if(!this.data[i][j]) {
				this.data2[i][j] = (c == 3);
			} else {
				this.data2[i][j] = (c == 3) || (c == 2);
			}
		}
	}
	
	//swap buffers
	var temp = this.data;
	this.data = this.data2;
	this.data2 = temp;
}

Grid.prototype.draw = function(g, cellSize, vstart) {
	g.save();
	g.translate(-vstart.x, -vstart.y);
	
	//Draw cells
	this.data.forEach(function(v,i,arr){
		arr[i].forEach(function(v2, j, arr2){
			//element i,j
			g.fillStyle = v2 ? "#420" : "#EEE";
			g.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
		})
	})

	//Draw outlines
	g.linewidth = 1;
	g.fillStyle = "black";
	this.data.forEach(function(v,i,arr){
		arr[i].forEach(function(v2, j, arr2){
			//element i,j
			g.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
		})
	})
	g.restore();
}

var Wrapper = new Object();

Wrapper.init = function(grid, graphics) {
	Wrapper.playing = 1;
	Wrapper.grid = grid;
	grid.init(function(x,y) {
		return 0;
	})
	Wrapper.graphics = graphics;
	Wrapper.cellSize = 30;
	Wrapper.viewstart = new Vector(0,0);
}

Wrapper.tick = function() {
	if(!Wrapper.playing) {return;}
	Wrapper.step()
	setTimeout(Wrapper.tick, 200);
}

Wrapper.step = function() {
	Wrapper.grid.update();
	Wrapper.draw();
}

Wrapper.draw = function() {
	Wrapper.grid.draw(Wrapper.graphics, Wrapper.cellSize, Wrapper.viewstart);
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
	Wrapper.draw();
}

//interprets a click on the canvas
Wrapper.doClick = function(x, y){
	x /= Wrapper.cellSize;
	y /= Wrapper.cellSize;
	x = Math.floor(x);
	y = Math.floor(y);
	console.log(x+ " " + y);

	Wrapper.grid.toggle(x, y);
	Wrapper.draw();
}


function testtron(g) {
	slog("foo");
	console.log("bar");
	var grid = new Grid(19, 19);
	grid.draw(g, 30, new Vector(0, 0));
	Wrapper.init(grid, g);
	Wrapper.tick();
}


console.log("Done");
