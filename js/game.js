// Beatmap Templates
// Define the start and end frame for each key press.
// Available Keys: 'UP', 'DOWN', 'LEFT', 'RIGHT'
const CAR_BEATMAPS = {
    car1: [
        // Example: { key: 'UP', start: 50, end: 100 },
        { key: 'UP', start: 0, end: 40 }, { key: 'UP', start: 60, end: 90 }, { key: 'UP', start: 120, end: 140 }, { key: 'UP', start: 165, end: 300 }, { key: 'UP', start: 400, end: 650 }, { key: 'UP', start: 675, end: 700 }, { key: 'UP', start: 720, end: 760 }, { key: 'UP', start: 790, end: 825 }, { key: 'UP', start: 850, end: 872 },
        { key: 'DOWN', start: 40, end: 60 }, { key: 'DOWN', start: 90, end: 120 }, { key: 'DOWN', start: 140, end: 165 }, { key: 'DOWN', start: 300, end: 350 }, { key: 'DOWN', start: 375, end: 400 }, { key: 'DOWN', start: 700, end: 720 }, { key: 'DOWN', start: 760, end: 790 }, { key: 'DOWN', start: 825, end: 850 },
        { key: 'RIGHT', start: 40, end: 60 }, { key: 'RIGHT', start: 90, end: 165 }, { key: 'RIGHT', start: 300, end: 350 }, { key: 'RIGHT', start: 440, end: 570 }, { key: 'RIGHT', start: 720, end: 760 }, { key: 'RIGHT', start: 820, end: 850 },
        { key: 'LEFT', start: 60, end: 90 }, { key: 'LEFT', start: 165, end: 265 }, { key: 'LEFT', start: 350, end: 440 }, { key: 'LEFT', start: 570, end: 720 }, { key: 'LEFT', start: 760, end: 820 }, { key: 'LEFT', start: 850, end: 872 },
    ],
    car2: [
        { key: 'UP', start: 0, end: 60 }, { key: 'UP', start: 110, end: 180 }, { key: 'UP', start: 200, end: 350 }, { key: 'UP', start: 375, end: 430 }, { key: 'UP', start: 450, end: 675 }, { key: 'UP', start: 700, end: 740 }, { key: 'UP', start: 780, end: 820 }, { key: 'UP', start: 850, end: 872 },
        { key: 'DOWN', start: 60, end: 90 }, { key: 'DOWN', start: 180, end: 200 }, { key: 'DOWN', start: 350, end: 375 }, { key: 'DOWN', start: 740, end: 780 }, { key: 'DOWN', start: 820, end: 850 },
        { key: 'RIGHT', start: 40, end: 60 }, { key: 'RIGHT', start: 135, end: 190 }, { key: 'RIGHT', start: 330, end: 375 }, { key: 'RIGHT', start: 510, end: 560 }, { key: 'RIGHT', start: 740, end: 780 }, { key: 'RIGHT', start: 810, end: 850 },
        { key: 'LEFT', start: 60, end: 135 }, { key: 'LEFT', start: 190, end: 300 }, { key: 'LEFT', start: 375, end: 510 }, { key: 'LEFT', start: 560, end: 710 }, { key: 'LEFT', start: 780, end: 810 }, { key: 'LEFT', start: 850, end: 872 },
    ],
    car3: [
        { key: 'UP', start: 0, end: 40 }, { key: 'UP', start: 70, end: 120 }, { key: 'UP', start: 140, end: 180 }, { key: 'UP', start: 200, end: 330 }, { key: 'UP', start: 360, end: 430 }, { key: 'UP', start: 450, end: 710 }, { key: 'UP', start: 790, end: 810 }, { key: 'UP', start: 840, end: 872 },
        { key: 'DOWN', start: 40, end: 70 }, { key: 'DOWN', start: 120, end: 140 }, { key: 'DOWN', start: 330, end: 360 }, { key: 'DOWN', start: 750, end: 790 },
        { key: 'RIGHT', start: 40, end: 70 }, { key: 'RIGHT', start: 140, end: 200 }, { key: 'RIGHT', start: 330, end: 360 }, { key: 'RIGHT', start: 480, end: 530 }, { key: 'RIGHT', start: 740, end: 780 }, { key: 'RIGHT', start: 800, end: 840 },
        { key: 'LEFT', start: 70, end: 140 }, { key: 'LEFT', start: 200, end: 300 }, { key: 'LEFT', start: 360, end: 480 }, { key: 'LEFT', start: 530, end: 740 }, { key: 'LEFT', start: 780, end: 800 }, { key: 'LEFT', start: 840, end: 872 },
    ]
};

