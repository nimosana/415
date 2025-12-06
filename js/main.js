const menuVideo = document.getElementById('menuVideo');
const btnStart = document.getElementById('btnStart');
const btnTutorial = document.getElementById('btnTutorial');

const carLeft = document.getElementById('carLeft');
const carRight = document.getElementById('carRight');

const leftCars = ["car1L.webm", "car2L.webm", "car3L.webm"];
const rightCars = ["car1R.webm", "car2R.webm", "car3R.webm"];

let leftIndex = 0;
let rightIndex = 1;
let leftIndexDir = 0;
let rightIndexDir = 0;
const idleSrc = 'idleHTML.webm';
const startSrc = 'startHTML.webm';
const tutorialSrc = 'tutoHTML.webm';
let switchingLeft = false;
let switchingRight = false;
let firstSong = true;
let queuedLeftIndex = null;
let queuedRightIndex = null;
let introStarted = false;
const buttons = [btnStart, btnTutorial];
let goingBack = false;
let inCarSelection = false;
let leftDone = false;
let rightDone = false;

// Original playlist
const masterList = [
    "audio/song1.mp3",
    "audio/song2.mp3",
    "audio/song3.mp3",
];
const HALF = 0.5;
const introVideo = document.getElementById("introVideo");

const introSrc = "introHTML.webm"; // your intro video
introVideo.addEventListener("click", () => {
    // Hide start screen and play intro
    if (!introStarted) {
        introStarted = true;
        introVideo.src = introSrc;
        introVideo.style.display = "block";
        introVideo.play();
        playRandomSong();

    }
});
introVideo.play();
introVideo.pause();


menuVideo.style.display = "none";
btnStart.style.display = "none";
btnTutorial.style.display = "none";
introVideo.addEventListener("ended", () => {
    introVideo.pause();
    introVideo.remove();

    // Show menu
    menuVideo.style.display = "block";
    btnStart.style.display = "block";
    btnTutorial.style.display = "block";

    menuVideo.play();
});
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

// Start button
btnStart.addEventListener('click', () => {
    btnStart.style.display = "none";
    btnTutorial.style.display = "none";

    menuVideo.pause();
    menuVideo.style.display = "none";
    inCarSelection = true;
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
    if (!switchingLeft && !goingBack && carLeft.currentTime > carLeft.duration * HALF) {
        carLeft.pause();
        carLeft.currentTime = carLeft.duration * HALF;
    }
});

carRight.addEventListener("timeupdate", () => {
    if (!switchingRight && !goingBack && carRight.currentTime > carRight.duration * HALF) {
        carRight.pause();
        carRight.currentTime = carRight.duration * HALF;
    }
});
// -------------------------------
// KEY INPUT — Queue a switch
// -------------------------------
document.addEventListener("keydown", (e) => {

    // LEFT SIDE (A / D)
    if ((e.key === "a" || e.key === "A") && !switchingLeft) {
        queuedLeftIndex = (leftIndex - 1 + leftCars.length) % leftCars.length;
        switchingLeft = true;
        leftIndexDir = -1;
        console.log("queued left: " + queuedLeftIndex)
        carLeft.play();  // resume from 50%
    }

    if ((e.key === "d" || e.key === "D") && !switchingLeft) {
        queuedLeftIndex = (leftIndex + 1) % leftCars.length;
        switchingLeft = true;
        leftIndexDir = 1;
        console.log("queued left: " + queuedLeftIndex)
        carLeft.play();
    }

    // ESCAPE (Back to Menu)
    if (e.key === "Escape" && inCarSelection && !goingBack) {
        goingBack = true;
        leftDone = false;
        rightDone = false;

        // Play both videos to completion
        carLeft.play();
        carRight.play();
        return;
    }

    // RIGHT SIDE (Arrows)
    if (e.key === "ArrowLeft" && !switchingRight) {
        queuedRightIndex = (rightIndex - 1 + rightCars.length) % rightCars.length;
        switchingRight = true;
        console.log("queued right: " + queuedRightIndex)
        rightIndexDir = -1;
        carRight.play();
    }

    if (e.key === "ArrowRight" && !switchingRight) {
        queuedRightIndex = (rightIndex + 1) % rightCars.length;
        switchingRight = true;
        rightIndexDir = 1;
        console.log("queued right: " + queuedRightIndex)
        carRight.play();
    }
});

// -------------------------------
// When CURRENT animation ends → switch
// -------------------------------
carLeft.addEventListener("ended", () => {
    if (goingBack) {
        leftDone = true;
        checkBackDone();
        return;
    }

    if (!switchingLeft) return;

    switchingLeft = false;
    if (queuedLeftIndex === rightIndex) {
        queuedLeftIndex = (queuedLeftIndex + leftIndexDir) % rightCars.length;
        if (queuedLeftIndex === -1) queuedLeftIndex = 2;
        console.log("final queue left: " + queuedLeftIndex)
    }
    leftIndex = queuedLeftIndex;
    queuedLeftIndex = null;

    // Play full animation from 0
    loadCar(carLeft, leftCars[leftIndex], false);
});

carRight.addEventListener("ended", () => {
    if (goingBack) {
        rightDone = true;
        checkBackDone();
        return;
    }

    if (!switchingRight) return;

    switchingRight = false;
    if (queuedRightIndex === leftIndex) {
        queuedRightIndex = (queuedRightIndex + rightIndexDir) % rightCars.length;
        if (queuedRightIndex === -1) queuedRightIndex = 2;
        console.log("final queue right: " + queuedRightIndex)
    }
    rightIndex = queuedRightIndex;
    queuedRightIndex = null;

    loadCar(carRight, rightCars[rightIndex], false);
});
function checkBackDone() {
    if (leftDone && rightDone) {
        goingBack = false;
        inCarSelection = false;

        // Hide cars
        carLeft.style.display = "none";
        carRight.style.display = "none";

        // Show menu
        menuVideo.style.display = "block";
        btnStart.style.display = "block";
        btnTutorial.style.display = "block";

        // Reset menu video to idle
        menuVideo.src = idleSrc;
        menuVideo.loop = true;
        menuVideo.currentTime = 0;
        menuVideo.play();
    }
}
// Hover animations
buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        if (btn.id === 'btnStart') {
            if (!menuVideo.src.endsWith(startSrc)) {
                // menuVideo.src = startSrc;
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


const bgm = document.getElementById("bgm");
// This will be filled and emptied as songs are played
let playlist = [];

// Get a random item and remove it from the list
function getRandomSong() {
    if (playlist.length === 0) {
        // refill when empty
        playlist = [...masterList];
    }

    let i = Math.floor(Math.random() * playlist.length);
    if (firstSong) i = 0;
    return playlist.splice(i, 1)[0];
}

function playRandomSong() {
    const next = getRandomSong();
    bgm.src = next;
    console.log(next)
    bgm.load();
    bgm.addEventListener("canplaythrough", () => {
        bgm.play().catch(() => { });
    }, { once: true });
}
// When one song ends → start another
bgm.addEventListener("ended", playRandomSong);

// Start immediately on app launch
