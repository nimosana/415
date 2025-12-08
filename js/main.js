const introSrc = "assets/video/introHTML.webm";
const idleSrc = 'assets/video/idleHTML.webm';
const startSrc = 'assets/video/startHTML.webm';
const tutorialSrc = 'assets/video/tutoHTML.webm';

const leftCars = ["assets/video/car1L.webm", "assets/video/car2L.webm", "assets/video/car3L.webm", "assets/video/car4L.webm"];
const rightCars = ["assets/video/car1R.webm", "assets/video/car2R.webm", "assets/video/car3R.webm", "assets/video/car4R.webm"];

let introStarted = false;
const introVideo = document.getElementById("introVideo");
introVideo.pause();

const menuVideo = document.getElementById('menuVideo');
const btnStart = document.getElementById('btnStart');
const btnTutorial = document.getElementById('btnTutorial');
const buttons = [btnStart, btnTutorial];

const carLeft = document.getElementById('carLeft');
const carRight = document.getElementById('carRight');

const uiElements = [];

let leftIndex = 0;
let rightIndex = 1;
let leftIndexDir = 0;
let rightIndexDir = 0;
let switchingLeft = false;
let switchingRight = false;
let queuedLeftIndex = null;
let queuedRightIndex = null;

let goingBack = false;
let inCarSelection = false;
let leftDone = false;
let rightDone = false;
let gameState = "menu";

let p1Ready = false;
let p2Ready = false;
let p1ReadyUI = null;
let p2ReadyUI = null;
let countdownTimer = null;
let countdownValue = 3;
let countdownEl = null;

const HALF = 0.5;

introVideo.addEventListener("click", () => {
    // Hide start screen and play intro
    if (!introStarted) {
        introStarted = true;
        introVideo.src = introSrc;
        introVideo.style.display = "block";
        introVideo.play();
        Audio.playRandomSong();
    }
});
// When one song ends → start another
bgm.addEventListener("ended", Audio.playRandomSong);

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
    showUi();
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
        removeUi();
        if (p1ReadyUI) {
            p1ReadyUI.remove();
            p1ReadyUI = null;
        }
        if (p2ReadyUI) {
            p2ReadyUI.remove();
            p2ReadyUI = null;
        }
        // Hide cars
        carLeft.style.display = "none";
        carRight.style.display = "none";

        // Show menu
        menuVideo.style.display = "block";
        btnStart.style.display = "block";
        btnTutorial.style.display = "block";

        // Reset menu video to idle
        // menuVideo.src = idleSrc;
        menuVideo.loop = true;
        menuVideo.currentTime = 0;
        // menuVideo.play();
        gameState = "menu";
    }
}

function setPlayerReady(player, ready) {
    if (gameState !== "carSelection") return;
    // Prevent toggling if countdown is active? 
    // Actually spec says "unready" so we must support aborting.

    if (player === 1) {
        if (p1Ready === ready) return;
        p1Ready = ready;
        if (p1Ready) {
            // Show UI
            p1ReadyUI = createFloatingUIElement("assets/image/readied.webp", {
                containerId: "videoContainer", left: 25, top: 80, scale: 0.2, fadeIn: true
            });
        } else {
            // Hide UI
            if (p1ReadyUI) {
                p1ReadyUI.remove();
                p1ReadyUI = null;
            }
        }
    } else {
        if (p2Ready === ready) return;
        p2Ready = ready;
        if (p2Ready) {
            // Show UI
            p2ReadyUI = createFloatingUIElement("assets/image/readied.webp", {
                containerId: "videoContainer", left: 75, top: 80, scale: 0.2, fadeIn: true
            });
        } else {
            // Hide UI
            if (p2ReadyUI) {
                p2ReadyUI.remove();
                p2ReadyUI = null;
            }
        }
    }

    checkGameStart();
}

function checkGameStart() {
    if (p1Ready && p2Ready) {
        startCountdown();
    } else {
        cancelCountdown();
    }
}