class ImageSequencePlayer {
    constructor(ctx, x, width, height) {
        this.ctx = ctx;
        this.x = x;
        this.width = width;
        this.height = height;
        this.frames = [];
        this.totalFrames = 873;
        this.currentFrame = 0;

        // Speed settings (relative to 60fps)
        this.minSpeed = 12 / 60; // 0.4
        this.maxSpeed = 60 / 60; // 1.0
        this.baseSpeed = 12 / 60; // 0.7

        this.speed = this.baseSpeed;
        this.targetSpeed = this.baseSpeed;

        this.acceleration = 0.01; // Tuned for responsiveness
        this.deceleration = 0.01;

        this.isPlaying = false;
        this.loaded = false;
    }

    async loadAssets(carName, folderPath) {
        // Naming convention: carOne_000.webp, carTwo_000.webp, etc.
        const promises = [];
        const pad = (num) => num.toString().padStart(3, '0');

        let filePrefix = "";
        if (carName === "car1") filePrefix = "carOne";
        else if (carName === "car2") filePrefix = "carTwo";
        else if (carName === "car3") filePrefix = "carThree";
        else if (carName === "car4") filePrefix = "carFour";

        for (let i = 0; i < this.totalFrames; i++) {
            const src = `${folderPath}/${filePrefix}_${pad(i)}.webp`;
            const p = new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => {
                    // console.error(`Failed to load ${src}`);
                    resolve(null);
                };
                img.src = src;
            });
            promises.push(p);
        }

        this.frames = await Promise.all(promises);
        this.loaded = true;
        console.log(`Loaded ${this.frames.length} frames for ${carName}`);
    }

    setTargetSpeed(isCorrect) {
        this.targetSpeed = isCorrect ? this.maxSpeed : this.minSpeed;
    }

    update() {
        if (!this.isPlaying) return;

        // Smoothly adjust speed towards target
        if (this.speed < this.targetSpeed) {
            this.speed = Math.min(this.speed + this.acceleration, this.targetSpeed);
        } else if (this.speed > this.targetSpeed) {
            this.speed = Math.max(this.speed - this.deceleration, this.targetSpeed);
        }

        this.currentFrame += this.speed;

        if (this.currentFrame >= this.totalFrames) {
            this.currentFrame = this.totalFrames - 1;
            this.isPlaying = false;
        }
    }

    draw() {
        if (!this.loaded) return;

        const frameIndex = Math.floor(this.currentFrame);
        const img = this.frames[frameIndex];

        if (img) {
            this.ctx.drawImage(img, this.x, 0, this.width, this.height);
        }
    }

    isFinished() {
        return !this.isPlaying && this.currentFrame >= this.totalFrames - 1;
    }
}

class RhythmController {
    constructor(ctx, x, y, width, height, keys, beatMap) {
        this.ctx = ctx;
        this.x = x;      // Center X of the track
        this.y = y;      // Center Y of the target area
        this.width = width;
        this.height = height;

        this.availableKeys = keys;
        this.beatMap = beatMap;

        this.keyAssets = {};
        this.loaded = false;

        this.currentInputs = new Set();
        this.isCorrect = false;

        this.pixelsPerFrame = 2;
        this.lookaheadFrames = 300;
    }

