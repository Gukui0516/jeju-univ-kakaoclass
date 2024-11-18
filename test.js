// draws a red rectangle
//1. get the canvas reference
canvas = document.getElementById("canvas");
//2. set the context to 2D to draw basic shapes
ctx = canvas.getContext("2d");
//3. fill it with the color red
ctx.fillStyle = 'red';
//4. and draw a rectangle with these parameters, setting location and size
ctx.fillRect(0,0, 200, 200) // x,y,width, height