function startCountdown() {
    if (countdownTimer) return; // Already running

    countdownValue = 3;
    const container = document.getElementById("videoContainer");

    // Create countdown text element if not exists
    if (!countdownEl) {
        countdownEl = document.createElement("div");
        countdownEl.style.position = "absolute";
        countdownEl.style.left = "50%";
        countdownEl.style.top = "50%";
        countdownEl.style.transform = "translate(-50%, -50%)";
        countdownEl.style.fontSize = "100px";
        countdownEl.style.color = "white";

        // Font style
        if (window.googleFonts && window.googleFonts.primary) {
            countdownEl.style.fontFamily = window.googleFonts.primary;
        } else {
            countdownEl.style.fontFamily = "Impact, sans-serif";
        }

        countdownEl.style.zIndex = "1000";
        countdownEl.style.textShadow = "0 0 10px black";
        container.appendChild(countdownEl);
    }

    countdownEl.innerText = countdownValue;
    countdownEl.style.display = "block";

    countdownTimer = setInterval(() => {
        countdownValue--;
        if (countdownValue > 0) {
            countdownEl.innerText = countdownValue;
        } else {
            // START GAME
            clearInterval(countdownTimer);
            countdownTimer = null;
            countdownEl.style.display = "none";
            startGame();
        }
    }, 1000);
}

function cancelCountdown() {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
    if (countdownEl) {
        countdownEl.style.display = "none";
    }
}

function startGame() {
    gameState = "inGame";
    console.log("Game Started!");

    // Hide car selection UI
    removeUi();
    if (p1ReadyUI) p1ReadyUI.remove();
    if (p2ReadyUI) p2ReadyUI.remove();

    carLeft.style.display = "none";
    carRight.style.display = "none";

    // Init game logic
    if (window.GameInstance) {
        if (!window.GameInstance.canvas) {
            window.GameInstance.init();
        }
        window.GameInstance.start(leftIndex, rightIndex);
    }
}

