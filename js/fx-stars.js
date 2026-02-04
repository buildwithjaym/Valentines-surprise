function StarsFX(canvas) {
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    const stars = [];
    const sparks = [];
    let mode = "soft";

    function resize() {
        w = Math.floor(window.innerWidth * dpr);
        h = Math.floor(window.innerHeight * dpr);
        canvas.width = w;
        canvas.height = h;
    }

    function rand(a, b) { return a + Math.random() * (b - a); }

    function seed() {
        stars.length = 0;
        const count = Math.floor((window.innerWidth * window.innerHeight) / 9000);
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: rand(0.6, 1.8) * dpr,
                tw: rand(0.006, 0.02),
                a: rand(0.15, 0.85)
            });
        }
    }

    function burst() {
        for (let i = 0; i < 28; i++) {
            sparks.push({
                x: w * 0.5 + rand(-20, 20) * dpr,
                y: h * 0.38 + rand(-20, 20) * dpr,
                vx: rand(-2.2, 2.2) * dpr,
                vy: rand(-3.2, 1.2) * dpr,
                life: rand(28, 60),
                a: 1
            });
        }
    }

    function setMode(m) { mode = m; }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        // base stars
        for (const s of stars) {
            s.a += Math.sin((performance.now() * s.tw)) * 0.002;
            const alpha = Math.max(0.05, Math.min(1, s.a));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            ctx.fill();
        }

        // romantic haze overlay
        if (mode === "romantic" || mode === "sparkle") {
            const g = ctx.createRadialGradient(w * 0.25, h * 0.25, 0, w * 0.25, h * 0.25, Math.max(w, h) * 0.7);
            g.addColorStop(0, "rgba(255,79,216,0.14)");
            g.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
        }

        // spark particles
        for (let i = sparks.length - 1; i >= 0; i--) {
            const p = sparks[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05 * dpr;
            p.life -= 1;
            p.a = Math.max(0, p.life / 60);

            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.6 * dpr, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,79,216,${0.55 * p.a})`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(p.x, p.y, 3.2 * dpr, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(139,92,255,${0.22 * p.a})`;
            ctx.fill();

            if (p.life <= 0) sparks.splice(i, 1);
        }

        requestAnimationFrame(draw);
    }

    resize();
    seed();
    draw();

    return { resize, burst, setMode };
}
