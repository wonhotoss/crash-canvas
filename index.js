"use strict";
const MARGIN = 100;
const WINDOW_WIDTH_MIN_SEC = 2;
const WINDOW_HEIGHT_MIN_MAG = 10;
const RESOLUTION = 100;
const FPS = 60;
const RULER_TICK_LENGTH = 10;
const EVACUATOR_LIFETIME_SEC = 5;
const MAG_GRAVITY = -1;
class game {
    constructor() {
        this.target = document.getElementById("main-canvas");
        this._context = null;
        this.id = -1;
        this.start_at_ms = -1;
        this.end_at_sec = -1;
        this.evacuator_idx = -1;
        this.evacuators = [];
    }
    get width() { return this.target.width; }
    get height() { return this.target.height; }
    get context() { return this._context || (this._context = this.target.getContext('2d')); }
    get_canvas_xy(sec, mag) {
        let x = MARGIN + (this.width - MARGIN * 2) * sec / window_width_sec;
        let y = MARGIN + (this.height - MARGIN * 2) * (1 - mag / window_height_mag);
        return {
            x,
            y,
            xy: [x, y]
        };
    }
    xline(sec, mag, length) {
        let ctx = this.context;
        ctx.lineWidth = 1;
        ctx.strokeStyle = "grey";
        ctx.beginPath();
        let center = this.get_canvas_xy(sec, mag);
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(center.x + length, center.y);
        ctx.stroke();
    }
    yline(sec, mag, length) {
        let ctx = this.context;
        ctx.lineWidth = 1;
        ctx.strokeStyle = "grey";
        ctx.beginPath();
        let center = this.get_canvas_xy(sec, mag);
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(center.x, center.y + length);
        ctx.stroke();
    }
    text(s, sec, mag, xoffset, yoffset) {
        let ctx = this.context;
        let center = this.get_canvas_xy(sec, mag);
        ctx.fillText(s.toString(), center.x + xoffset, center.y + yoffset);
    }
    get_ruler_unit(x) {
        // find first number
        let floored_log10 = Math.floor(Math.log10(x));
        let unit = Math.pow(10, floored_log10);
        let first_digit = Math.floor(x / unit);
        if (first_digit < 5) {
            unit /= 2;
        }
        return unit;
    }
}
;
let current_game = new game();
current_game.id = 0;
current_game.start_at_ms = Date.now(),
    current_game.end_at_sec = 0;
