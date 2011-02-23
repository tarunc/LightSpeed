/*
Ideally we wouldn't want to populate the page's DOM with unnecessary variables 
but since we are the only thing on the page, it doesn't matter.
*/
// Number of Stars
var n=512;
// Width of the viewport (aka the body width)
var w=0;
// Height of the viewport (aka the body height)
var h=0;
// Center of the width of the viewport (width/2)
var x=0;
// Center of the height of the viewport (height/2)
var y=0;
// Hypothetical z-value representing where we are on the screen
var z=0;
// Determines how big to draw the star
var starColorRatio=0;
// Just a constant effecting the way stars move
var starRatio=256;
// The speed of the star. Yes, all star's have the same speed.
var starSpeed=4;
// Play around with the values for star speed, I noticed a cool effect if we made the star speed 0. Hence, I created a variable to save the star speed in those cases
var starSpeedPrev=0;
// Data structure to hold the position of all the stars
var star=new Array(n);
// Just a constant to hold the opacity
var opacity=0.1;
// Mouse Positions
var cursorX=0;
var cursorY=0;
// Context of our canvas so we can draw stuff on it
var context;
// Holds the keycode of the key that was most recently pressed
var key;
// Holds the actual timeout
var timeout;
// The time we want to wait between each redraw. 0 goes the fastest
var waitTime=0;
// Boolean for if the animation is running
var isRunning=true;

// To start the animation
function start(){
	resize();
	animate();
}
// if the document is resized or the device orientation is changed
function resize(){
	// For maximum backwards compatibility we put this in a if-statement
	if(document.documentElement){
		w=document.documentElement.clientWidth;
		h=document.documentElement.clientHeight;
	}else{
		w=document.body.clientWidth;
		h=document.body.clientHeight;
	}
	// Just some calculations based on the width and the height of the viewport
	x=Math.round(w/2);
	y=Math.round(h/2);
	z=(w+h)/2;
	starColorRatio=1/z;
	// Initially we set the mouse to point to the middle of the viewport
	cursorX=x;
	cursorY=y;
	init();
}
/* Initialize the stars and the canvas */
function init(){
	/* Initialize the stars.
	Since the ship is in the middle, we assume
	Each star has the following properties:
	1.[0] Actual X-coordinate of position in prespective of ship
	2.[1] Actual Y-coordinate of position in prespective of ship
	3.[2] Actual Z-coordinate of position in prespective of ship
	4.[3] Calculated X (represents X-coordinate on screen)
	5.[4] Calculated Y (represents Y-coordinate on screen)
	*/
	for(var i=0;i<n;i++){
		star[i]=new Array(5);
		star[i][0]=Math.random()*w*2-x*2;
		star[i][1]=Math.random()*h*2-y*2;
		star[i][2]=Math.round(Math.random()*z);
		star[i][3]=0;
		star[i][4]=0;
	}
	/* make sure the canvas has the correct properties */
	var space=document.getElementById('space');
	space.style.position='absolute';
	space.width=w;
	space.height=h;
	/* Get the context from the canvas */
	context=space.getContext('2d');
	context.fillStyle='rgb(0,0,0)';
	context.strokeStyle='rgb(255,255,255)';
}
function animate(){
	var mouseX=cursorX-x;
	var mouseY=cursorY-y;
	context.fillRect(0,0,w,h);
	for(var i=0;i<n;i++){
		// Flag for if the star is offscreen (we don't want to draw it)
		var test=true;
		/* Save the stars calculated position so we can use it for drawing */
		var starXPrev=star[i][3];
		var starYPrev=star[i][4];
		/* Update the Star */
		star[i][0]+=mouseX>>4;
		star[i][1]+=mouseY>>4;
		star[i][2]-=starSpeed;
		/* Check the boundary conditions to make sure stars aren't offscreen. */
		if(star[i][0]>x<<1){ 
			star[i][0]-=w<<1; 
			test=false; 
		} 
		if(star[i][0]<-x<<1){ 
			star[i][0]+=w<<1; 
			test=false;
		}
		if(star[i][1]>y<<1){ 
			star[i][1]-=h<<1; 
			test=false; 
		} 
		if(star[i][1]<-y<<1){ 
			star[i][1]+=h<<1; 
			test=false; 
		}
		if(star[i][2]>z){ 
			star[i][2]-=z; 
			test=false;
		} 
		if(star[i][2]<0){ 
			star[i][2]+=z; 
			test=false; 
		}
		// Our calculated position and where the star is going to be drawn on the screen
		star[i][3]=x + (star[i][0]/star[i][2]) * starRatio;
		star[i][4]=y + (star[i][1]/star[i][2]) * starRatio;
		// Actually draw the object, if the star isn't offscreen
		if(starXPrev>0&&starXPrev<w&&starYPrev>0&&starYPrev<h&&test){
			// Note: all stars, even though appear the be dots, are actually drawn as lines
			// LineWidth is Calculated so that if the star is closer to the ship, make the star appear bigger
			context.lineWidth=(1-starColorRatio*star[i][2])*2;
			context.beginPath();
			// Draw the star from its previous position to the new position
			context.moveTo(starXPrev,starYPrev);
			context.lineTo(star[i][3],star[i][4]);
			context.stroke();
			context.closePath();
		}
	}
	if(isRunning){
		timeout=setTimeout('animate()',waitTime);
	}
}
// Method's for handling mouse and key inputs
function mouseMove(evt){
	evt=evt||event;
	cursorX=evt.pageX;
	cursorY=evt.pageY;
}
function keyPress(evt){
	evt=evt||event;
	key=evt.which||evt.keyCode;
	switch(key){
		// P or p Key. Pauses the animation.
		case 112: case 80:
			isRunning=!isRunning;
			if(isRunning){
				timeout=setTimeout('animate()',waitTime);
			}else{
				clearTimeout(timeout);
			}
			break;
		// SPACE key. We save the star speed and set it to 0 for a nice effect
		case 32:
			starSpeedPrev = (starSpeed != 0) ? starSpeed:starSpeedPrev;
			starSpeed = (starSpeed != 0) ? 0:starSpeedPrev;
			break;
		// ENTER or RETURN key. We make the ship go lightspeed.
		case 13:
			context.fillStyle = 'rgba(0,0,0,'+opacity+')';
			break;
	}
}
function keyUp(){
	if(key == 13){
		context.fillStyle='rgb(0,0,0)';
	}
}
// The mousewheel changes the star speed. Takes into account compatibility
function mouseWheel(evt){
	evt=evt||event;
	var delta=0;
	if(evt.wheelDelta){
		delta=evt.wheelDelta/120;
	}else if(evt.detail){
		delta=-evt.detail/3;
	}
	starSpeed+=(delta>=0)?-0.2:0.2;
	if(evt.preventDefault){
		evt.preventDefault();
	}
}
// Assign document handlers to appropriate methods so we can handle mouse and key inputs
document.onmousemove=mouseMove;
document.onkeypress=keyPress;
document.onkeyup=keyUp;
document.onmousewheel=mouseWheel;
// For maximum backwards compatibility we put this in a if-statement
if(window.addEventListener){
	window.addEventListener('DOMMouseScroll',mouseWheel,false);
}
