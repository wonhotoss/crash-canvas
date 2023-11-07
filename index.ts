type game = {
    id: number,
    start_at_ms: number,
    end_at_x: number,
};

let current_game = {
    id: 0,
    start_at_ms: Date.now(),
    end_at_x: 0,
}

let target = document.getElementById("main-canvas") as HTMLCanvasElement;
var ctx: CanvasRenderingContext2D = target.getContext('2d') as CanvasRenderingContext2D;
let width = target.width;
let height = target.height;

function start_game(){
    current_game = {
        id: current_game.id + 1,
        start_at_ms: Date.now(),
        end_at_x: 0,
    };

    repeat_tick(current_game);
}

function end_game(x: number){
    current_game.end_at_x = x; 
}

function estimate_mag(elapsed_sec: number){
    return Math.pow(elapsed_sec, 2);
}

const MARGIN = 100;
const WINDOW_WIDTH_MIN_SEC = 2;
const WINDOW_HEIGHT_MIN_MAG = 10;
const RESOLUTION = 100;
const FPS = 60;
const RULER_TICK_LENGTH = 10;

let window_width_sec = 1;
let window_height_mag = 1;

function get_canvas_xy(sec: number, mag: number) {
// : {x: number, y: number, xy: [number, number]}{
    let x = MARGIN + (width - MARGIN * 2) * sec / window_width_sec;
    let y = MARGIN + (height - MARGIN * 2) * (1 - mag / window_height_mag);    
    return {
        x,
        y,
        xy: [x, y] as [number,  number]
    }
    // return Object.assign([x, y] as [number, number], {x, y});
    // return [x, y];
    // return {
    //     x: MARGIN + (width - MARGIN * 2) * sec / window_width_sec,
    //     y: MARGIN + (height - MARGIN * 2) * (1 - mag / window_height_mag),
    // }
}

function xline(sec: number, mag: number, length: number){
    ctx.lineWidth = 1;
    ctx.strokeStyle = "grey";            
    ctx.beginPath();
    let center = get_canvas_xy(sec, mag);    
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(center.x + length, center.y);
    ctx.stroke();
}

function yline(sec: number, mag: number, length: number){
    ctx.lineWidth = 1;
    ctx.strokeStyle = "grey";            
    ctx.beginPath();
    let center = get_canvas_xy(sec, mag);    
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(center.x, center.y + length);
    ctx.stroke();
}

function text(s: string, sec: number, mag: number, xoffset: number, yoffset: number){
    let center = get_canvas_xy(sec, mag);    
    ctx.fillText(s.toString(), center.x + xoffset, center.y + yoffset);
}

function get_ruler_unit(x: number){
    // find first number
    let floored_log10 = Math.floor(Math.log10(x));
    let unit = Math.pow(10, floored_log10);
    let first_digit = Math.floor(x / unit);
    if(first_digit < 5){
        unit /= 2;
    }
    return unit;
}

