const menuVideo = document.getElementById('menuVideo');
const btnStart = document.getElementById('btnStart');
const btnTutorial = document.getElementById('btnTutorial');

const carLeft = document.getElementById('carLeft');
const carRight = document.getElementById('carRight');

const leftCars = ["car1L.webm", "car2L.webm", "car3L.webm"];
const rightCars = ["car1R.webm", "car2R.webm", "car3R.webm"];

let leftIndex = 0;
let rightIndex = 0;
const idleSrc = 'idleHTML.webm';
const startSrc = 'startHTML.webm';
const tutorialSrc = 'tutoHTML.webm';
let switchingLeft = false;
let switchingRight = false;

let queuedLeftIndex = null;
let queuedRightIndex = null;
const buttons = [btnStart, btnTutorial];


const HALF = 0.5;
// -------------------------------
// Utility: load video
// -------------------------------
function loadCar(video, src, startIdle = false) {
    video.src = src;
    video.play().then(() => {
        if (startIdle) {
            // start at 50%
            video.currentTime = video.duration * HALF;
            video.pause();
        } else {
            // start from beginning
            video.currentTime = 0;
        }
    });
}

function alignCarVideos() {
    const container = document.getElementById("videoContainer");
    const carLeft = document.getElementById("carLeft");
    const carRight = document.getElementById("carRight");
    const containerWidth = container.clientWidth;
    const halfContainer = containerWidth / 2;

    [carLeft, carRight].forEach((vid) => {
        if (vid.videoWidth === 0) return; // fallback if not loaded
        const scale = vid.clientHeight / vid.videoHeight;
        const vidWidth = vid.videoWidth * scale;

        if (vid.id === "carLeft") {
            vid.style.left = `${halfContainer - vidWidth}px`;
        } else {
            vid.style.left = `${halfContainer}px`;
        }
    });
}

// Initial setup after videos load
[carLeft, carRight].forEach((vid) => {
    vid.addEventListener("loadedmetadata", () => {
        // alignCarVideos();
    }, { once: true });
});

// Re-align on window resize
window.addEventListener("resize", () => {
    // alignCarVideos();
});

// Start button
btnStart.addEventListener('click', () => {
    btnStart.style.display = "none";
    btnTutorial.style.display = "none";

    menuVideo.pause();
    menuVideo.remove();

    carLeft.style.display = "block";
    carRight.style.display = "block";

    loadCar(carLeft, leftCars[leftIndex]);
    loadCar(carRight, rightCars[rightIndex]);

    // Align once metadata is guaranteed to be loaded
    // (in case it was cached and loaded instantly)
    if (carLeft.videoWidth && carRight.videoWidth) {
        // alignCarVideos();
    }
});

// -------------------------------
// LIMITER — Freeze at 50% when idle
// -------------------------------
carLeft.addEventListener("timeupdate", () => {
    if (!switchingLeft && carLeft.currentTime > carLeft.duration * HALF) {
        carLeft.pause();
        carLeft.currentTime = carLeft.duration * HALF;
    }
});

carRight.addEventListener("timeupdate", () => {
    if (!switchingRight && carRight.currentTime > carRight.duration * HALF) {
        carRight.pause();
        carRight.currentTime = carRight.duration * HALF;
    }
});
// -------------------------------
// KEY INPUT — Queue a switch
// -------------------------------
document.addEventListener("keydown", (e) => {

    // LEFT SIDE (A / D)
    if (e.key === "a" || e.key === "A") {
        queuedLeftIndex = (leftIndex - 1 + leftCars.length) % leftCars.length;
        switchingLeft = true;
        carLeft.play();  // resume from 50%
    }

    if (e.key === "d" || e.key === "D") {
        queuedLeftIndex = (leftIndex + 1) % leftCars.length;
        switchingLeft = true;
        carLeft.play();
    }

    // RIGHT SIDE (Arrows)
    if (e.key === "ArrowLeft") {
        queuedRightIndex = (rightIndex - 1 + rightCars.length) % rightCars.length;
        switchingRight = true;
        carRight.play();
    }

    if (e.key === "ArrowRight") {
        queuedRightIndex = (rightIndex + 1) % rightCars.length;
        switchingRight = true;
        carRight.play();
    }
});

// -------------------------------
// When CURRENT animation ends → switch
// -------------------------------
carLeft.addEventListener("ended", () => {
    if (!switchingLeft) return;

    switchingLeft = false;
    leftIndex = queuedLeftIndex;
    queuedLeftIndex = null;

    // Play full animation from 0
    loadCar(carLeft, leftCars[leftIndex], false);
});

carRight.addEventListener("ended", () => {
    if (!switchingRight) return;

    switchingRight = false;
    rightIndex = queuedRightIndex;
    queuedRightIndex = null;

    loadCar(carRight, rightCars[rightIndex], false);
});
// -------------------------------
// IDLE limiter — freeze at 50% only if not switching
// -------------------------------
carLeft.addEventListener("timeupdate", () => {
    if (!switchingLeft && carLeft.currentTime > carLeft.duration * HALF) {
        carLeft.pause();
        carLeft.currentTime = carLeft.duration * HALF;
    }
});

carRight.addEventListener("timeupdate", () => {
    if (!switchingRight && carRight.currentTime > carRight.duration * HALF) {
        carRight.pause();
        carRight.currentTime = carRight.duration * HALF;
    }
});
// Hover animations
buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        if (btn.id === 'btnStart') {
            if (!menuVideo.src.endsWith(startSrc)) {
                menuVideo.src = startSrc;
                menuVideo.loop = true;
                menuVideo.play();
            }
        }
        if (btn.id === 'btnTutorial') {
            if (!menuVideo.src.endsWith(tutorialSrc)) {
                menuVideo.src = tutorialSrc;
                menuVideo.loop = true;
                menuVideo.play();
            }
        }
    });

    btn.addEventListener('mouseleave', () => {
        if (!menuVideo.src.endsWith(idleSrc)) {
            menuVideo.src = idleSrc;
            menuVideo.loop = true;
            menuVideo.play();
        }
    });
});