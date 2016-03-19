/*
   create a timer with a function
   prop_playing([val]) //gets/sets playing (boolean)
   prop_tps([val])  //gets/sets ticks per second (float)
   get_framerate()
   */

console.log("Loading timer.js...");


//performance.now shim
var now = (function() {
		var performance = window.performance || {};

		performance.now = (function() {
			return performance.now    ||
			performance.webkitNow     ||
			performance.msNow         ||
			performance.oNow          ||
			performance.mozNow        ||
			function() { return new Date().getTime(); };
			})();

		return performance.now();
});


var Timer = function(in_action, in_tps) {
	var tps; //ticks per second
	var action; //function to call
	var timeoutVar = null; //the return value from setTimeout
	                //Should be null if paused
	var delay;  //Delay in millis, derived from tps


	if(typeof(in_action) != "function") 
		{ throw "didn't pass a function in Timer constructor" }
	action = in_action;
	setTPS(in_tps);


	var fps = {};
	fps.lastFPS = 0;
	fps.lastSecondTime = 0;
	fps.frameCount = 0;
	fps.logFrame = function() {
		var currTime = now();
		if(currTime - fps.lastSecondTime > 1000) {
			fps.lastFPS = fps.frameCount;
			fps.frameCount = 0;
			fps.lastSecondTime = currTime;
		} else {
			fps.frameCount++;
		}
	}

	function setTPS(in_tps) {
		//update values
		tps = in_tps;
		delay = 1000.0 / tps;

		//if running, redo timeout delay
		if(timeoutVar) {
			clearTimeout(timeoutVar);
			timeoutVar = setTimeout(tick, delay);
		}
	}


	function tick() {
		//do (and time) action
		var startTime = now();
		fps.logFrame();
		action();
		var duration = now() - startTime;
		var newDelay = Math.max(delay - duration, 0);
		//ready next action
		timeoutVar = setTimeout(tick, newDelay);
	}

	//get/set tps
	function tpsProp(newVal) {
		if(arguments.length) {
			if(newVal > 0)
				{ setTPS(newVal) }
			else
				{ throw "Invalid TPS in tpsProp"; }
		}
		return tps;
	}

	//start playing, stop playing, or get current state
	function playingProp(newVal) {
		//set playing
		if(arguments.length) {
			if(newVal && !timeoutVar) { //start playing
				tick();
			} else if (!newVal && timeoutVar) { //stop playing
				clearTimeout(timeoutVar);
				timeoutVar = null;
			}
		}
		return timeoutVar != null;
	}


	return {
		playingProp: playingProp,
		tpsProp: tpsProp,
		getFramerate: function() {return fps.lastFPS;},
	}
}

console.log("Done");
