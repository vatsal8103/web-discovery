
let currentsong = new Audio();
let songs = [];
let currentSongIndex = 0;
let currfolder;

const play = document.getElementById("play");

function secondstoMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getsongs(folder) {
    currfolder = folder;
    let response = await fetch(`/${folder}/`);
    let htmlText = await response.text();
    let div = document.createElement("div");
    div.innerHTML = htmlText;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let element of as) {
        if (element.href.endsWith(".mp3")) {
            songs.push(decodeURIComponent(element.href.split(`/${folder}/`).pop()));
        }
    }

    let songul = document.querySelector(".songlist ul");
    songul.innerHTML = ""; // Clear existing list

    if (songs.length === 0) {
        songul.innerHTML = "<li>No songs found.</li>";
        return songs;
    }

    for (const song of songs) {
        let li = document.createElement("li");
        li.innerHTML = `
            <img class="invert" src="img/music.svg" alt="">
            <div class="info">
                <div>${song}</div>
                <div>Artist</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/playbtn1.svg" alt="">
            </div>`;
        songul.appendChild(li);
    }

    // Add click event to each song item
    Array.from(songul.getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", () => {
            const songName = e.querySelector(".info").firstElementChild.innerText.trim();
            playmusic(songName);
        });
    });

    return songs;
}

const playmusic = (track, pause = false) => {
    if (!track || !Array.isArray(songs)) return;

    const index = songs.indexOf(track);
    if (index === -1) return;

    currentsong.src = `/${currfolder}/` + encodeURIComponent(track);
    currentSongIndex = index;

    if (!pause) {
        currentsong.play();
        play.src = "img/pause.svg";
    } else {
        play.src = "img/playbtn1.svg";
    }

    document.querySelector(".songinfo").textContent = track;
    document.querySelector(".songtime").textContent = "00:00/00:00";
};


async function displayalbums() {
    let response = await fetch("/songs/");
    let htmlText = await response.text();
    let div = document.createElement("div");
    div.innerHTML = htmlText;
    let anchors =div.getElementsByTagName("a");
    let cardcontainer=document.querySelector(".cardcontainer");


    let array=Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs/")) {
        let folder = e.href.split("/").slice(-1)[0];
        try {
            let a = await fetch(`/songs/${folder}/info.json`);

            // Check if the file exists
            if (!a.ok) {
                throw new Error(`info.json not found in ${folder}`);
            }

            let json = await a.json();
            console.log(json);

            cardcontainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <img src="img/play.svg" alt="Play">
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="${json.title}">
                    <h2>${json.title}</h2>
                    <p>${json.description}</p>
                </div>`;
        } catch (err) {
            console.warn(`Skipping folder "${folder}":`, err.message);
        }
    }
}}

    document.querySelector(".cardcontainer").addEventListener("click", async (e) => {
    const card = e.target.closest(".card");
    if (!card) return;

    const folder = card.dataset.folder;
    const loadedSongs = await getsongs(`songs/${folder}`);
    if (loadedSongs.length > 0) {
        playmusic(loadedSongs[0]);
    }
});
async function main() {
    await getsongs("songs/ncs");
    playmusic(songs[0], true); // preload first song

    //display all the albums on the page ]\
    displayalbums();


    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/pause.svg";
        } else {
            currentsong.pause();
            play.src = "img/playbtn1.svg";
        }
    });

    currentsong.addEventListener("timeupdate", () => {
        if (!isNaN(currentsong.duration)) {
            document.querySelector(".songtime").textContent =
                `${secondstoMinutes(currentsong.currentTime)}/${secondstoMinutes(currentsong.duration)}`;
            document.querySelector(".circle").style.left =
                `${(currentsong.currentTime / currentsong.duration) * 100}%`;
        }
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        const seekbar = e.currentTarget;
        const rect = seekbar.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const percentage = offsetX / seekbar.offsetWidth;
        currentsong.currentTime = percentage * currentsong.duration;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    document.getElementById("previous").addEventListener("click", () => {
        if (currentSongIndex > 0) {
            playmusic(songs[currentSongIndex - 1]);
        }
    });

    document.getElementById("next").addEventListener("click", () => {
        if (currentSongIndex < songs.length - 1) {
            playmusic(songs[currentSongIndex + 1]);
        }
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
    });

    

    // Optional: autoplay next song when current ends
    currentsong.addEventListener("ended", () => {
        if (currentSongIndex < songs.length - 1) {
            playmusic(songs[currentSongIndex + 1]);
        }
    });

    //add event listener to nute the track 
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        console.log(e.target)
        console.log("changing",e.target.src)

        if (e.target.src.includes ("img/volume.svg")){

            e.target.src=e.target.src.replace =("img/volume.svg","img/mute.svg")
            currentsong.volume=0;
        }
        else{
           e.target.src=e.target.src.replace =("img/mute.svg","img/volume.svg")
            currentsong.volume= .10;
    }
});
// Select the volume slider and volume icon
const volumeSlider = document.querySelector(".range input");
const volumeIcon = document.querySelector(".volume > img");

// Add an event listener to handle volume changes
volumeSlider.addEventListener("input", (e) => {
    const volume = parseInt(e.target.value) / 100; // Convert slider value (0-100) to audio volume (0-1)
    currentsong.volume = volume;

    // Change the icon based on the volume
    if (volume === 0) {
        volumeIcon.src = volumeIcon.src.replace("img/volume.svg", "img/mute.svg");
    } else {
        volumeIcon.src = volumeIcon.src.replace("img/mute.svg", "img/volume.svg");
    }
});
}
main();