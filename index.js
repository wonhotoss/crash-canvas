"use strict";
let current_game = {
    id: 0,
    start_at_ms: Date.now(),
    end_at_sec: 0,
    evacuator_idx: 0,
    evacuators: [],
};
const MARGIN = 100;
const WINDOW_WIDTH_MIN_SEC = 2;
const WINDOW_HEIGHT_MIN_MAG = 10;
const RESOLUTION = 100;
const FPS = 60;
const RULER_TICK_LENGTH = 10;
const EVACUATOR_LIFETIME_SEC = 5;
const MAG_GRAVITY = -1;
let target = document.getElementById("main-canvas");
let ctx = target.getContext('2d');
let width = target.width;
let height = target.height;
function start_game() {
    current_game = {
        id: current_game.id + 1,
        start_at_ms: Date.now(),
        end_at_sec: 0,
        evacuator_idx: 0,
        evacuators: [],
    };
    repeat_tick(current_game);
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
    return Math.pow(elapsed_sec, 2);
}
let window_width_sec = 1;
let window_height_mag = 1;
function get_canvas_xy(sec, mag) {
    let x = MARGIN + (width - MARGIN * 2) * sec / window_width_sec;
    let y = MARGIN + (height - MARGIN * 2) * (1 - mag / window_height_mag);
    return {
        x,
        y,
        xy: [x, y]
    };
}
function xline(sec, mag, length) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "grey";
    ctx.beginPath();
    let center = get_canvas_xy(sec, mag);
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(center.x + length, center.y);
    ctx.stroke();
}
function yline(sec, mag, length) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "grey";
    ctx.beginPath();
    let center = get_canvas_xy(sec, mag);
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(center.x, center.y + length);
    ctx.stroke();
}
function text(s, sec, mag, xoffset, yoffset) {
    let center = get_canvas_xy(sec, mag);
    ctx.fillText(s.toString(), center.x + xoffset, center.y + yoffset);
}
function get_ruler_unit(x) {
    // find first number
    let floored_log10 = Math.floor(Math.log10(x));
    let unit = Math.pow(10, floored_log10);
    let first_digit = Math.floor(x / unit);
    if (first_digit < 5) {
        unit /= 2;
    }
    return unit;
}
function repeat_tick(game) {
    if (game.id == current_game.id) {
        // clear
        ctx.clearRect(0, 0, width, height);
        ctx.rect(0, 0, width, height);
        ctx.fillStyle = 'black';
        ctx.fill();
        // lamp   
        let elapsed_sec = current_game.end_at_sec || (Date.now() - game.start_at_ms) / 1000;
        window_width_sec = Math.max(WINDOW_WIDTH_MIN_SEC, elapsed_sec);
        window_height_mag = Math.max(WINDOW_HEIGHT_MIN_MAG, estimate_mag(window_width_sec));
        ;
        ctx.beginPath();
        ctx.moveTo(...get_canvas_xy(0, 0).xy);
        let sec = 0;
        let points = [];
        for (let i = 0; i < RESOLUTION && sec <= elapsed_sec; ++i) {
            sec = elapsed_sec / RESOLUTION * i;
            let mag = estimate_mag(sec);
            points.push(get_canvas_xy(sec, mag));
        }
        for (let p of points) {
            ctx.lineTo(p.x, p.y);
        }
        ctx.lineTo(...get_canvas_xy(elapsed_sec, 0).xy);
        ctx.closePath();
        const gradient = ctx.createLinearGradient(0, height, width, 0);
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
        ctx.moveTo(...get_canvas_xy(0, 0).xy);
        for (let p of line_points0) {
            ctx.lineTo(p.x, p.y);
        }
        for (let p of line_points1) {
            ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        const line_gradient = ctx.createLinearGradient(0, height, width, 0);
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
        yline(0, 0, -(height - MARGIN * 2));
        let mag_unit = get_ruler_unit(window_height_mag);
        for (let mag = mag_unit; mag < window_height_mag; mag += mag_unit) {
            xline(0, mag, -RULER_TICK_LENGTH);
            text(mag.toString(), 0, mag, -RULER_TICK_LENGTH, 0);
        }
        ctx.textAlign = 'center';
        xline(0, 0, width - MARGIN * 2);
        let sec_unit = get_ruler_unit(window_width_sec);
        for (let sec = sec_unit; sec < window_width_sec; sec += sec_unit) {
            yline(sec, 0, RULER_TICK_LENGTH);
            text(sec.toString(), sec, 0, 0, RULER_TICK_LENGTH);
        }
        let last_alpha = ctx.globalAlpha;
        let infinite_elapsed_sec = (Date.now() - game.start_at_ms) / 1000;
        for (let evacuator of game.evacuators) {
            let elapsed_after_evacuate_sec = infinite_elapsed_sec - evacuator.sec_at;
            let sec = evacuator.sec_at + evacuator.sec_v * elapsed_after_evacuate_sec;
            let mag = evacuator.mag_at + evacuator.mag_v * elapsed_after_evacuate_sec + 0.5 * MAG_GRAVITY * elapsed_after_evacuate_sec * elapsed_after_evacuate_sec;
            ctx.globalAlpha = 1 - Math.min(1, (elapsed_after_evacuate_sec / EVACUATOR_LIFETIME_SEC));
            text(evacuator.name, sec, mag, 0, 0);
        }
        ctx.globalAlpha = last_alpha;
        setTimeout(() => repeat_tick(game), 1000 / FPS);
    }
}
start_game();
