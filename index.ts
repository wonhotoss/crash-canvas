draw_lamp(
    document.getElementById("main-canvas") as HTMLCanvasElement,
    0,
    1,
);

function draw_lamp(canvas: HTMLCanvasElement, xmax: number, power: number){
    console.log(canvas);
    var ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
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