function repeat_tick(game: game){
    if(game.id == current_game.id){
        // render
        // clear
        ctx.clearRect(0, 0, width, height);
        ctx.rect(0, 0, width, height);
        ctx.fillStyle = 'black';
        ctx.fill();

        // if(!game.end_at_x){            

        // }
        // else{

        // }

        // lamp   
        let elapsed_sec = (Date.now() - game.start_at_ms) / 1000;
        // console.log(elapsed_sec);
        window_width_sec = Math.max(WINDOW_WIDTH_MIN_SEC, elapsed_sec);
        window_height_mag = Math.max(WINDOW_HEIGHT_MIN_MAG, estimate_mag(window_width_sec)); ;
        let xmax01 = elapsed_sec / window_width_sec;
        

        ctx.beginPath();       
        ctx.moveTo(...get_canvas_xy(0,0).xy);
        
        // let x01 = 0;
        // let x = 0;
        let sec = 0;
        let points: {x: number, y: number}[] = [];
        for(let i = 0; i < RESOLUTION && sec <= elapsed_sec; ++i){
            sec = elapsed_sec / RESOLUTION * i;
            let mag = estimate_mag(sec);
            // x = width * x01;
            // let height01 = Math.pow(x01, power);
            // let y = height * (1 - height01);
            points.push(get_canvas_xy(sec, mag));
        }

        for(let p of points){
            ctx.lineTo(p.x, p.y);
        }
        
        ctx.lineTo(...get_canvas_xy(elapsed_sec, 0).xy);        
        ctx.closePath();
        

        const gradient = ctx.createLinearGradient(0, height, width, 0);
        gradient.addColorStop(0, "black");    
        gradient.addColorStop(1, "purple");
        ctx.fillStyle = gradient;
        ctx.fill();

        // console.log('1');
        let line_points0: {x: number, y: number}[] = [];
        let line_points1: {x: number, y: number}[] = [];
        for(let i = 0; i < points.length - 1; ++i){
            let p0 = points[i];
            let p1 = points[i + 1];
            let diff = {x: p1.x - p0.x, y: p1.y - p0.y};
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
        ctx.moveTo(...get_canvas_xy(0, 0).xy); 
        for(let p of line_points0){
            ctx.lineTo(p.x, p.y);
        }
        for(let p of line_points1){
            ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();

        const line_gradient = ctx.createLinearGradient(0, height, width, 0);
        line_gradient.addColorStop(1, "white");    
        line_gradient.addColorStop(0, "purple");
        ctx.fillStyle = line_gradient;
        ctx.fill();

        ctx.beginPath();
        let tip = points[points.length - 1];
        ctx.arc(tip.x, tip.y, 25, 0, 2 * Math.PI);            
        ctx.fillStyle = 'white';
        ctx.fill();

        // ruler
        ctx.font = "10px serif";
        ctx.textBaseline = 'middle';

        ctx.textAlign = 'right';
        yline(0, 0, -(height - MARGIN * 2));
        let mag_unit = get_ruler_unit(window_height_mag);
        for(let mag = mag_unit; mag < window_height_mag; mag += mag_unit){
            xline(0, mag, -RULER_TICK_LENGTH);
            text(mag.toString(), 0, mag, -RULER_TICK_LENGTH, 0);
        }

        ctx.textAlign = 'center';
        xline(0, 0, width - MARGIN * 2);
        let sec_unit = get_ruler_unit(window_width_sec);
        for(let sec = sec_unit; sec < window_width_sec; sec += sec_unit){
            yline(sec, 0, RULER_TICK_LENGTH);
            text(sec.toString(), sec, 0, 0, RULER_TICK_LENGTH);
        }


        // requestAnimationFrame(() => repeat_tick(game));
        setTimeout(() => repeat_tick(game), 1000 / FPS);
    }
}

start_game();


let names: {name: string, xfrom: number, yfrom: number}[] = [];
for(var i = 0; i < 20; ++i){
    names.push({
        name: `name ${i}`,
        xfrom: target.width / 20 * i,
        yfrom: target.height / 20 * i,
    });
}

function render(){
    draw_lamp(
        target,
        (Date.now() % 2000) / 2000,
        2,
    );

    requestAnimationFrame(render);
}

// render();

function draw_lamp(canvas: HTMLCanvasElement, xmax01: number, power: number){
    // console.log(canvas);
    var ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
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
    let points: {x: number, y: number}[] = [];
    for(let i = 0; i < resolution && x01 <= xmax01; ++i){
        x01 = 1 / resolution * i;
        x = width * x01;
        let height01 = Math.pow(x01, power);
        let y = height * (1 - height01);
        points.push({x, y});        
    }

    for(let p of points){
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

    let line_points0: {x: number, y: number}[] = [];
    let line_points1: {x: number, y: number}[] = [];
    for(let i = 0; i < points.length - 1; ++i){
        let p0 = points[i];
        let p1 = points[i + 1];
        let diff = {x: p1.x - p0.x, y: p1.y - p0.y};
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
    for(let p of line_points0){
        ctx.lineTo(p.x, p.y);
    }
    for(let p of line_points1){
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
    

    for(let n of names){
        ctx.fillText(n.name, n.xfrom, height - n.yfrom +  + x01 * height);
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