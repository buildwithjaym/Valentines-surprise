function FlowersFX(container) {
    let twinkle = null, tctx = null, twinkleRaf = 0, stars = [];
    let fireCanvas = null, fctx = null, fireRaf = 0, bursts = [];
    let fireActive = false, fireEndAt = 0, fireLoopTimer = 0;

    let dpr = 1, w = 0, h = 0;
    let textEl = null;

    function rand(a, b) { return a + Math.random() * (b - a); }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

    function resizeCanvas(c) {
        dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        w = Math.floor(container.clientWidth * dpr);
        h = Math.floor(container.clientHeight * dpr);
        c.width = w;
        c.height = h;
        c.style.width = "100%";
        c.style.height = "100%";
    }

    function stopAll() {
        if (twinkleRaf) cancelAnimationFrame(twinkleRaf);
        if (fireRaf) cancelAnimationFrame(fireRaf);
        if (fireLoopTimer) clearTimeout(fireLoopTimer);

        twinkleRaf = 0;
        fireRaf = 0;
        fireLoopTimer = 0;

        if (twinkle && twinkle.parentNode) twinkle.parentNode.removeChild(twinkle);
        if (fireCanvas && fireCanvas.parentNode) fireCanvas.parentNode.removeChild(fireCanvas);
        if (textEl && textEl.parentNode) textEl.parentNode.removeChild(textEl);

        twinkle = null; tctx = null; stars = [];
        fireCanvas = null; fctx = null; bursts = [];
        fireActive = false; fireEndAt = 0;
        textEl = null;
    }

    function typeText(el, text, speedMs) {
        el.textContent = "";
        let i = 0;
        const caret = document.createElement("span");
        caret.textContent = "▌";
        caret.style.marginLeft = "6px";
        caret.style.animation = "caretBlink 900ms steps(1,end) infinite";
        el.appendChild(caret);

        const timer = setInterval(() => {
            i += 1;
            el.firstChild && el.removeChild(el.firstChild);
            el.textContent = text.slice(0, i);
            el.appendChild(caret);

            if (i >= text.length) {
                clearInterval(timer);
                setTimeout(() => caret.remove(), 700);
            }
        }, speedMs);
    }

    function ensureTypingText() {
        if (document.getElementById("vdayTypingStyle") == null) {
            const style = document.createElement("style");
            style.id = "vdayTypingStyle";
            style.textContent = `
@keyframes caretBlink{0%,49%{opacity:.95}50%,100%{opacity:0}}
@keyframes vdayTextIn{0%{opacity:0;transform:translate(-50%,-50%) scale(.96);filter:blur(2px)}100%{opacity:1;transform:translate(-50%,-50%) scale(1);filter:blur(0)}}`;
            document.head.appendChild(style);
        }

        textEl = document.createElement("div");
        textEl.style.position = "absolute";
        textEl.style.left = "50%";
        textEl.style.top = "22%";
        textEl.style.transform = "translate(-50%, -50%)";
        textEl.style.textAlign = "center";
        textEl.style.fontWeight = "900";
        textEl.style.letterSpacing = ".10em";
        textEl.style.fontSize = "clamp(22px, 5vw, 46px)";
        textEl.style.color = "rgba(255,255,255,.96)";
        textEl.style.textShadow = "0 0 18px rgba(255,79,216,.22), 0 0 34px rgba(139,92,255,.18)";
        textEl.style.pointerEvents = "none";
        textEl.style.zIndex = "7";
        textEl.style.opacity = "0";
        textEl.style.animation = "vdayTextIn 500ms cubic-bezier(.16,1,.22,1) forwards";

        container.appendChild(textEl);

        setTimeout(() => typeText(textEl, "HAPPY VALENTINE'S DAY", 55), 420);
    }

    function initTwinkleStars(count) {
        stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: rand(0.06, 0.94),
                y: rand(0.06, 0.52),
                r: rand(0.7, 2.1),
                a: rand(0.05, 0.18),
                target: rand(0.45, 0.95),
                speed: rand(0.010, 0.028),
                hold: rand(0, 70)
            });
        }
    }

    function startTwinkle() {
        twinkle = document.createElement("canvas");
        twinkle.style.position = "absolute";
        twinkle.style.inset = "0";
        twinkle.style.pointerEvents = "none";
        twinkle.style.zIndex = "5";
        container.appendChild(twinkle);

        tctx = twinkle.getContext("2d");
        resizeCanvas(twinkle);

        const baseCount = Math.floor((container.clientWidth * container.clientHeight) / 22000);
        initTwinkleStars(clamp(baseCount, 34, 90));

        function drawStar(s) {
            const cx = s.x * w;
            const cy = s.y * h;
            const rr = s.r * dpr;

            tctx.beginPath();
            tctx.arc(cx, cy, rr * 2.2, 0, Math.PI * 2);
            tctx.fillStyle = `rgba(255,79,216,${0.10 * s.a})`;
            tctx.fill();

            tctx.beginPath();
            tctx.arc(cx, cy, rr, 0, Math.PI * 2);
            tctx.fillStyle = `rgba(255,255,255,${s.a})`;
            tctx.fill();
        }

        function tick() {
            tctx.clearRect(0, 0, w, h);

            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];

                if (s.hold > 0) s.hold -= 1;
                else {
                    if (Math.random() < 0.012) {
                        s.target = rand(0.58, 0.98);
                        s.speed = rand(0.020, 0.048);
                        s.hold = rand(8, 26);
                    } else if (Math.random() < 0.018) {
                        s.target = rand(0.06, 0.22);
                        s.speed = rand(0.010, 0.030);
                        s.hold = rand(6, 22);
                    }
                }

                s.a += (s.target - s.a) * s.speed;
                drawStar(s);
            }

            twinkleRaf = requestAnimationFrame(tick);
        }

        twinkleRaf = requestAnimationFrame(tick);
    }

    function ensureFireCanvas() {
        if (fireCanvas) return;

        fireCanvas = document.createElement("canvas");
        fireCanvas.style.position = "absolute";
        fireCanvas.style.inset = "0";
        fireCanvas.style.pointerEvents = "none";
        fireCanvas.style.zIndex = "6";
        fireCanvas.style.opacity = "0";
        fireCanvas.style.transition = "opacity 450ms ease";
        container.appendChild(fireCanvas);

        fctx = fireCanvas.getContext("2d");
        resizeCanvas(fireCanvas);
    }

    function makeParticle(x, y) {
        const a = rand(0, Math.PI * 2);
        const sp = rand(1.1, 4.2) * dpr;
        return {
            x, y,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp,
            life: rand(34, 68),
            max: 68,
            r: rand(1.0, 2.4) * dpr
        };
    }

    function burstAt(px, py) {
        const x = px * dpr;
        const y = py * dpr;
        const n = Math.floor(rand(30, 52));
        const parts = [];
        for (let i = 0; i < n; i++) parts.push(makeParticle(x, y));
        bursts.push(parts);
    }

    function fireworkScheduleOnce() {
        const points = [
            { x: 0.26, y: 0.26 },
            { x: 0.72, y: 0.24 },
            { x: 0.52, y: 0.40 },
            { x: 0.18, y: 0.42 },
            { x: 0.82, y: 0.44 }
        ];
        const p = points[Math.floor(rand(0, points.length))];
        burstAt(container.clientWidth * p.x, container.clientHeight * p.y);
    }

    function startFireworksLoop() {
        ensureFireCanvas();
        fireActive = true;
        fireEndAt = performance.now() + 10000;
        bursts = [];
        fireCanvas.style.opacity = "1";

        let nextBurst = performance.now();

        function tick(now) {
            if (!fireActive) return;

            if (now >= nextBurst) {
                fireworkScheduleOnce();
                if (Math.random() < 0.45) fireworkScheduleOnce();
                nextBurst = now + rand(320, 640);
            }

            fctx.clearRect(0, 0, w, h);

            for (let b = bursts.length - 1; b >= 0; b--) {
                const parts = bursts[b];
                for (let i = parts.length - 1; i >= 0; i--) {
                    const p = parts[i];
                    p.life -= 1;
                    p.vx *= 0.985;
                    p.vy *= 0.985;
                    p.vy += 0.03 * dpr;
                    p.x += p.vx;
                    p.y += p.vy;

                    const a = clamp(p.life / p.max, 0, 1);

                    fctx.beginPath();
                    fctx.arc(p.x, p.y, p.r * 2.4, 0, Math.PI * 2);
                    fctx.fillStyle = `rgba(255,79,216,${0.20 * a})`;
                    fctx.fill();

                    fctx.beginPath();
                    fctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    fctx.fillStyle = `rgba(255,255,255,${0.80 * a})`;
                    fctx.fill();

                    if (p.life <= 0) parts.splice(i, 1);
                }
                if (parts.length === 0) bursts.splice(b, 1);
            }

            if (now >= fireEndAt) {
                stopFireworksThenRestart();
                return;
            }

            fireRaf = requestAnimationFrame(tick);
        }

        fireRaf = requestAnimationFrame(tick);
    }

    function stopFireworksThenRestart() {
        fireActive = false;
        if (fireRaf) cancelAnimationFrame(fireRaf);
        fireRaf = 0;

        if (fireCanvas) fireCanvas.style.opacity = "0";

        fireLoopTimer = setTimeout(() => {
            startFireworksLoop();
        }, 10000);
    }

    function bloomField() {
        stopAll();

        startTwinkle();
        ensureTypingText();
        startFireworksLoop();
    }

    return { bloomField, clear: stopAll };
}
