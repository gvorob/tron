console.log("Loading vector.js...")

function Vector(x,y){
	if(	undefined == x || 
		undefined == y ||
		isNaN(x) ||
		isNaN(y) ||
		typeof x != "number" ||
		typeof y != "number" 
	) {
		throw "Can't create vector (" + x + ", " + y +")";
	}
	this.x = x;
	this.y = y;
}

Vector.floor = function(v){
	return new Vector(Math.floor(v.x), Math.floor(v.y));
}

Vector.prototype.getLength = function(){
	return Math.sqrt(this.x * this.x + this.y * this.y);
}

Vector.prototype.scale = function(a){
	this.x *= a;
	this.y *= a;
	return this;
}

Vector.prototype.setLength = function(len){
	this.scale(len / this.getLength());
	if(this.getLength() == Infinity){
		this.set(0,0);
	}
	return this;
}

Vector.prototype.setV = function(otherVect){
	this.x = otherVect.x;
	this.y = otherVect.y;
	return this;
}

Vector.prototype.set = function(x,y){
	this.x = x;
	this.y = y;
	return this;
}

Vector.prototype.add = function(x,y){
	this.x += x;
	this.y += y;
	return this;
}

Vector.prototype.addV = function(other){
	this.x += other.x;
	this.y += other.y;
	return this;
}

Vector.prototype.addScaledV = function(scale,other){
	this.x += other.x * scale;
	this.y += other.y * scale;
	return this;
}

Vector.prototype.multElements = function(other){
	this.x *= other.x;
	this.y *= other.y;
	return this;
}

Vector.prototype.clone = function(){
	return new Vector(this.x,this.y);
}

Vector.prototype.isInt = function(v){
	return this.equalsV(Vector.floor(this));
}

Vector.prototype.isNaN = function(){
	return	this.x == null || 
			this.y == null || 
			isNaN(this.x) || 
			isNaN(this.y);
}

Vector.prototype.toString = function(){
	return "(" + this.x + " ," + this.y + ")\n";
}

Vector.prototype.equals = function(x,y){
	if(x === undefined || y === undefined) throw "Wrong params in Vector equals";
	return this.x == x && this.y == y
}

Vector.prototype.equalsV = function(v){
	return this.equals(v.x, v.y);
}

console.log("Done");
