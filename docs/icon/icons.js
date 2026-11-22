// A11y Matrix Theme icon concepts. Every design draws in a 256-unit space and is deterministic
// (seeded RNG), so the review page and the PNG renderer produce the same pixels.
(function () {
    // Theme palette (src/palette.ts): black ground, Matrix green tiers.
    const C = {
        bg: '#000000',
        primary: '#00ff41', // accent.primary, highlights
        primaryText: '#00f33e', // accent.primaryText
        border: '#00ad2c', // accent.border, 7:1 tier
        boundary: '#007a1f', // accent.boundary
        fill: '#004913', // accent.fill
        fillDim: '#001806', // accent.fillDim
        hot: '#c8ffd2', // phosphor hot spot at a rain head
    };
    const FONT_RAIN = 'VT323';
    const FONT_PROMPT = 'JetBrains Mono';

    function rng(seed) {
        let a = seed >>> 0;
        return function () {
            a = (a + 0x6d2b79f5) >>> 0;
            let t = a;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function rr(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    function tile(ctx, stroke) {
        rr(ctx, 6, 6, 244, 244, 44);
        ctx.fillStyle = C.bg;
        ctx.fill();
        if (stroke) outline(ctx, stroke);
    }

    function outline(ctx, stroke) {
        ctx.lineWidth = 5;
        ctx.strokeStyle = stroke;
        rr(ctx, 8.5, 8.5, 239, 239, 42);
        ctx.stroke();
    }

    function clipTile(ctx) {
        rr(ctx, 8, 8, 240, 240, 42);
        ctx.clip();
    }

    // Vertical phosphor streak behind a rain column: fades in towards the head.
    function columnStreak(ctx, x, yTop, yHead, width, alpha) {
        const g = ctx.createLinearGradient(0, yTop, 0, yHead);
        g.addColorStop(0, 'rgba(0,255,65,0)');
        g.addColorStop(1, `rgba(0,255,65,${alpha})`);
        ctx.fillStyle = g;
        ctx.fillRect(x - width / 2, yTop, width, yHead - yTop);
    }

    // Digital rain: columns of digits with a bright head and a fading trail.
    function rain(ctx, rand, o) {
        const { x0, y0, w, h, cell, colors, headGlow, density, alpha = 1, skip = [], streaks = 0, hot } = o;
        ctx.font = `${Math.round(cell * 1.15)}px ${FONT_RAIN}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const cols = Math.floor(w / cell);
        const rows = Math.ceil(h / cell) + 1;
        for (let c = 0; c < cols; c++) {
            const cx = x0 + c * cell + cell / 2;
            if (rand() > density || skip.some(([a, b]) => cx > a && cx < b)) continue;
            const head = Math.floor(rand() * (rows + 4)) - 2;
            const len = 3 + Math.floor(rand() * (rows * 0.7));
            if (streaks > 0) {
                const yHead = y0 + head * cell + cell / 2;
                columnStreak(ctx, cx, yHead - len * cell, yHead, cell * 0.55, streaks * alpha);
            }
            for (let k = 0; k < len; k++) {
                const r = head - k;
                if (r < 0 || r >= rows) continue;
                const y = y0 + r * cell + cell / 2;
                const glyph = String(Math.floor(rand() * 10));
                const t = k / len;
                ctx.globalAlpha = alpha * (k === 0 ? 1 : Math.max(0.18, 1 - t));
                if (k === 0) {
                    ctx.shadowColor = C.primary;
                    ctx.shadowBlur = headGlow;
                    ctx.fillStyle = hot || colors[0];
                } else {
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = colors[Math.min(colors.length - 1, 1 + Math.floor(t * (colors.length - 1)))];
                }
                ctx.fillText(glyph, cx, y);
            }
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }

    function scanlines(ctx, gap, alpha) {
        ctx.fillStyle = `rgba(0,0,0,${alpha})`;
        for (let y = 0; y < 256; y += gap) ctx.fillRect(0, y, 256, 1);
    }

    // Glitch: shifts a horizontal band of the drawn pixels sideways, wrapping inside [xa, xb]
    // so nothing leaves the screen area.
    function glitchBand(ctx, size, y, h, dx, xa, xb) {
        const k = size / 256;
        const X = Math.round(xa * k);
        const w = Math.round((xb - xa) * k);
        const Y = Math.round(y * k);
        const H = Math.max(1, Math.round(h * k));
        const src = ctx.getImageData(X, Y, w, H);
        const out = ctx.createImageData(w, H);
        const s = ((Math.round(dx * k) % w) + w) % w;
        for (let row = 0; row < H; row++) {
            for (let x = 0; x < w; x++) {
                const from = (row * w + x) * 4;
                const to = (row * w + ((x + s) % w)) * 4;
                for (let ch = 0; ch < 4; ch++) out.data[to + ch] = src.data[from + ch];
            }
        }
        ctx.putImageData(out, X, Y);
    }

    function streak(ctx, y, h, x0, x1, alpha) {
        const g = ctx.createLinearGradient(x0, 0, x1, 0);
        g.addColorStop(0, 'rgba(0,255,65,0)');
        g.addColorStop(0.25, `rgba(0,255,65,${alpha})`);
        g.addColorStop(0.8, `rgba(0,255,65,${alpha})`);
        g.addColorStop(1, 'rgba(0,255,65,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x0, y, x1 - x0, h);
    }

    // Phosphor bloom: adds a blurred copy of the canvas on top of itself.
    function bloom(ctx, size, blur, alpha) {
        const copy = document.createElement('canvas');
        copy.width = copy.height = size;
        copy.getContext('2d').drawImage(ctx.canvas, 0, 0);
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = alpha;
        ctx.filter = `blur(${(blur * size) / 256}px)`;
        ctx.drawImage(copy, 0, 0);
        ctx.restore();
    }

    function screen(ctx) {
        rr(ctx, 26, 26, 204, 204, 26);
        const g = ctx.createRadialGradient(128, 118, 20, 128, 128, 150);
        g.addColorStop(0, '#002b0b');
        g.addColorStop(0.6, C.fillDim);
        g.addColorStop(1, '#000000');
        ctx.fillStyle = g;
        ctx.fill();
    }

    // Draws "$" and a block underscore cursor. alignDescent puts the cursor's bottom at the glyph's bottom.
    function prompt(ctx, font, size, x, baseline, cursorW, cursorH, gapAfter, alignDescent) {
        ctx.font = font;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = C.primary;
        ctx.shadowColor = C.primary;
        ctx.shadowBlur = size * 0.12;
        ctx.fillText('$', x, baseline);
        const m = ctx.measureText('$');
        const bottom = alignDescent ? baseline + m.actualBoundingBoxDescent : baseline;
        ctx.fillRect(x + m.width + gapAfter, bottom - cursorH, cursorW, cursorH);
        ctx.shadowBlur = 0;
    }

    const RAIN_COLORS = [C.primary, C.primaryText, C.border, C.boundary, C.fill];

    const designs = [
        {
            id: 'm1',
            family: 'Matrix rain',
            name: 'Digital Rain',
            note: 'Full-bleed digit rain: hot heads, vertical phosphor streaks, two glitch bands and faint scanlines.',
            draw(ctx, size) {
                const rand = rng(1101);
                tile(ctx, null);
                ctx.save();
                clipTile(ctx);
                rain(ctx, rand, {
                    x0: 10,
                    y0: 8,
                    w: 240,
                    h: 240,
                    cell: 20,
                    density: 0.92,
                    headGlow: 10,
                    colors: RAIN_COLORS,
                    hot: C.hot,
                    streaks: 0.22,
                });
                glitchBand(ctx, size, 92, 9, 9, 10, 246);
                glitchBand(ctx, size, 168, 6, -12, 10, 246);
                streak(ctx, 101, 2, 12, 244, 0.85);
                streak(ctx, 174, 1.5, 30, 230, 0.6);
                scanlines(ctx, 3, 0.28);
                ctx.restore();
                outline(ctx, C.border);
            },
        },
        {
            id: 'm2',
            family: 'Matrix rain',
            name: 'Phosphor CRT',
            note: 'Dense rain on a curved phosphor screen in a bezel: vignette, 2 px scanlines, a rolling bar and bloom.',
            draw(ctx, size) {
                const rand = rng(2202);
                tile(ctx, C.boundary);
                ctx.save();
                screen(ctx);
                ctx.clip();
                rain(ctx, rand, {
                    x0: 28,
                    y0: 26,
                    w: 200,
                    h: 204,
                    cell: 15,
                    density: 1,
                    headGlow: 8,
                    colors: RAIN_COLORS,
                    hot: C.hot,
                    streaks: 0.2,
                });
                const roll = ctx.createLinearGradient(0, 120, 0, 160);
                roll.addColorStop(0, 'rgba(0,255,65,0)');
                roll.addColorStop(0.5, 'rgba(0,255,65,0.10)');
                roll.addColorStop(1, 'rgba(0,255,65,0)');
                ctx.fillStyle = roll;
                ctx.fillRect(26, 120, 204, 40);
                glitchBand(ctx, size, 132, 8, 10, 26, 230);
                streak(ctx, 139, 2, 26, 230, 0.9);
                scanlines(ctx, 2, 0.38);
                ctx.restore();
                bloom(ctx, size, 5, 0.55);
            },
        },
        {
            id: 'm3',
            family: 'Matrix rain',
            name: 'Eleven',
            note: 'Dim rain with two bright columns of 1s, the "11" of a11y, cut by one glitch band.',
            draw(ctx, size) {
                const rand = rng(3303);
                tile(ctx, null);
                ctx.save();
                clipTile(ctx);
                rain(ctx, rand, {
                    x0: 10,
                    y0: 8,
                    w: 240,
                    h: 240,
                    cell: 20,
                    density: 0.85,
                    headGlow: 0,
                    colors: [C.boundary, C.boundary, C.fill, C.fill],
                    alpha: 0.75,
                    skip: [
                        [88, 120],
                        [136, 168],
                    ],
                });
                ctx.font = `30px ${FONT_RAIN}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                for (const [x, phase] of [
                    [104, 0],
                    [152, 3],
                ]) {
                    columnStreak(ctx, x, 8, 248, 14, 0.12);
                    for (let r = 0; r < 10; r++) {
                        const y = 22 + r * 24;
                        const t = ((r + phase) % 10) / 9;
                        ctx.shadowColor = C.primary;
                        ctx.shadowBlur = 12;
                        ctx.fillStyle = t > 0.85 ? C.hot : t > 0.4 ? C.primary : C.border;
                        ctx.globalAlpha = 0.45 + 0.55 * t;
                        ctx.fillText('1', x, y);
                    }
                }
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 0;
                glitchBand(ctx, size, 148, 10, -10, 10, 246);
                streak(ctx, 157, 2, 14, 242, 0.8);
                scanlines(ctx, 3, 0.25);
                ctx.restore();
                outline(ctx, C.border);
            },
        },
        {
            id: 'c1',
            family: 'Command prompt',
            name: 'Terminal Window',
            note: 'A window with a title bar and three dots, and a large $ _ prompt below.',
            draw(ctx) {
                tile(ctx, C.border);
                ctx.lineWidth = 4;
                ctx.strokeStyle = C.border;
                ctx.beginPath();
                ctx.moveTo(10, 62);
                ctx.lineTo(246, 62);
                ctx.stroke();
                [40, 68, 96].forEach((x, i) => {
                    ctx.beginPath();
                    ctx.arc(x, 36, 8, 0, Math.PI * 2);
                    if (i === 0) {
                        ctx.fillStyle = C.primary;
                        ctx.fill();
                    } else {
                        ctx.lineWidth = 3;
                        ctx.stroke();
                    }
                });
                prompt(ctx, `800 108px ${FONT_PROMPT}`, 108, 34, 196, 70, 16, 18, false);
            },
        },
        {
            id: 'c2',
            family: 'Command prompt',
            name: 'Minimal Prompt',
            note: 'Just the prompt, centred and large, with a soft phosphor glow. Holds up best at small sizes.',
            draw(ctx) {
                tile(ctx, C.border);
                ctx.font = `800 132px ${FONT_PROMPT}`;
                const w = ctx.measureText('$').width + 20 + 78;
                prompt(ctx, `800 132px ${FONT_PROMPT}`, 132, 128 - w / 2, 176, 78, 18, 20, false);
            },
        },
        {
            id: 'c3',
            family: 'Command prompt',
            name: 'CRT Prompt',
            note: 'The prompt in a pixel terminal face on a phosphor screen with faint rain, scanlines and a glitch band.',
            draw(ctx, size) {
                const rand = rng(6606);
                tile(ctx, C.boundary);
                ctx.save();
                screen(ctx);
                ctx.clip();
                rain(ctx, rand, {
                    x0: 30,
                    y0: 26,
                    w: 196,
                    h: 204,
                    cell: 17,
                    density: 0.7,
                    headGlow: 0,
                    colors: [C.border, C.boundary, C.fill],
                    alpha: 0.35,
                });
                ctx.font = `150px ${FONT_RAIN}`;
                const w = ctx.measureText('$').width + 16 + 70;
                prompt(ctx, `150px ${FONT_RAIN}`, 150, 128 - w / 2, 172, 70, 16, 16, true);
                glitchBand(ctx, size, 150, 8, 7, 26, 230);
                streak(ctx, 160, 2, 26, 230, 0.9);
                scanlines(ctx, 2, 0.36);
                ctx.restore();
                bloom(ctx, size, 5, 0.5);
            },
        },
    ];

    function fontsReady() {
        if (!document.fonts) return Promise.resolve();
        return Promise.all([
            document.fonts.load(`32px ${FONT_RAIN}`),
            document.fonts.load(`800 32px "${FONT_PROMPT}"`),
        ]).then(() => document.fonts.ready);
    }

    /** Draws design `id` onto `canvas` at `size` x `size` device pixels. */
    function draw(id, canvas, size) {
        const d = designs.find((x) => x.id === id);
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.clearRect(0, 0, size, size);
        ctx.save();
        ctx.scale(size / 256, size / 256);
        d.draw(ctx, size);
        ctx.restore();
    }

    window.A11yIcons = { designs, draw, fontsReady };
})();
