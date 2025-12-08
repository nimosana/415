class Audio {

    static firstSong = true;

    // Original playlist
    static masterList = [
        "assets/audio/song1.mp3",
        "assets/audio/song2.mp3",
        "assets/audio/song3.mp3",
        "assets/audio/song4.mp3"
    ];

    static bgm = document.getElementById("bgm");
    // This will be filled and emptied as songs are played
    static playlist = [];
    static lastSong = "";
    // Get a random item and remove it from the list
    static getRandomSong() {
        let i = null;
        if (Audio.playlist.length === 0) {
            // refill when empty
            console.log("refilling playlist");
            Audio.playlist = [...Audio.masterList];
            i = Math.floor(Math.random() * Audio.playlist.length);
            while (Audio.playlist[i] === Audio.lastSong) {
                i = Math.floor(Math.random() * Audio.playlist.length);
                console.log("skipping duplicate song: " + playlist[i]);
            }
        } else { i = Math.floor(Math.random() * Audio.playlist.length) };
        if (Audio.firstSong) {
            i = 0;
            Audio.firstSong = false;
        }
        return Audio.playlist.splice(i, 1)[0];
    }

    static playRandomSong() {
        const next = Audio.getRandomSong();
        Audio.bgm.src = next;
        Audio.lastSong = next;
        console.log(next)
        Audio.bgm.load();
        Audio.bgm.addEventListener("canplaythrough", () => {
            Audio.bgm.play().catch(() => { });
        }, { once: true });
    }
}