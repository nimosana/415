
class ImageSequencePlayer {
    constructor(ctx, x, width, height) {
        this.ctx = ctx;
        this.x = x;
        this.width = width;
        this.height = height;
        this.frames = [];
        this.totalFrames = 873;
        this.currentFrame = 0;
        this.speed = 1.0; // 1.0 = 60fps
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
                    console.error(`Failed to load ${src}`);
                    // Resolve with null or placeholder to keep index correct
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

    update() {
        if (!this.isPlaying) return;

        // Base is 60fps
        // If we run update at 60fps, we just add speed
        this.currentFrame += this.speed;

        if (this.currentFrame >= this.totalFrames) {
            this.currentFrame = this.totalFrames - 1;
            this.isPlaying = false;
            // Trigger finish event?
        }
    }

    draw() {
        if (!this.loaded) return;

        const frameIndex = Math.floor(this.currentFrame);
        const img = this.frames[frameIndex];

        if (img) {
            // Draw centered or fill?
            // Assuming 16:9 vertical split, we want to maintain aspect ratio probably, 
            // but for now fill the slice.
            this.ctx.drawImage(img, this.x, 0, this.width, this.height);
        }
    }
}

class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.p1Car = null;
        this.p2Car = null;
        this.isRunning = false;
        this.animationFrameId = null;
        this.isCountingDown = false;
        this.countdownValue = 3;
        this.countdownStartTime = 0;
    }

    init() {
        const container = document.getElementById("videoContainer");

        // Create canvas layer on top of everything
        this.canvas = document.createElement("canvas");
        this.canvas.id = "gameCanvas";
        this.canvas.style.position = "absolute";
        this.canvas.style.top = "0";
        this.canvas.style.left = "0";
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.canvas.style.zIndex = "500"; // Below UI (which is 1000 usually)
        this.canvas.style.display = "none";

        container.appendChild(this.canvas);

        // Resize canvas to match internal resolution or display size
        this.canvas.width = container.offsetWidth;
        this.canvas.height = container.offsetHeight;

        this.ctx = this.canvas.getContext("2d");
    }

    async start(p1CarIndex, p2CarIndex) {
        this.canvas.style.display = "block";
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Map index to car folder/name
        // leftCars = ["assets/video/car1L.webm", ...] so index 0 = car1
        const getCarName = (idx) => `car${idx + 1}`;
        const getCarPath = (idx) => `assets/video/car${idx + 1}`;

        console.log("Loading Game...");

        // Setup Players
        const w = this.canvas.width / 2;
        const h = this.canvas.height;

        this.p1Car = new ImageSequencePlayer(this.ctx, 0, w, h);
        this.p2Car = new ImageSequencePlayer(this.ctx, w, w, h);

        // Preload
        // TODO: Show loading screen UI here

        await Promise.all([
            this.p1Car.loadAssets(getCarName(p1CarIndex), getCarPath(p1CarIndex)),
            this.p2Car.loadAssets(getCarName(p2CarIndex), getCarPath(p2CarIndex))
        ]);

        console.log("Assets Loaded. Starting Countdown.");
        this.isRunning = true;
        this.isCountingDown = true;
        this.countdownValue = 3;
        this.countdownStartTime = performance.now();

        // p1Car and p2Car are NOT playing yet
        this.p1Car.isPlaying = false;
        this.p2Car.isPlaying = false;

        this.loop();
    }

    loop() {
        if (!this.isRunning) return;

        // Clear
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update
        // Update
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
            this.p1Car.update();
            this.p2Car.update();
        }

        // Draw
        this.p1Car.draw();
        this.p2Car.draw();

        // Draw separator
        this.drawSeparator();

        // Draw Countdown
        if (this.isCountingDown) {
            this.ctx.save();
            this.ctx.fillStyle = "white";
            this.ctx.font = "bold 150px Impact, sans-serif";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.shadowColor = "black";
            this.ctx.shadowBlur = 20;

            // Ceil to show 3, 2, 1. If < 0 it goes to 'GO' or just disappears (logic above handled disappear)
            // Actually let's show "GO!" for a split second or just start?
            // User requested "3-second countdown before the game starts".
            const displayVal = Math.ceil(this.countdownValue);
            if (displayVal > 0) {
                this.ctx.fillText(displayVal, this.canvas.width / 2, this.canvas.height / 2);
            } else {
                this.ctx.fillText("GO!", this.canvas.width / 2, this.canvas.height / 2);
            }
            this.ctx.restore();
        }

        this.animationFrameId = requestAnimationFrame(() => this.loop());
    }

    stop() {
        this.isRunning = false;
        cancelAnimationFrame(this.animationFrameId);
        if (this.canvas) {
            this.canvas.style.display = "none";
        }
    }

    drawSeparator() {
        // this.ctx.beginPath();
        // this.ctx.moveTo(this.canvas.width / 2, 0);
        // this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        // this.ctx.strokeStyle = "white";
        // this.ctx.lineWidth = 4;
        // this.ctx.stroke();
    }
}

window.GameInstance = new Game();
