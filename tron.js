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
	function initCell(i,j){
			foo = !foo;
			return Number(foo);
	}
	//creates a w x h matrix
	//indexed by x, y from the top
	this.data = new Array(width);
	this.data2 = new Array(width);
	for(var i = 0; i < width; i++){
		this.data[i] = new Array(height);
		this.data2[i] = new Array(height);
		for(var j = 0; j < height; j++){
			//element i,j
			this.data[i][j] = initCell(i,j);
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

			if(this.data[i][j]) {
				this.data2[i][j] = c == 3;
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

Grid.prototype.draw = function(g, cellsize, vstart) {
	g.save();
	g.translate(-vstart.x, -vstart.y);
	this.data.forEach(function(v,i,arr){
		arr[i].forEach(function(v2, j, arr2){
			//element i,j
			g.fillStyle = v2 ? "black" : "white";
			g.fillRect(i * cellsize, j * cellsize, cellsize, cellsize);
		})
	})
	g.restore();
}

var Wrapper = new Object();

Wrapper.init = function(grid, graphics) {
	Wrapper.playing = 1;
	Wrapper.grid = grid;
	Wrapper.graphics = graphics;
}

Wrapper.tick = function() {
	if(!Wrapper.playing) {return;}
	Wrapper.grid.update();
	Wrapper.grid.draw(Wrapper.graphics, 30, new Vector(0,0));

	setTimeout(Wrapper.tick, 200);
}

Wrapper.play_pause = function () {
	if(Wrapper.playing) {
		Wrapper.playing = 0;
	} else {
		Wrapper.playing = 1;
	}
	Wrapper.tick();
}


function testtron(g) {
	slog("foo");
	console.log("bar");
	var grid = new Grid(11, 11);
	grid.draw(g, 30, new Vector(0, 0));
	Wrapper.init(grid, g);
	Wrapper.tick();
}


console.log("Done");
