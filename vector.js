console.log("Loading vector.js...")

function Vector(x,y){
	if(	undefined == x || 
		undefined == y ||
		isNaN(x) ||
		isNaN(y)
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
}

Vector.prototype.setLength = function(len){
	this.scale(len / this.getLength());
	if(this.getLength() == Infinity){
		this.set(0,0);
	}
}

Vector.prototype.setV = function(otherVect){
	this.x = otherVect.x;
	this.y = otherVect.y;
}

Vector.prototype.set = function(x,y){
	this.x = x;
	this.y = y;
}

Vector.prototype.add = function(x,y){
	this.x += x;
	this.y += y;
}

Vector.prototype.addV = function(other){
	this.x += other.x;
	this.y += other.y;
}

Vector.prototype.addScaledV = function(scale,other){
	this.x += other.x * scale;
	this.y += other.y * scale;
}

Vector.prototype.multElements = function(other){
	this.x *= other.x;
	this.y *= other.y;
}

Vector.prototype.clone = function(){
	return new Vector(this.x,this.y);
}

console.log("Done");