current_game.evacuator_idx = 0;
current_game.evacuators = [];
function get_lottie() {
    return window['lottie'];
}
function start_game(canvas) {
    current_game = new game();
    current_game.target = canvas;
    current_game.id = current_game.id + 1;
    current_game.start_at_ms = Date.now();
    current_game.end_at_sec = 0;
    current_game.evacuator_idx = 0;
    current_game.evacuators = [];
    current_game.context.save();
    let anim = get_lottie().loadAnimation({
        // container: document.getElementById('lottie-here'), // the dom element that will contain the animation
        container: null,
        renderer: 'canvas',
        // loop: true,
        loop: false,
        autoplay: false,
        // autoplay: true,
        // path: 'https://lottie.host/272b60dd-462d-42a3-8ed6-fec4143633d6/X4FxBascRI.json', // the path to the animation json
        path: 'Animation - 1702524528465.json',
        // path: 'Animation - 1702524528465.lottie',
        rendererSettings: {
            context: current_game.context,
            scaleMode: 'noScale',
            clearCanvas: false,
            // clearCanvas: true,
        }
    });
    console.log(anim);
    // console.log(current_game.context.getTransform());
    // console.log(current_game.context.globalCompositeOperation);
    // anim.addEventListener('enterFrame', () => {
    // current_game.context.save();
    // console.log(current_game.context.getTransform());
    // console.log('enterFrame')
    // });
    // anim.addEventListener('drawnFrame', () => {
    // current_game.context.restore();
    //     console.log(current_game.context.getTransform());
    // console.log('drawnFrame')
    // });
    // let anim = 1;
    current_game.context.restore();
    repeat_tick(current_game, anim);
    repeat_request_dummy_exit(current_game);
}
function repeat_request_dummy_exit(game) {
    if (game.id == current_game.id) {
        let elapsed_sec = (Date.now() - game.start_at_ms) / 1000;
        while (game.evacuators.length && game.evacuators[0].sec_at + EVACUATOR_LIFETIME_SEC < elapsed_sec) {
            game.evacuators.shift();
        }
        if (!current_game.end_at_sec) {
            game.evacuators.push({
                name: `evacuator #${game.evacuator_idx++}`,
                sec_at: elapsed_sec,
                mag_at: estimate_mag(elapsed_sec),
                sec_v: Math.random() - 0.5,
                mag_v: Math.random(),
            });
        }
        setTimeout(() => repeat_request_dummy_exit(game), 500);
    }
}
function end_game(x) {
    if (!current_game.end_at_sec) {
        current_game.end_at_sec = (Date.now() - current_game.start_at_ms) / 1000;
    }
}
function estimate_mag(elapsed_sec) {
    // return Math.pow(elapsed_sec, 2);
    let ms = elapsed_sec * 1000;
    let r = 0.00006;
    // return Math.floor(100 * Math.pow(Math.E, r * ms));
    return 100 * Math.pow(Math.E, r * ms);
}
let window_width_sec = 1;
let window_height_mag = 1;
function repeat_tick(game, anim) {
    if (game.id == current_game.id) {
        let ctx = game.context;
        ctx.reset();
        // clear
        ctx.clearRect(0, 0, game.width, game.height);
        ctx.rect(0, 0, game.width, game.height);
        ctx.fillStyle = 'black';
        ctx.fill();
        if (offscreen_canvas) {
            ctx.drawImage(offscreen_canvas, game.width / 2, game.height / 2);
        }
        let elapsed_sec = current_game.end_at_sec || (Date.now() - game.start_at_ms) / 1000;
        ctx.save();
        ctx.rotate(myradian * Math.PI);
        ctx.translate(0, 200);
        ctx.scale(0.75, 0.75);
        anim.goToAndStop(((elapsed_sec) % anim.getDuration()) * 1000, false /* isFrame */);
        ctx.restore();
        // ctx.reset();
        ctx.save();
        ctx.translate(300, 200);
        ctx.scale(0.5, 0.5);
        anim.goToAndStop(((elapsed_sec) % anim.getDuration()) * 1000, false /* isFrame */);
        ctx.restore();
        // lamp   
        window_width_sec = Math.max(WINDOW_WIDTH_MIN_SEC, elapsed_sec);
        window_height_mag = Math.max(WINDOW_HEIGHT_MIN_MAG, estimate_mag(window_width_sec));
        ;
        ctx.beginPath();
        ctx.moveTo(...game.get_canvas_xy(0, 0).xy);
        let sec = 0;
        let points = [];
        for (let i = 0; i < RESOLUTION && sec <= elapsed_sec; ++i) {
            sec = elapsed_sec / RESOLUTION * i;
            let mag = estimate_mag(sec);
            points.push(game.get_canvas_xy(sec, mag));
        }
        for (let p of points) {
            ctx.lineTo(p.x, p.y);
        }
        ctx.lineTo(...game.get_canvas_xy(elapsed_sec, 0).xy);
        ctx.closePath();
        const gradient = ctx.createLinearGradient(0, game.height, game.width, 0);
        gradient.addColorStop(0, "black");
        gradient.addColorStop(1, current_game.end_at_sec ? "gray" : "purple");
        ctx.fillStyle = gradient;
        ctx.fill();
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
        ctx.moveTo(...game.get_canvas_xy(0, 0).xy);
        for (let p of line_points0) {
            ctx.lineTo(p.x, p.y);
        }
        for (let p of line_points1) {
            ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        const line_gradient = ctx.createLinearGradient(0, game.height, game.width, 0);
        line_gradient.addColorStop(1, "white");
        line_gradient.addColorStop(0, current_game.end_at_sec ? "gray" : "purple");
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
        game.yline(0, 0, -(game.height - MARGIN * 2));
        let mag_unit = game.get_ruler_unit(window_height_mag);
        for (let mag = mag_unit; mag < window_height_mag; mag += mag_unit) {
            game.xline(0, mag, -RULER_TICK_LENGTH);
            game.text(mag.toString(), 0, mag, -RULER_TICK_LENGTH, 0);
        }
        ctx.textAlign = 'center';
        game.xline(0, 0, game.width - MARGIN * 2);
        let sec_unit = game.get_ruler_unit(window_width_sec);
        for (let sec = sec_unit; sec < window_width_sec; sec += sec_unit) {
            game.yline(sec, 0, RULER_TICK_LENGTH);
            game.text(sec.toString(), sec, 0, 0, RULER_TICK_LENGTH);
        }
        let last_alpha = ctx.globalAlpha;
        let infinite_elapsed_sec = (Date.now() - game.start_at_ms) / 1000;
        for (let evacuator of game.evacuators) {
            let elapsed_after_evacuate_sec = infinite_elapsed_sec - evacuator.sec_at;
            let sec = evacuator.sec_at + evacuator.sec_v * elapsed_after_evacuate_sec;
            let mag = evacuator.mag_at + evacuator.mag_v * elapsed_after_evacuate_sec + 0.5 * MAG_GRAVITY * elapsed_after_evacuate_sec * elapsed_after_evacuate_sec;
            ctx.globalAlpha = 1 - Math.min(1, (elapsed_after_evacuate_sec / EVACUATOR_LIFETIME_SEC));
            game.text(evacuator.name, sec, mag, 0, 0);
        }
        ctx.globalAlpha = last_alpha;
        // // anim.renderFrame();
        // ctx.restore();
        setTimeout(() => repeat_tick(game, anim), 1000 / FPS);
    }
}
let offscreen_canvas = undefined;
let myradian = 0;
start_game(document.getElementById("main-canvas"));
