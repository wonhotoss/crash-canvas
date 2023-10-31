"use strict";
draw_lamp(document.getElementById("main-canvas"), 0, 1);
function draw_lamp(canvas, xmax, power) {
    console.log(canvas);
    var ctx = canvas.getContext('2d');
    let width = canvas.width;
    let height = canvas.height;
    // clear
    ctx.clearRect(0, 0, width, height);
    ctx.rect(0, 0, width, height);
    ctx.fillStyle = 'black';
    ctx.fill();
    // lamp
    ctx.fillStyle = '#f00';
    ctx.beginPath();
    // let x = width * xmax;
    // let y = 1 - y01;
    ctx.moveTo(0, height);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
    // lamp bound
    // ctx.createLinearGradient()
}
