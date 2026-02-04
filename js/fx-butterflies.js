function ButterfliesFX(canvas) {
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    let enabled = false;
    const flies = [];

    function resize() {
        w = Math.floor(window.innerWidth * dpr);
        h = Math.floor(window.innerHeight * dpr);
        canvas.width = w;
        canvas.height = h;
    }

    function rand(a, b) { return a + Math.random() * (b - a); }

    function spawn(n = 8) {
        flies.length = 0;
        for (let i = 0; i < n; i++) {
            flies.push(makeOne(true));
        }
    }

    function makeOne(startAnywhere = false) {
        const x = startAnywhere ? rand(0, w) : rand(-100 * dpr, w + 100 * dpr);
        const y = startAnywhere ? rand(h * 0.15, h * 0.8) : rand(h * 0.2, h * 0.7);
        return {
            x, y,
            baseY: y,
            t: rand(0, 1000),
            sp: rand(0.7, 1.35) * dpr,
            amp: rand(18, 60) * dpr,
            wing: rand(0, Math.PI * 2),
            size: rand(10, 18) * dpr,
            dir: Math.random() < 0.5 ? -1 : 1,
            glow: rand(0.12, 0.26)
        };
    }

    function setEnabled(v) {
        enabled = v;
        if (enabled && flies.length === 0) spawn(10); // B = 6–10 magical
    }

    function burst() {
        if (!enabled) return;
        for (let i = 0; i < 3; i++) flies.push(makeOne(true));
        while (flies.length > 12) flies.shift();
    }

    function drawButterfly(b) {
        // wing flap
        b.wing += 0.18 * b.dir;
        const flap = (Math.sin(b.wing) * 0.5 + 0.5); // 0..1
        const wingW = b.size * (0.9 + flap * 0.9);
        const wingH = b.size * (0.8 + flap * 0.5);

        // glow
        ctx.save();
        ctx.translate(b.x, b.y);

        // glow halo
        ctx.beginPath();
        ctx.arc(0, 0, b.size * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,79,216,${b.glow})`;
        ctx.fill();

        // body
        ctx.beginPath();
        ctx.roundRect(-1.2 * dpr, -b.size * 0.45, 2.4 * dpr, b.size * 0.9, 999);
        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.fill();

        // left wing
        ctx.beginPath();
        ctx.ellipse(-wingW * 0.55, 0, wingW, wingH, -0.25, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(139,92,255,0.55)";
        ctx.fill();

        // right wing
        ctx.beginPath();
        ctx.ellipse(wingW * 0.55, 0, wingW, wingH, 0.25, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,79,216,0.55)";
        ctx.fill();

        // wing highlights
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.ellipse(-wingW * 0.65, -wingH * 0.15, wingW * 0.5, wingH * 0.35, -0.25, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(wingW * 0.65, -wingH * 0.15, wingW * 0.5, wingH * 0.35, 0.25, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fill();

        ctx.restore();
    }

    function tick() {
        ctx.clearRect(0, 0, w, h);
        if (!enabled) {
            requestAnimationFrame(tick);
            return;
        }

        for (let i = 0; i < flies.length; i++) {
            const b = flies[i];
            b.t += 0.016;
            b.x += b.sp;
            b.y = b.baseY + Math.sin(b.t * 2.0) * b.amp + Math.sin(b.t * 0.9) * (b.amp * 0.25);

            // wrap
            if (b.x > w + 120 * dpr) {
                flies[i] = makeOne(false);
                flies[i].x = -120 * dpr;
            }

            drawButterfly(b);
        }

        requestAnimationFrame(tick);
    }

    resize();
    tick();

    return { resize, setEnabled, burst };
}