// Hover animations
buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        if (btn.id === 'btnStart') {
            gameState = "carSelection";
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

// Track intervals for cleanup
const floatingUIRegistry = new Map();

function createFloatingUIElement(src, opts) {
    const {
        containerId,
        left,
        top,
        scale = 0.1,   // relative to container width (0.1 = 10%)
        fadeIn = true,
        opacity = 1
    } = opts;

    const container = document.getElementById(containerId);
    if (!container) {
        console.error("Container not found:", containerId);
        return null;
    }

    const img = document.createElement("img");
    img.src = src;
    img.classList.add("floating-ui");

    img.style.position = "absolute";
    img.style.left = typeof left === "number" ? `${left}%` : left;
    img.style.top = typeof top === "number" ? `${top}%` : top;
    img.style.opacity = fadeIn ? 0 : opacity;
    img.style.transform = "translate(-50%, -50%)"; // Center the image on its coordinates

    container.appendChild(img);

    img.onload = () => {
        // Compute size relative to container width
        const containerWidth = container.offsetWidth;
        img.style.width = `${containerWidth * scale}px`;
        img.style.height = "auto";

        if (fadeIn) {
            requestAnimationFrame(() => {
                img.style.opacity = opacity;
            });
        }
    };

    // Resize observer to keep size relative if container resizes
    const resizeObserver = new ResizeObserver(() => {
        const containerWidth = container.offsetWidth;
        img.style.width = `${containerWidth * scale}px`;
    });
    resizeObserver.observe(container);

    // Animation interval
    const interval = setInterval(() => {
        const r = Math.random() * 5 - 2;
        const s = 1 + (Math.random() * 0.1 - 0.05);
        img.style.transform = `translate(-50%, -50%) rotate(${r}deg) scale(${s})`;
    }, 1000);

    floatingUIRegistry.set(img, interval);

    return {
        element: img,

        show() {
            img.style.opacity = opacity;
        },

        hide() {
            img.style.opacity = 0;
        },

        remove() {
            img.style.opacity = 0;
            setTimeout(() => {
                clearInterval(interval);
                resizeObserver.disconnect();
                floatingUIRegistry.delete(img);
                img.remove();
            }, 500);
        }
    };
}
let keyMap;
function showUi() {

    let escKey = createFloatingUIElement("assets/image/keys_ESC.webp", {
        containerId: "videoContainer", left: 4, top: 6, scale: 0.06, fadeIn: true
    });

    let returnUI = createFloatingUIElement("assets/image/return.webp", {
        containerId: "videoContainer", left: 12, top: 6, scale: 0.09, fadeIn: true
    });

    let switchCars = createFloatingUIElement("assets/image/switchCars.webp", {
        containerId: "videoContainer", left: 50, top: 20, scale: 0.1, fadeIn: true
    });

    let readyUI = createFloatingUIElement("assets/image/ready.webp", {
        containerId: "videoContainer", left: 50, top: 77.5, scale: 0.06, fadeIn: true
    });
    let unreadyUI = createFloatingUIElement("assets/image/unready.webp", {
        containerId: "videoContainer", left: 50, top: 82.5, scale: 0.07, fadeIn: true
    });

    let aKeySwitch = createFloatingUIElement("assets/image/keys_A.webp", {
        containerId: "videoContainer", left: 39, top: 82.5, scale: 0.03, fadeIn: true, opacity: 0.5
    });
    let wKeySwitch = createFloatingUIElement("assets/image/keys_W.webp", {
        containerId: "videoContainer", left: 42, top: 77.5, scale: 0.03, fadeIn: true,
    });
    let dKeySwitch = createFloatingUIElement("assets/image/keys_D.webp", {
        containerId: "videoContainer", left: 45, top: 82.5, scale: 0.03, fadeIn: true, opacity: 0.5
    });
    let sKeySwitch = createFloatingUIElement("assets/image/keys_S.webp", {
        containerId: "videoContainer", left: 42, top: 82.5, scale: 0.03, fadeIn: true,
    });

    let upKeySwitch = createFloatingUIElement("assets/image/keys_UP.webp", {
        containerId: "videoContainer", left: 58, top: 77.5, scale: 0.03, fadeIn: true,
    });
    let downKeySwitch = createFloatingUIElement("assets/image/keys_DOWN.webp", {
        containerId: "videoContainer", left: 58, top: 82.5, scale: 0.03, fadeIn: true,
    });
    let leftKeySwitch = createFloatingUIElement("assets/image/keys_LEFT.webp", {
        containerId: "videoContainer", left: 55, top: 82.5, scale: 0.03, fadeIn: true, opacity: 0.5
    });
    let rightKeySwitch = createFloatingUIElement("assets/image/keys_RIGHT.webp", {
        containerId: "videoContainer", left: 61, top: 82.5, scale: 0.03, fadeIn: true, opacity: 0.5
    });

    let aKeyReady = createFloatingUIElement("assets/image/keys_A.webp", {
        containerId: "videoContainer", left: 37, top: 22.5, scale: 0.03, fadeIn: true
    });
    let wKeyReady = createFloatingUIElement("assets/image/keys_W.webp", {
        containerId: "videoContainer", left: 40, top: 17.5, scale: 0.03, fadeIn: true, opacity: 0.5
    });
    let dKeyReady = createFloatingUIElement("assets/image/keys_D.webp", {
        containerId: "videoContainer", left: 43, top: 22.5, scale: 0.03, fadeIn: true
    });
    let sKeyReady = createFloatingUIElement("assets/image/keys_S.webp", {
        containerId: "videoContainer", left: 40, top: 22.5, scale: 0.03, fadeIn: true, opacity: 0.5
    });

    let upKeyReady = createFloatingUIElement("assets/image/keys_UP.webp", {
        containerId: "videoContainer", left: 60, top: 17.5, scale: 0.03, fadeIn: true, opacity: 0.5
    });
    let downKeyReady = createFloatingUIElement("assets/image/keys_DOWN.webp", {
        containerId: "videoContainer", left: 60, top: 22.5, scale: 0.03, fadeIn: true, opacity: 0.5
    });
    let leftKeyReady = createFloatingUIElement("assets/image/keys_LEFT.webp", {
        containerId: "videoContainer", left: 57, top: 22.5, scale: 0.03, fadeIn: true,
    });
    let rightKeyReady = createFloatingUIElement("assets/image/keys_RIGHT.webp", {
        containerId: "videoContainer", left: 63, top: 22.5, scale: 0.03, fadeIn: true,
    });



    uiElements.push(readyUI, unreadyUI, aKeyReady, wKeyReady, sKeyReady, dKeyReady, upKeyReady, downKeyReady, leftKeyReady, rightKeyReady, aKeySwitch, wKeySwitch, sKeySwitch, dKeySwitch, upKeySwitch, downKeySwitch, leftKeySwitch, rightKeySwitch, switchCars, escKey, returnUI);

    keyMap = {
        "a": aKeyReady.element, "A": aKeyReady.element,
        "w": wKeySwitch.element, "W": wKeySwitch.element,
        "s": sKeySwitch.element, "S": sKeySwitch.element,
        "d": dKeyReady.element, "D": dKeyReady.element,
        "ArrowUp": upKeySwitch.element,
        "ArrowDown": downKeySwitch.element,
        "ArrowLeft": leftKeyReady.element,
        "ArrowRight": rightKeyReady.element,
        "Escape": escKey.element
    };
}
// Animate keys when pressed
function animateKeyPress(element, scaleAmount = 1.5, duration = 150) {
    if (!element) return;

    // Preserve current rotation and translate(-50%, -50%)
    const originalTransform = element.style.transform || "translate(-50%, -50%) rotate(0deg) scale(1)";
    const match = originalTransform.match(/rotate\(([-0-9.]+)deg\)/);
    const currentRotate = match ? parseFloat(match[1]) : 0;

    element.style.transform = `translate(-50%, -50%) rotate(${currentRotate}deg) scale(${scaleAmount})`;

    setTimeout(() => {
        element.style.transform = originalTransform;
    }, duration);
}
// Keydown listener for animation
document.addEventListener("keydown", (e) => {
    if (gameState !== "carSelection") return;

    animateKeyPress(keyMap[e.key], 1.5, 150);
    // LEFT SIDE (A / D)
    if ((e.key === "a" || e.key === "A") && !switchingLeft && !p1Ready) {
        queuedLeftIndex = (leftIndex - 1 + leftCars.length) % leftCars.length;
        switchingLeft = true;
        leftIndexDir = -1;
        carLeft.play();
    }
    if ((e.key === "d" || e.key === "D") && !switchingLeft && !p1Ready) {
        queuedLeftIndex = (leftIndex + 1) % leftCars.length;
        switchingLeft = true;
        leftIndexDir = 1;
        carLeft.play();
    }

    if (e.key === "ArrowRight" && !switchingRight && !p2Ready) {
        queuedRightIndex = (rightIndex + 1) % rightCars.length;
        switchingRight = true;
        rightIndexDir = 1;
        carRight.play();
    }
    if (e.key === "ArrowLeft" && !switchingRight && !p2Ready) {
        queuedRightIndex = (rightIndex - 1 + rightCars.length) % rightCars.length;
        switchingRight = true;
        rightIndexDir = -1;
        carRight.play();
    }
    // ESCAPE (Back to Menu)
    if (e.key === "Escape" && inCarSelection && !goingBack) {
        setPlayerReady(1, false);
        setPlayerReady(2, false);
        goingBack = true;
        leftDone = false;
        rightDone = false;
        carLeft.play();
        carRight.play();
        return;
    }

    // P1 READY (W/S)
    if ((e.key === "w" || e.key === "W") && !p1Ready && gameState === "carSelection" && !goingBack) {
        setPlayerReady(1, true);
    }
    if ((e.key === "s" || e.key === "S") && p1Ready && gameState === "carSelection" && !goingBack) {
        setPlayerReady(1, false);
    }
    // P2 READY (Up/Down)
    if (e.key === "ArrowUp" && !p2Ready && gameState === "carSelection" && !goingBack) {
        setPlayerReady(2, true);
    }
    if (e.key === "ArrowDown" && p2Ready && gameState === "carSelection" && !goingBack) {
        setPlayerReady(2, false);
    }
});
function removeUi() {
    uiElements.forEach(el => el.remove());
}