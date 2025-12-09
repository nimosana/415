class Audio {

    static firstSong = true;

    // Original playlist
    // Original playlist
    static masterList = [
        { path: "assets/audio/song1.mp3", image: "assets/image/placeholder.webp" },
        { path: "assets/audio/song2.mp3", image: "assets/image/placeholder.webp" },
        { path: "assets/audio/song3.mp3", image: "assets/image/placeholder.webp" },
        { path: "assets/audio/song4.mp3", image: "assets/image/placeholder.webp" },
        { path: "assets/audio/song5.mp3", image: "assets/image/placeholder.webp" }

    ];

    static bgm = document.getElementById("bgm");
    // This will be filled and emptied as songs are played
    static playlist = [{ path: "assets/audio/song1.mp3", image: "assets/image/placeholder.webp" },
    { path: "assets/audio/song2.mp3", image: "assets/image/placeholder.webp" },
    { path: "assets/audio/song3.mp3", image: "assets/image/placeholder.webp" },
    { path: "assets/audio/song4.mp3", image: "assets/image/placeholder.webp" },
    { path: "assets/audio/song5.mp3", image: "assets/image/placeholder.webp" }];
    static lastSong = "";
    static currentNotification = null;
    // Get a random item and remove it from the list
    static getRandomSong() {
        let i = null;
        if (Audio.playlist.length === 0) {
            // refill when empty
            console.log("refilling playlist");
            Audio.playlist = [...Audio.masterList];
            i = Math.floor(Math.random() * Audio.playlist.length);
            while (Audio.playlist[i].path === Audio.lastSong) {
                i = Math.floor(Math.random() * Audio.playlist.length);
                console.log("skipping duplicate song: " + Audio.playlist[i].path);
            }
        } else { i = Math.floor(Math.random() * Audio.playlist.length) };
        if (Audio.firstSong) {
            i = 0;
            Audio.firstSong = false;
        }
        return Audio.playlist.splice(i, 1)[0];
    }

    static playRandomSong() {
        if (Audio.playlist.length === 0) {
            Audio.getRandomSong();
        }

        const next = Audio.getRandomSong();
        if (!next) return;

        Audio.bgm.src = next.path;
        Audio.lastSong = next.path;
        console.log("Playing: " + next.path);

        Audio.bgm.load();
        Audio.bgm.addEventListener("canplaythrough", () => {
            Audio.bgm.play().catch(() => { });
        }, { once: true });

        Audio.showNotification(next.image);
    }

    static showNotification(imageSrc) {
        // Remove existing notification if any
        if (Audio.currentNotification) {
            Audio.currentNotification.remove();
            Audio.currentNotification = null;
        }

        if (typeof window.createFloatingUIElement === 'function') {
            const notif = window.createFloatingUIElement(imageSrc, {
                containerId: "videoContainer",
                left: 85,
                top: 15,
                scale: 0.2,
                fadeIn: true
            });

            Audio.currentNotification = notif;

            // Fade out after 3 seconds
            setTimeout(() => {
                if (Audio.currentNotification === notif) {
                    notif.remove();
                    Audio.currentNotification = null;
                }
            }, 3000);
        }
    }

    static skipSong() {
        console.log("Skipping song...");
        Audio.playRandomSong();
    }

    static init() {
        document.addEventListener("keydown", (e) => {
            if (e.key === "1") {
                Audio.skipSong();
            }
        });
    }
}

Audio.init();