    async loadAssets() {
        const loadImg = (path) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
                img.src = path;
            });
        };

        const promises = this.availableKeys.map(async k => {
            let filename = `keys_${k.toUpperCase()}.webp`;
            if (k === 'ArrowUp') filename = 'keys_UP.webp';
            if (k === 'ArrowDown') filename = 'keys_DOWN.webp';
            if (k === 'ArrowLeft') filename = 'keys_LEFT.webp';
            if (k === 'ArrowRight') filename = 'keys_RIGHT.webp';

            this.keyAssets[k] = await loadImg(`assets/image/${filename}`);
        });

        await Promise.all(promises);
        this.loaded = true;
    }

    setInput(key, isPressed) {
        if (isPressed) {
            this.currentInputs.add(key.toUpperCase());
        } else {
            this.currentInputs.delete(key.toUpperCase());
        }
    }

    getKeyPosition(key) {
        const k = key.toUpperCase();
        let dx = 0;
        let dy = 0;
        const offset = 60;

        // "Crosshair" Layout
        if (k === 'A' || k === 'ARROWLEFT') {
            dx = -offset;
            dy = 0;
        } else if (k === 'D' || k === 'ARROWRIGHT') {
            dx = offset;
            dy = 0;
        } else if (k === 'W' || k === 'ARROWUP') {
            dx = 0;
            dy = -offset;
        } else if (k === 'S' || k === 'ARROWDOWN') {
            dx = 0;
            dy = offset;
        }

        return {
            x: this.x + dx,
            y: this.y + dy
        };
    }

    update(currentFrame) {
        if (!this.loaded) return;

        const requiredKeys = new Set();

        for (const note of this.beatMap) {
            if (currentFrame >= note.start && currentFrame <= note.end) {
                requiredKeys.add(note.key.toUpperCase());
            }
        }

        if (requiredKeys.size === 0) {
            this.isCorrect = (this.currentInputs.size === 0);
            return;
        }

        let allMet = true;
        for (const req of requiredKeys) {
            if (!this.currentInputs.has(req)) {
                allMet = false;
                break;
            }
        }

        if (allMet && this.currentInputs.size !== requiredKeys.size) {
            allMet = false;
        }

        this.isCorrect = allMet;
    }

    draw(currentFrame) {
        if (!this.loaded) return;

        this.ctx.save();
        // Clip to player area
        // this.x is center. this.width is full width.
        // Left Edge: this.x - this.width / 2
        this.ctx.beginPath();
        this.ctx.rect(this.x - this.width / 2, 0, this.width, this.height);
        this.ctx.clip();

        // 1. Draw Static Targets
        this.availableKeys.forEach((k) => {
            const pos = this.getKeyPosition(k);
            const img = this.keyAssets[k];

            if (img) {
                this.ctx.save();
                this.ctx.globalAlpha = 0.5;
                if (this.currentInputs.has(k.toUpperCase())) {
                    this.ctx.globalAlpha = 0.8;
                    this.ctx.shadowColor = "white";
                    this.ctx.shadowBlur = 10;
                }
                this.ctx.drawImage(img, pos.x - 25, pos.y - 25, 50, 50);
                this.ctx.restore();
            }
        });

        // 2. Draw Scrolling Notes
        this.ctx.save();

        for (const note of this.beatMap) {
            if (note.end < currentFrame - 50) continue;
            if (note.start > currentFrame + this.lookaheadFrames) continue;

            const k = note.key.toUpperCase();
            const pos = this.getKeyPosition(k);
            const targetX = pos.x;
            const targetY = pos.y;
            const img = this.keyAssets[note.key];

            const distHead = (note.start - currentFrame) * this.pixelsPerFrame;
            const distTail = (note.end - currentFrame) * this.pixelsPerFrame;

            let xHead = targetX;
            let yHead = targetY;

            let isVertical = false;

            if (k === 'W' || k === 'ARROWUP') {
                // Comes from TOP (moves DOWN)
                yHead = targetY - distHead;
                if (yHead > targetY) yHead = targetY; // Sticky

                const yTail = targetY - distTail;

                isVertical = true;
                this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                if (yTail < yHead) {
                    this.ctx.fillRect(targetX - 10, yTail, 20, yHead - yTail);
                }

            } else if (k === 'S' || k === 'ARROWDOWN') {
                // Comes from BOTTOM (moves UP)
                yHead = targetY + distHead;
                if (yHead < targetY) yHead = targetY; // Sticky

                const yTail = targetY + distTail;

                isVertical = true;
                this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                if (yTail > yHead) {
                    this.ctx.fillRect(targetX - 10, yHead, 20, yTail - yHead);
                }

            } else if (k === 'A' || k === 'ARROWLEFT') {
                // Comes from LEFT (moves RIGHT)
                xHead = targetX - distHead;
                if (xHead > targetX) xHead = targetX;

                const xTail = targetX - distTail;

                isVertical = false;
                this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                if (xTail < xHead) {
                    this.ctx.fillRect(xTail, targetY - 10, xHead - xTail, 20);
                }

            } else if (k === 'D' || k === 'ARROWRIGHT') {
                // Comes from RIGHT (moves LEFT)
                xHead = targetX + distHead;
                if (xHead < targetX) xHead = targetX;

                const xTail = targetX + distTail;

                isVertical = false;
                this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                if (xTail > xHead) {
                    this.ctx.fillRect(xHead, targetY - 10, xTail - xHead, 20);
                }
            }

            if (img) {
                if (currentFrame >= note.start && currentFrame <= note.end) {
                    this.ctx.shadowColor = "#00ff00";
                    this.ctx.shadowBlur = 15;
                } else {
                    this.ctx.shadowColor = "transparent";
                }

                this.ctx.globalAlpha = 1.0;
                this.ctx.drawImage(img, xHead - 25, yHead - 25, 50, 50);
                this.ctx.shadowBlur = 0;
            }
        }

        this.ctx.restore(); // Restore clipping
        this.ctx.restore(); // Restore specific draw settings (if any, though previous restore was inside loop)
    }
}

