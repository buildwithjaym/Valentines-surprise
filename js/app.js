/* global StarsFX, ButterfliesFX, FlowersFX */
(() => {
    const scenes = Array.from(document.querySelectorAll(".scene"));
    const starsCanvas = document.getElementById("stars");
    const butterfliesCanvas = document.getElementById("butterflies");
    const flowerField = document.getElementById("flowerField");
    const song = document.getElementById("bgSong");

    const stars = StarsFX(starsCanvas);
    const butterflies = ButterfliesFX(butterfliesCanvas);
    const flowers = FlowersFX(flowerField);

    function setActiveScene(n) {
        scenes.forEach(s => s.classList.toggle("is-active", Number(s.dataset.scene) === n));

        if (n === 1) {
            stars.setMode("glow");
            stars.burst();
            butterflies.setEnabled(false);
            flowers.clear();
            if (song) {
                song.pause();
                song.currentTime = 0;
            }
        }

        if (n === 2) {
            stars.setMode("sparkle");
            butterflies.setEnabled(false);
            flowers.clear();
        }

        if (n === 3) {
            stars.setMode("romantic");
            butterflies.setEnabled(true);
            flowers.bloomField();
        }

        if (n === 4) {
            stars.setMode("soft");
            butterflies.setEnabled(true);
        }
    }

    const btnReady = document.getElementById("btnReady");
    const btnSpark = document.getElementById("btnSpark");
    const btnToFinal = document.getElementById("btnToFinal");
    const btnReplay = document.getElementById("btnReplay");

    if (btnReady) {
        btnReady.addEventListener("click", () => {
            setActiveScene(2);
            stars.burst();
        });
    }

    if (btnSpark) {
        btnSpark.addEventListener("click", async () => {
            if (song) {
                try { await song.play(); } catch (e) { }
            }
            setActiveScene(3);
            stars.burst();
            butterflies.burst();
        });
    }

    if (btnToFinal) {
        btnToFinal.addEventListener("click", () => {
            setActiveScene(4);
            stars.burst();
        });
    }

    if (btnReplay) {
        btnReplay.addEventListener("click", () => {
            setActiveScene(1);
            stars.burst();
        });
    }

    function resizeAll() {
        stars.resize();
        butterflies.resize();
    }

    window.addEventListener("resize", resizeAll);
    resizeAll();
    setActiveScene(1);
})();
