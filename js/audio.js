class GameAudio {

    static firstSong = true;

    // Original playlist
    // Original playlist
    static masterList = [
        { path: "assets/audio/song1.mp3", image: "assets/audio/song1.webp" },
        { path: "assets/audio/song2.mp3", image: "assets/audio/song2.webp" },
        { path: "assets/audio/song3.mp3", image: "assets/audio/song3.webp" },
        { path: "assets/audio/song4.mp3", image: "assets/audio/song4.webp" },
        { path: "assets/audio/song5.mp3", image: "assets/audio/song5.webp" }

    ];

    static bgm = document.getElementById("bgm");
    // This will be filled and emptied as songs are played
    static playlist = [{ path: "assets/audio/song1.mp3", image: "assets/audio/song1.webp" },
    { path: "assets/audio/song2.mp3", image: "assets/audio/song2.webp" },
    { path: "assets/audio/song3.mp3", image: "assets/audio/song3.webp" },
    { path: "assets/audio/song4.mp3", image: "assets/audio/song4.webp" },
    { path: "assets/audio/song5.mp3", image: "assets/audio/song5.webp" }];
    static nowPlaying = "assets/audio/nowPlaying.webp"
    static lastSong = "";
    static activeNotifications = [];
    static notificationTimer = null;
    // Get a random item and remove it from the list
    static getRandomSong() {
        let i = null;
        if (GameAudio.playlist.length === 0) {
            // refill when empty
            console.log("refilling playlist");
            GameAudio.playlist = [...GameAudio.masterList];
            i = Math.floor(Math.random() * GameAudio.playlist.length);
            while (GameAudio.playlist[i].path === GameAudio.lastSong) {
                i = Math.floor(Math.random() * GameAudio.playlist.length);
                console.log("skipping duplicate song: " + GameAudio.playlist[i].path);
            }
        } else { i = Math.floor(Math.random() * GameAudio.playlist.length) };
        if (GameAudio.firstSong) {
            i = 0;
            GameAudio.firstSong = false;
        }
        return GameAudio.playlist.splice(i, 1)[0];
    }

    static playRandomSong() {
        if (GameAudio.playlist.length === 0) {
            GameAudio.getRandomSong();
        }

        const next = GameAudio.getRandomSong();
        if (!next) return;

        GameAudio.bgm.src = next.path;
        GameAudio.lastSong = next.path;
        console.log("Playing: " + next.path);

        GameAudio.bgm.load();
        GameAudio.bgm.addEventListener("canplaythrough", () => {
            GameAudio.bgm.play().catch(() => { });
        }, { once: true });

        GameAudio.clearNotifications();
        GameAudio.showNotification(next.image);
        GameAudio.showNotification(GameAudio.nowPlaying, { left: 80, top: 6, scale: 0.1 });
    }

    static clearNotifications() {
        if (GameAudio.notificationTimer) {
            clearTimeout(GameAudio.notificationTimer);
            GameAudio.notificationTimer = null;
        }
        GameAudio.activeNotifications.forEach(n => n.remove());
        GameAudio.activeNotifications = [];
    }

    static showNotification(imageSrc, options = {}) {
        const settings = {
            left: 85,
            top: 15,
            scale: 0.2,
            ...options
        };

        if (typeof window.createFloatingUIElement === 'function') {
            const notif = window.createFloatingUIElement(imageSrc, {
                containerId: "videoContainer",
                left: settings.left,
                top: settings.top,
                scale: settings.scale,
                fadeIn: true
            });

            GameAudio.activeNotifications.push(notif);

            if (GameAudio.notificationTimer) clearTimeout(GameAudio.notificationTimer);
            GameAudio.notificationTimer = setTimeout(() => {
                GameAudio.clearNotifications();
            }, 3000);
        }
    }

    static skipSong() {
        console.log("Skipping song...");
        GameAudio.playRandomSong();
    }

    static init() {
        document.addEventListener("keydown", (e) => {
            if (e.key === "1") {
                GameAudio.skipSong();
            }
        });
    }
}

GameAudio.init();