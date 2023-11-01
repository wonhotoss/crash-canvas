"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let target = document.getElementById("main-canvas");
(function update() {
    return __awaiter(this, void 0, void 0, function* () {
    });
})();
let names = [];
for (var i = 0; i < 20; ++i) {
    names.push({
        name: `name ${i}`,
        xfrom: target.width / 20 * i,
        yfrom: target.height / 20 * i,
    });
}
function render() {
    draw_lamp(target, (Date.now() % 2000) / 2000, 2);
    requestAnimationFrame(render);
}
render();
function draw_lamp(canvas, xmax01, power) {
    // console.log(canvas);
    var ctx = canvas.getContext('2d');
    let width = canvas.width;
    let height = canvas.height;
    // clear
    ctx.clearRect(0, 0, width, height);
    ctx.rect(0, 0, width, height);
    ctx.fillStyle = 'black';
    ctx.fill();
    // lamp    
    ctx.beginPath();
    // let x = width * xmax;
    // let y = 1 - y01;
    ctx.moveTo(0, height);
    const resolution = 100;
    let x01 = 0;
    let x = 0;
    let points = [];
    for (let i = 0; i < resolution && x01 <= xmax01; ++i) {
        x01 = 1 / resolution * i;
        x = width * x01;
        let height01 = Math.pow(x01, power);
        let y = height * (1 - height01);
        points.push({ x, y });
    }
    for (let p of points) {
        ctx.lineTo(p.x, p.y);
    }
    ctx.lineTo(x, height);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, height, width, 0);
    gradient.addColorStop(0, "black");
    gradient.addColorStop(1, "purple");
    ctx.fillStyle = gradient;
    ctx.fill();
    // lamp bound
    // ctx.createLinearGradient()
    let line_points0 = [];
    let line_points1 = [];
    for (let i = 0; i < points.length - 1; ++i) {
        let p0 = points[i];
        let p1 = points[i + 1];
        let diff = { x: p1.x - p0.x, y: p1.y - p0.y };
        line_points0.push({
            x: p0.x + -diff.y,
            y: p0.y + diff.x,
        });
        line_points1.unshift({
            x: p0.x + diff.y,
            y: p0.y + -diff.x,
        });
    }
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let p of line_points0) {
        ctx.lineTo(p.x, p.y);
    }
    for (let p of line_points1) {
        ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    const line_gradient = ctx.createLinearGradient(0, height, width, 0);
    gradient.addColorStop(0, "white");
    gradient.addColorStop(1, "purple");
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.beginPath();
    let tip = points[points.length - 1];
    ctx.arc(tip.x, tip.y, 10, 0, 2 * Math.PI);
    // ctx.closePath();
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.font = "10px serif";
    for (let n of names) {
        ctx.fillText(n.name, n.xfrom, height - n.yfrom + +x01 * height);
    }
    // ruler
    ctx.lineWidth = 1;
    ctx.strokeStyle = "grey";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
    ctx.stroke();
    // ctx.moveTo(0, 0);
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width, height);
    ctx.stroke();
    // ctx.closePath();
}