class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.p1Car = null;
        this.p2Car = null;

        this.p1Rhythm = null;
        this.p2Rhythm = null;

        this.isRunning = false;
        this.animationFrameId = null;
        this.isCountingDown = false;
        this.countdownValue = 3;
        this.countdownStartTime = 0;

        this.winner = null;

        this.inputHandler = this.handleInput.bind(this);
        this.keyUpHandler = this.handleKeyUp.bind(this);

        this.onGameEnd = null;
        this.winVideo = null;
        this.returnBtn = null;
        this.p1CarIndex = 0;
        this.p2CarIndex = 1;
        this.countdownAssets = [];
    }

    init() {
        const container = document.getElementById("videoContainer");

        this.canvas = document.createElement("canvas");
        this.canvas.id = "gameCanvas";
        this.canvas.style.position = "absolute";
        this.canvas.style.top = "0";
        this.canvas.style.left = "0";
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.canvas.style.zIndex = "500";
        this.canvas.style.display = "none";

        container.appendChild(this.canvas);

        this.canvas.width = container.offsetWidth;
        this.canvas.height = container.offsetHeight;

        this.ctx = this.canvas.getContext("2d");
    }

    // Helper to convert abstract directions to specific player keys
    getMappedBeatmap(carName, isPlayer1) {
        const rawMap = CAR_BEATMAPS[carName] || [];

        return rawMap.map(note => {
            let k = note.key;
            if (isPlayer1) {
                if (k === 'UP') k = 'W';
                else if (k === 'DOWN') k = 'S';
                else if (k === 'LEFT') k = 'A';
                else if (k === 'RIGHT') k = 'D';
            } else {
                if (k === 'UP') k = 'ArrowUp';
                else if (k === 'DOWN') k = 'ArrowDown';
                else if (k === 'LEFT') k = 'ArrowLeft';
                else if (k === 'RIGHT') k = 'ArrowRight';
            }
            return {
                key: k,
                start: note.start,
                end: note.end
            };
        });
    }

    async start(p1CarIndex, p2CarIndex, onGameEnd) {
        this.onGameEnd = onGameEnd;
        this.p1CarIndex = p1CarIndex;
        this.p2CarIndex = p2CarIndex;

        this.canvas.style.display = "block";
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const getCarName = (idx) => `car${idx + 1}`;
        const getCarPath = (idx) => `assets/video/car${idx + 1}`;

        console.log("Loading Game...");

        const w = this.canvas.width / 2;
        const h = this.canvas.height;

        this.p1Car = new ImageSequencePlayer(this.ctx, 0, w, h);
        this.p2Car = new ImageSequencePlayer(this.ctx, w, w, h);

        // Define Keys
        const p1Keys = ['W', 'A', 'S', 'D'];
        const p2Keys = ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'];

        // Get Beatmaps from Template
        const p1Map = this.getMappedBeatmap(getCarName(p1CarIndex), true);
        const p2Map = this.getMappedBeatmap(getCarName(p2CarIndex), false);

        // Init Rhythm Controllers
        // Center Vertically
        const centerY = h / 2;
        this.p1Rhythm = new RhythmController(this.ctx, w / 2, centerY, w, h, p1Keys, p1Map);
        this.p2Rhythm = new RhythmController(this.ctx, w + w / 2, centerY, w, h, p2Keys, p2Map);

        await Promise.all([
            this.p1Car.loadAssets(getCarName(p1CarIndex), getCarPath(p1CarIndex)),
            this.p2Car.loadAssets(getCarName(p2CarIndex), getCarPath(p2CarIndex)),
            this.p1Rhythm.loadAssets(),
            this.p1Rhythm.loadAssets(),
            this.p2Rhythm.loadAssets(),
            this.loadCountdownAssets()
        ]);

        console.log("Assets Loaded. Starting Countdown.");
        this.isRunning = true;
        this.isCountingDown = true;
        this.winner = null;
        this.countdownValue = 3;
        this.countdownValue = 3;
        this.countdownStartTime = performance.now();
        this.raceStartTime = null;
        this.elapsedTime = 0;
        this.timeDisplay = null;

        this.p1Car.isPlaying = false;
        this.p2Car.isPlaying = false;

        document.addEventListener("keydown", this.inputHandler);
        document.addEventListener("keyup", this.keyUpHandler);

        this.loop();
    }

    async loadCountdownAssets() {
        const promises = [0, 1, 2, 3].map(i => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve({ index: i, img });
                img.onerror = () => resolve({ index: i, img: null });
                img.src = `assets/image/countdown${i}.webp`;
            });
        });

        const results = await Promise.all(promises);
        this.countdownAssets = new Array(4);
        results.forEach(r => {
            this.countdownAssets[r.index] = r.img;
        });
    }

    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor(ms % 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }

    handleInput(e) {
        // P1 Controls
        if (['w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
            this.p1Rhythm.setInput(e.key, true);
        }

        // P2 Controls
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            this.p2Rhythm.setInput(e.key, true);
        }
    }

    handleKeyUp(e) {
        if (['w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
            this.p1Rhythm.setInput(e.key, false);
        }
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            this.p2Rhythm.setInput(e.key, false);
        }
    }

    loop() {
        if (!this.isRunning) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.isCountingDown) {
            const now = performance.now();
            const elapsed = (now - this.countdownStartTime) / 1000;
            this.countdownValue = 3 - elapsed;

            if (this.countdownValue <= 0) {
                this.isCountingDown = false;
                this.p1Car.isPlaying = true;
                this.p2Car.isPlaying = true;
                this.raceStartTime = performance.now();

                // Show GO!
                const goNotif = this.createFloatingElement("assets/image/countdown0.webp", {
                    containerId: "videoContainer",
                    left: 50,
                    top: 50,
                    scale: 0.15,
                    fadeIn: false
                });

                // Start fade out after 500ms
                setTimeout(() => {
                    if (goNotif && goNotif.element) {
                        goNotif.element.style.transition = "opacity 0.5s";
                        goNotif.element.style.opacity = "0";
                    }
                }, 500);

                setTimeout(() => {
                    if (goNotif) goNotif.remove();
                }, 1000);
            }
        } else {
            // Update Timer
            this.elapsedTime = performance.now() - this.raceStartTime;

            // Update Rhythm based on CURRENT FRAME of the video
            this.p1Rhythm.update(this.p1Car.currentFrame);
            this.p2Rhythm.update(this.p2Car.currentFrame);

            // Adjust speeds based on performance
            this.p1Car.setTargetSpeed(this.p1Rhythm.isCorrect);
            this.p2Car.setTargetSpeed(this.p2Rhythm.isCorrect);

            this.p1Car.update();
            this.p2Car.update();

            // Check win
            if (this.winner === null) {
                if (this.p1Car.isFinished()) this.winner = 1;
                else if (this.p2Car.isFinished()) this.winner = 2;

                if (this.winner !== null) {
                    this.isRunning = false;
                    this.handleWin(this.winner, this.elapsedTime);
                    return; // Stop processing loop
                }
            }
        }

        // Draw
        this.p1Car.draw();
        this.p2Car.draw();

        if (!this.winner) {
            this.p1Rhythm.draw(this.p1Car.currentFrame);
            this.p2Rhythm.draw(this.p2Car.currentFrame);
        }

        this.drawSeparator();

        if (this.isCountingDown) {
            this.ctx.save();
            const displayVal = Math.ceil(this.countdownValue); // 3, 2, 1
            let imgToDraw = null;

            if (displayVal > 0 && displayVal <= 3) {
                imgToDraw = this.countdownAssets[displayVal];
            }

            if (imgToDraw) {
                // Draw centered
                const cw = this.canvas.width;
                const ch = this.canvas.height;
                const scale = 0.15; // Adjust as needed
                const iw = cw * scale;
                const ih = iw * (imgToDraw.height / imgToDraw.width);

                this.ctx.shadowColor = "black";
                this.ctx.shadowBlur = 20;
                this.ctx.drawImage(imgToDraw, cw / 2 - iw / 2, ch / 2 - ih / 2, iw, ih);
            }

            this.ctx.restore();
        } else if (!this.winner) {
            // Draw Timer
            this.ctx.save();
            this.ctx.fillStyle = "white";
            this.ctx.font = "bold 40px Impact, sans-serif";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "top";
            this.ctx.shadowColor = "black";
            this.ctx.shadowBlur = 10;
            this.ctx.fillText(this.formatTime(this.elapsedTime), this.canvas.width / 2, 20);
            this.ctx.restore();
        }

        this.animationFrameId = requestAnimationFrame(() => this.loop());
    }

    createFloatingElement(src, opts) {
        const {
            containerId,
            left,
            top,
            scale = 0.1,
            fadeIn = true,
            opacity = 1,
            textText = null, // Optional text to overlay
            onClick = null,  // Optional click handler
            textColor = "white",
            fontFamily = "Impact, sans-serif"
        } = opts;

        const container = document.getElementById(containerId);
        if (!container) return null;

        // Container for the floating element (allows grouping text + image)
        const wrapper = document.createElement("div");
        wrapper.style.position = "absolute";
        wrapper.style.left = typeof left === "number" ? `${left}%` : left;
        wrapper.style.top = typeof top === "number" ? `${top}%` : top;
        wrapper.style.opacity = fadeIn ? 0 : opacity;
        wrapper.style.transform = "translate(-50%, -50%)";
        wrapper.style.zIndex = "601";
        if (onClick) {
            wrapper.style.cursor = "pointer";
            wrapper.onclick = onClick;
        }

        const img = document.createElement("img");
        img.src = src;
        img.style.display = "block";
        img.style.width = "100%";
        img.style.height = "auto";
        wrapper.appendChild(img);

        let textEl = null;
        if (textText) {
            textEl = document.createElement("div");
            textEl.innerText = textText;
            textEl.style.position = "absolute";
            textEl.style.top = "50%";
            textEl.style.left = "50%";
            textEl.style.transform = "translate(-50%, -50%)";
            textEl.style.textAlign = "center";
            textEl.style.color = textColor;
            textEl.style.fontFamily = fontFamily;
            // Font size needs to scale with the image/container, but for now fixed relative or handled below
            textEl.style.fontSize = "2vw"; // Responsive font size
            // textEl.style.textShadow = "0px 0px 5px black";
            textEl.style.whiteSpace = "nowrap";
            wrapper.appendChild(textEl);
        }

        container.appendChild(wrapper);

        // Initial sizing
        const updateSize = () => {
            const containerWidth = container.offsetWidth;
            const newWidth = containerWidth * scale;
            wrapper.style.width = `${newWidth}px`;

            if (textEl) {
                // Adjust font size specifically if needed, but vw might suffice
                // textEl.style.fontSize = `${newWidth * 0.2}px`; // Example scaling
            }
        };

        // Wait for image to load for Aspect Ratio (optional, but good practice)
        img.onload = () => {
            updateSize();
            if (fadeIn) {
                wrapper.style.transition = "opacity 0.5s";
                wrapper.style.transition = "transform 0.5s";
                requestAnimationFrame(() => {
                    wrapper.style.opacity = opacity;
                });
            }
        };
        // Run immediately in case cached
        if (img.complete) {
            updateSize();
            if (fadeIn) wrapper.style.opacity = opacity;
        }

        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(container);

        // Animation Loop
        const interval = setInterval(() => {
            const r = Math.random() * 5 - 2;
            const s = 1 + (Math.random() * 0.1 - 0.05);
            // Apply transform to the wrapper
            // IMPORTANT: maintain centering translate
            wrapper.style.transform = `translate(-50%, -50%) rotate(${r}deg) scale(${s})`;
        }, 1000);

        return {
            element: wrapper,
            interval: interval,
            resizeObserver: resizeObserver,
            remove() {
                clearInterval(interval);
                resizeObserver.disconnect();
                wrapper.remove();
            }
        };
    }

    handleWin(winner, finalTime) {

        const winningCarIndex = winner === 1 ? this.p1CarIndex : this.p2CarIndex;
        const carNum = winningCarIndex + 1; // 0-based index to 1-based suffix

        const container = document.getElementById("videoContainer");

        // Win Video
        this.winVideo = document.createElement("video");
        this.winVideo.src = `assets/video/car${carNum}win.webm`;
        this.winVideo.style.position = "absolute";
        this.winVideo.style.top = "0";
        this.winVideo.style.left = "0";
        this.winVideo.style.width = "100%";
        this.winVideo.style.height = "100%";
        this.winVideo.style.objectFit = "cover"; // Maintain aspect ratio
        this.winVideo.style.zIndex = "600";
        this.winVideo.autoplay = true;
        this.winVideo.loop = false;

        container.appendChild(this.winVideo);

        // Return Button (Floating)
        this.returnBtn = this.createFloatingElement("assets/image/return.webp", {
            containerId: "videoContainer",
            left: 90,
            top: 90, // Bottom-Right area
            scale: 0.1,
            fadeIn: true,
            onClick: () => {
                this.cleanup();
                if (this.onGameEnd) this.onGameEnd();
            }
        });

        // Time Display (Floating with Placeholder Background)
        this.timeDisplay = this.createFloatingElement("assets/image/blank.webp", {
            containerId: "videoContainer",
            left: 50,
            top: 80, // Bottom Center area
            scale: 0.25, // Wider for text
            fadeIn: true,
            textText: "TIME: " + this.formatTime(finalTime),
            textColor: "black",
            fontFamily: '"Comic Sans MS", "Comic Sans", cursive'
        });
    }

    cleanup() {
        if (this.winVideo) {
            this.winVideo.remove();
            this.winVideo = null;
        }
        if (this.returnBtn) {
            this.returnBtn.remove();
            this.returnBtn = null;
        }
        if (this.timeDisplay) {
            this.timeDisplay.remove();
            this.timeDisplay = null;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.style.display = "none";
        this.isRunning = false;
        cancelAnimationFrame(this.animationFrameId);
        document.removeEventListener("keydown", this.inputHandler);
        document.removeEventListener("keyup", this.keyUpHandler);
    }

    stop() {
        this.isRunning = false;
        cancelAnimationFrame(this.animationFrameId);
        document.removeEventListener("keydown", this.inputHandler);
        document.removeEventListener("keyup", this.keyUpHandler);
        if (this.canvas) {
            this.canvas.style.display = "none";
        }
    }

    drawSeparator() {
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
    }
}

window.GameInstance = new Game();
