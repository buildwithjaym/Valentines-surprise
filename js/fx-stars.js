function StarsFX(canvas) {
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = 1;

    const stars = [];
    const sparks = [];
    let mode = "soft";

    function rand(a, b) { return a + Math.random() * (b - a); }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

    function resize() {
        dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        w = Math.floor(window.innerWidth * dpr);
        h = Math.floor(window.innerHeight * dpr);
        canvas.width = w;
        canvas.height = h;
        seed();
    }

    function seed() {
        stars.length = 0;
        const area = window.innerWidth * window.innerHeight;
        const base = Math.floor(area / 9000);
        const count = clamp(base, 80, 220);

        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: rand(0.6, 1.8) * dpr,
                a: rand(0.10, 0.55),
                target: rand(0.25, 0.95),
                speed: rand(0.008, 0.030),
                hold: rand(0, 90),
                tint: Math.random() < 0.18 ? 1 : 0
            });
        }
    }

    function setMode(m) { mode = m; }

    function burst() {
        const cx = w * 0.5;
        const cy = h * 0.38;
        for (let i = 0; i < 26; i++) {
            sparks.push({
                x: cx + rand(-22, 22) * dpr,
                y: cy + rand(-22, 22) * dpr,
                vx: rand(-2.0, 2.0) * dpr,
                vy: rand(-3.0, 1.0) * dpr,
                life: rand(26, 58),
                max: 58
            });
        }
    }

    function drawStar(s) {
        const a = clamp(s.a, 0, 1);

        if (mode === "glow") {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r * 2.8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,79,216,${0.08 * a})`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r * 2.0, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(139,92,255,${0.06 * a})`;
            ctx.fill();
        } else if ((mode === "romantic" || mode === "sparkle") && s.tint) {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r * 2.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,79,216,${0.06 * a})`;
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.85 * a})`;
        ctx.fill();
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];

            if (s.hold > 0) s.hold -= 1;
            else {
                if (Math.random() < 0.012) {
                    s.target = rand(0.60, 1.0);
                    s.speed = rand(0.018, 0.045);
                    s.hold = rand(10, 34);
                } else if (Math.random() < 0.018) {
                    s.target = rand(0.10, 0.35);
                    s.speed = rand(0.010, 0.030);
                    s.hold = rand(8, 28);
                }
            }

            s.a += (s.target - s.a) * s.speed;
            drawStar(s);
        }

        if (mode === "romantic" || mode === "sparkle" || mode === "glow") {
            const g = ctx.createRadialGradient(w * 0.22, h * 0.22, 0, w * 0.22, h * 0.22, Math.max(w, h) * 0.75);
            g.addColorStop(0, mode === "glow" ? "rgba(255,79,216,0.16)" : "rgba(255,79,216,0.12)");
            g.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
        }

        for (let i = sparks.length - 1; i >= 0; i--) {
            const p = sparks[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05 * dpr;
            p.life -= 1;

            const a = clamp(p.life / p.max, 0, 1);

            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.4 * dpr, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${0.80 * a})`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(p.x, p.y, 3.0 * dpr, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,79,216,${0.18 * a})`;
            ctx.fill();

            if (p.life <= 0) sparks.splice(i, 1);
        }

        requestAnimationFrame(draw);
    }

    resize();
    draw();

    return { resize, burst, setMode };
}
