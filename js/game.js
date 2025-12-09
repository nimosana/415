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
        this.minSpeed = 24 / 60; // 0.4
        this.maxSpeed = 60 / 60; // 1.0
        this.baseSpeed = 42 / 60; // 0.7

        this.speed = this.baseSpeed;
        this.targetSpeed = this.baseSpeed;

        this.acceleration = 0.05; // Tuned for responsiveness
        this.deceleration = 0.05;

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

    // Helper to get position for a specific key
    getKeyPosition(key) {
        const k = key.toUpperCase();
        let dx = 0;
        let dy = 0;

        // Config
        const spreadX = 70;
        const spreadY = 30;

        // Left
        if (k === 'A' || k === 'ARROWLEFT') {
            dx = -spreadX - 20;
            dy = spreadY / 2 + 10;
        }
        // Right
        else if (k === 'D' || k === 'ARROWRIGHT') {
            dx = spreadX + 20;
            dy = spreadY / 2 + 10;
        }
        // Up
        else if (k === 'W' || k === 'ARROWUP') {
            dx = -10;
            dy = -spreadY / 2 - 10;
        }
        // Down
        else if (k === 'S' || k === 'ARROWDOWN') {
            dx = 10;
            dy = spreadY / 2 + 10;
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
            this.isCorrect = true;
            return;
        }

        let allMet = true;
        for (const req of requiredKeys) {
            if (!this.currentInputs.has(req)) {
                allMet = false;
                break;
            }
        }

        this.isCorrect = allMet;
    }

    draw(currentFrame) {
        if (!this.loaded) return;

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
            const x = pos.x;
            const targetY = pos.y;
            const img = this.keyAssets[note.key];

            // Calculate Y range
            // Dist from target
            const distHead = (note.start - currentFrame) * this.pixelsPerFrame;
            const yHead = targetY + distHead;

            const distTail = (note.end - currentFrame) * this.pixelsPerFrame;
            const yTail = targetY + distTail;

            const trailW = 20;
            this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            this.ctx.fillRect(x - trailW / 2, yHead, trailW, yTail - yHead);

            if (img) {
                if (currentFrame >= note.start && currentFrame <= note.end) {
                    this.ctx.shadowColor = "#00ff00";
                    this.ctx.shadowBlur = 15;
                } else {
                    this.ctx.shadowColor = "transparent";
                }

                this.ctx.globalAlpha = 1.0;
                this.ctx.drawImage(img, x - 25, yHead - 25, 50, 50);
                this.ctx.shadowBlur = 0;
            }
        }

        this.ctx.restore();
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

    generateBeatmap(totalFrames, keys) {
        // Generate a random-ish but structured beatmap for testing
        const map = [];
        let f = 50;
        while (f < totalFrames - 50) {
            const k = keys[Math.floor(Math.random() * keys.length)];
            const duration = 50 + Math.floor(Math.random() * 100);
            map.push({
                key: k,
                start: f,
                end: Math.min(f + duration, totalFrames)
            });
            f += Math.floor(duration * 0.8);
        }
        return map;
    }

    async start(p1CarIndex, p2CarIndex) {
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

        // Generate Beatmaps
        const p1Map = [
            { key: 'W', start: 0, end: 100 },
            { key: 'A', start: 50, end: 150 }
        ];
        // Append procedural for the rest
        let f = 160;
        const total = 873;
        while (f < total - 50) {
            const k = p1Keys[Math.floor(Math.random() * p1Keys.length)];
            const dur = 60;
            p1Map.push({ key: k, start: f, end: f + dur });
            f += 80; // Gap
        }

        const p2Map = this.generateBeatmap(873, p2Keys);

        // Init Rhythm Controllers
        // Fixed Top Y = 70 (bit lower to accommodate offsets)
        this.p1Rhythm = new RhythmController(this.ctx, w / 2, 70, w, h, p1Keys, p1Map);
        this.p2Rhythm = new RhythmController(this.ctx, w + w / 2, 70, w, h, p2Keys, p2Map);

        await Promise.all([
            this.p1Car.loadAssets(getCarName(p1CarIndex), getCarPath(p1CarIndex)),
            this.p2Car.loadAssets(getCarName(p2CarIndex), getCarPath(p2CarIndex)),
            this.p1Rhythm.loadAssets(),
            this.p2Rhythm.loadAssets()
        ]);

        console.log("Assets Loaded. Starting Countdown.");
        this.isRunning = true;
        this.isCountingDown = true;
        this.winner = null;
        this.countdownValue = 3;
        this.countdownStartTime = performance.now();

        this.p1Car.isPlaying = false;
        this.p2Car.isPlaying = false;

        document.addEventListener("keydown", this.inputHandler);
        document.addEventListener("keyup", this.keyUpHandler);

        this.loop();
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
            }
        } else {
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
                    console.log(`Player ${this.winner} wins!`);
                }
            }
        }

        // Draw
        this.p1Car.draw();
        this.p2Car.draw();

        if (!this.isCountingDown && !this.winner) {
            this.p1Rhythm.draw(this.p1Car.currentFrame);
            this.p2Rhythm.draw(this.p2Car.currentFrame);
        }

        this.drawSeparator();

        if (this.isCountingDown) {
            this.ctx.save();
            this.ctx.fillStyle = "white";
            this.ctx.font = "bold 150px Impact, sans-serif";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.shadowColor = "black";
            this.ctx.shadowBlur = 20;

            const displayVal = Math.ceil(this.countdownValue);
            if (displayVal > 0) {
                this.ctx.fillText(displayVal, this.canvas.width / 2, this.canvas.height / 2);
            } else {
                this.ctx.fillText("GO!", this.canvas.width / 2, this.canvas.height / 2);
            }
            this.ctx.restore();
        }

        if (this.winner !== null) {
            this.ctx.save();
            this.ctx.fillStyle = this.winner === 1 ? "#00ffff" : "#ff00ff"; // Just some colors
            this.ctx.font = "bold 100px Impact, sans-serif";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.shadowColor = "black";
            this.ctx.shadowBlur = 20;
            this.ctx.fillText(`PLAYER ${this.winner} WINS!`, this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.restore();
        }

        this.animationFrameId = requestAnimationFrame(() => this.loop());
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
