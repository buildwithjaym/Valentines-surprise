function FlowersFX(container) {
    let wrap = null;
    let plant = null;

    let twinkle = null;
    let tctx = null;
    let twinkleRaf = 0;
    let stars = [];

    let fireCanvas = null;
    let fctx = null;
    let fireRaf = 0;
    let bursts = [];
    let fireActive = false;
    let fireEndAt = 0;
    let fireLoopTimer = 0;

    let dpr = 1;
    let w = 0;
    let h = 0;

    function rand(a, b) { return a + Math.random() * (b - a); }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

    function clear() {
        if (twinkleRaf) cancelAnimationFrame(twinkleRaf);
        if (fireRaf) cancelAnimationFrame(fireRaf);
        if (fireLoopTimer) clearTimeout(fireLoopTimer);

        twinkleRaf = 0;
        fireRaf = 0;
        fireLoopTimer = 0;

        container.innerHTML = "";
        wrap = null;
        plant = null;

        twinkle = null;
        tctx = null;
        stars = [];

        fireCanvas = null;
        fctx = null;
        bursts = [];
        fireActive = false;
        fireEndAt = 0;
    }

    function resizeCanvas(c) {
        dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        w = Math.floor(container.clientWidth * dpr);
        h = Math.floor(container.clientHeight * dpr);
        c.width = w;
        c.height = h;
        c.style.width = "100%";
        c.style.height = "100%";
    }

    function makeBloom() {
        const bloom = document.createElement("div");
        bloom.className = "bloom";

        const angles = [0, 60, 120, 180, 240, 300];
        for (let i = 0; i < angles.length; i++) {
            const p = document.createElement("span");
            p.className = "petal p" + (i + 1);
            p.style.transform = `rotate(${angles[i]}deg) translateY(-12px)`;
            bloom.appendChild(p);
        }

        const c = document.createElement("span");
        c.className = "center";
        bloom.appendChild(c);

        return bloom;
    }

    function makeBud(className, delaySec, offsetX, topPct) {
        const bud = document.createElement("div");
        bud.className = "bud " + className;
        bud.style.left = "50%";
        bud.style.top = `${topPct}%`;
        bud.style.transform = `translate(-50%, -50%) translateX(${offsetX}px) scale(0)`;
        bud.style.animationDelay = `${delaySec}s`;
        bud.appendChild(makeBloom());
        return bud;
    }

    function typeText(el, text, speedMs) {
        el.textContent = "";
        let i = 0;
        const timer = setInterval(() => {
            i += 1;
            el.textContent = text.slice(0, i);
            if (i >= text.length) clearInterval(timer);
        }, speedMs);
    }

    function addTypingTextOnly() {
        const el = document.createElement("div");
        el.style.position = "absolute";
        el.style.left = "50%";
        el.style.top = "22%";
        el.style.transform = "translate(-50%, -50%)";
        el.style.textAlign = "center";
        el.style.fontWeight = "900";
        el.style.letterSpacing = ".10em";
        el.style.fontSize = "clamp(22px, 5vw, 46px)";
        el.style.color = "rgba(255,255,255,.96)";
        el.style.background = "transparent";
        el.style.border = "none";
        el.style.padding = "0";
        el.style.borderRadius = "0";
        el.style.backdropFilter = "none";
        el.style.boxShadow = "none";
        el.style.textShadow = "0 0 18px rgba(255,79,216,.22), 0 0 34px rgba(139,92,255,.18)";
        el.style.pointerEvents = "none";
        el.style.opacity = "0";
        el.style.zIndex = "7";
        el.style.animation = "vdayTextIn 600ms cubic-bezier(.16,1,.22,1) forwards";
        wrap.appendChild(el);

        const caret = document.createElement("span");
        caret.textContent = "▌";
        caret.style.display = "inline-block";
        caret.style.marginLeft = "6px";
        caret.style.opacity = "0.9";
        caret.style.animation = "caretBlink 900ms steps(1,end) infinite";
        el.appendChild(caret);

        const style = document.createElement("style");
        style.textContent = `
@keyframes vdayTextIn{
  0%{opacity:0; transform:translate(-50%,-50%) scale(.96); filter:blur(2px);}
  100%{opacity:1; transform:translate(-50%,-50%) scale(1); filter:blur(0);}
}
@keyframes caretBlink{
  0%,49%{opacity:0.95}
  50%,100%{opacity:0}
}`;
        document.head.appendChild(style);

        const text = "HAPPY VALENTINE'S DAY";
        const speed = 65;
        setTimeout(() => {
            caret.remove();
            typeText(el, text, speed);
            const caret2 = document.createElement("span");
            caret2.textContent = "▌";
            caret2.style.display = "inline-block";
            caret2.style.marginLeft = "6px";
            caret2.style.opacity = "0.9";
            caret2.style.animation = "caretBlink 900ms steps(1,end) infinite";
            el.appendChild(caret2);

            setTimeout(() => { caret2.remove(); }, speed * (text.length + 4));
        }, 520);
    }

    function initTwinkleStars(count) {
        stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: rand(0.06, 0.94),
                y: rand(0.06, 0.52),
                r: rand(0.7, 2.2),
                a: rand(0.04, 0.16),
                target: rand(0.45, 0.95),
                speed: rand(0.010, 0.028),
                hold: rand(0, 60)
            });
        }
    }

    function startTwinkle() {
        twinkle = document.createElement("canvas");
        twinkle.style.position = "absolute";
        twinkle.style.inset = "0";
        twinkle.style.pointerEvents = "none";
        twinkle.style.zIndex = "5";
        wrap.appendChild(twinkle);

        tctx = twinkle.getContext("2d");
        resizeCanvas(twinkle);

        const baseCount = Math.floor((container.clientWidth * container.clientHeight) / 22000);
        const count = clamp(baseCount, 42, 120);
        initTwinkleStars(count);

        const onResize = () => {
            resizeCanvas(twinkle);
            const base = Math.floor((container.clientWidth * container.clientHeight) / 11000);
            initTwinkleStars(clamp(base, 42, 120));
        };
        window.addEventListener("resize", onResize);

        function drawStar(x, y, r, a) {
            const cx = x * w;
            const cy = y * h;
            const rr = r * dpr;

            tctx.beginPath();
            tctx.arc(cx, cy, rr * 2.2, 0, Math.PI * 2);
            tctx.fillStyle = `rgba(255,79,216,${0.10 * a})`;
            tctx.fill();

            tctx.beginPath();
            tctx.arc(cx, cy, rr, 0, Math.PI * 2);
            tctx.fillStyle = `rgba(255,255,255,${a})`;
            tctx.fill();
        }

        function tick() {
            tctx.clearRect(0, 0, w, h);

            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];

                if (s.hold > 0) {
                    s.hold -= 1;
                } else {
                    if (Math.random() < 0.014) {
                        s.target = rand(0.55, 0.98);
                        s.speed = rand(0.018, 0.045);
                        s.hold = rand(8, 28);
                    } else if (Math.random() < 0.020) {
                        s.target = rand(0.06, 0.22);
                        s.speed = rand(0.010, 0.030);
                        s.hold = rand(6, 20);
                    }
                }

                s.a += (s.target - s.a) * s.speed;
                drawStar(s.x, s.y, s.r, s.a);
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
        wrap.appendChild(fireCanvas);
        fctx = fireCanvas.getContext("2d");
        resizeCanvas(fireCanvas);

        const onResize = () => resizeCanvas(fireCanvas);
        window.addEventListener("resize", onResize);
    }

    function makeParticle(x, y) {
        const a = rand(0, Math.PI * 2);
        const sp = rand(1.2, 4.9) * dpr;
        return {
            x, y,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp,
            life: rand(38, 76),
            max: 76,
            r: rand(1.2, 2.9) * dpr
        };
    }

    function burstAt(px, py) {
        const x = px * dpr;
        const y = py * dpr;
        const n = Math.floor(rand(40, 70));
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
                if (Math.random() < 0.5) fireworkScheduleOnce();
                nextBurst = now + rand(260, 520);
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

                    const a = Math.max(0, p.life / p.max);

                    fctx.beginPath();
                    fctx.arc(p.x, p.y, p.r * 2.6, 0, Math.PI * 2);
                    fctx.fillStyle = `rgba(255,79,216,${0.22 * a})`;
                    fctx.fill();

                    fctx.beginPath();
                    fctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    fctx.fillStyle = `rgba(255,255,255,${0.85 * a})`;
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
        clear();

        wrap = document.createElement("div");
        wrap.style.position = "absolute";
        wrap.style.inset = "0";
        wrap.style.display = "grid";
        wrap.style.placeItems = "end center";
        wrap.style.pointerEvents = "none";
        wrap.style.zIndex = "1";

        const haze = document.createElement("div");
        haze.style.position = "absolute";
        haze.style.left = "0";
        haze.style.right = "0";
        haze.style.bottom = "0";
        haze.style.height = "48vh";
        haze.style.background =
            "radial-gradient(78% 60% at 50% 100%, rgba(255,79,216,.18), transparent 68%)," +
            "radial-gradient(62% 55% at 20% 100%, rgba(139,92,255,.16), transparent 72%)," +
            "linear-gradient(to top, rgba(0,0,0,.40), transparent)";
        haze.style.opacity = ".95";
        wrap.appendChild(haze);

        plant = document.createElement("div");
        plant.className = "plant one";

        const stem = document.createElement("div");
        stem.className = "stem";
        plant.appendChild(stem);

        const leafL = document.createElement("div");
        leafL.className = "leaf leafL";
        plant.appendChild(leafL);

        const leafR = document.createElement("div");
        leafR.className = "leaf leafR";
        plant.appendChild(leafR);

        const bud1 = makeBud("bud1", 1.55, -34, 18);
        const bud2 = makeBud("bud2", 1.72, 0, 12);
        const bud3 = makeBud("bud3", 1.88, 36, 20);

        plant.appendChild(bud1);
        plant.appendChild(bud2);
        plant.appendChild(bud3);

        wrap.appendChild(plant);
        container.appendChild(wrap);

        startTwinkle();
        addTypingTextOnly();
        startFireworksLoop();
    }

    return { bloomField, clear };
}
