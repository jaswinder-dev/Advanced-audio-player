/**IMPORTS *************************************************************************/
import audios from "./playList.js";  //audios
import vertexShader from "../shaders/vertex.js";  //vertex shader
import fragmentShader from "../shaders/fragment.js";  //fragment shader

/**MAKING REQUIRED VARIABLES ***************************************************** */
const visualiser = document.querySelector("#visualiser");  //audio visualiser
let likedTracks = {};  //storing liked tracks (if any)
let isPaused = true;  //for pause/resume the visualiser animation
let totalAudioDuration = 0;  //totad duration of the current track (for calculations)
let currentTrack = 0;  //index of the currently loaded audio 
const dimensions = {  //for size control for the visualiser
    width: visualiser.clientWidth,
    height: visualiser.clientHeight
};

/**GETTING REQUIRED ELEMENTS ***************************************************** */
const audio = document.querySelector("#audio");
const settings = document.querySelector("#settings");
//three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, dimensions.width / dimensions.height, 0.1, 1000);
camera.position.set(-0.1, 3, -3.1);
const clock = new THREE.Clock();
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(dimensions.width, dimensions.height);
visualiser.appendChild(renderer.domElement);
const orbit = new THREE.OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
//for audio frequency
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
const source = audioContext.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioContext.destination);
analyser.fftSize = 32;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

// UI ****************
//description
const audioName = document.querySelector("#audioName");
const artistName = document.querySelector("#artistName");
//progreess
const progressBar = document.querySelector("#progressBar");
const progressIndicator = progressBar.querySelector("#progressIndicator");
const currentTimeTimer = document.querySelector("#currentTime");
const totalDurationTimer = document.querySelector("#totalDuration");
//controls
const controls = document.querySelector(".controls");
const modeBtn = controls.querySelector("#modeBtn");
const modeBtnIcon = modeBtn.querySelector("i");
const playPauseBtn = controls.querySelector("#playPauseBtn");
const playPauseBtnIcon = playPauseBtn.querySelector("i");
const prevBtn = controls.querySelector("#prevBtn");
const nextBtn = controls.querySelector("#nextBtn");
const likeAudio = controls.querySelector("#likeAudio");
const likeAudioIcon = likeAudio.querySelector("i");
const listShowBtn = controls.querySelector("#listShow");
//playlist
const playlist = document.querySelector("#playlist");
const audioList = playlist.querySelector("#audioList");
const listHideBtn = playlist.querySelector("#listHideBtn");
//settings
const openSettingBtn = controls.querySelector("#openSettingBtn");
const closeSettingBtn = document.querySelector("#closeSettingBtn");
const volumeSlider = document.querySelector("#volumeSlider");
const frequencySlider = document.querySelector("#frequencySlider");
const vloumeSelector = document.querySelector("#volumeSelector");
const frequencySelector = document.querySelector("#frequencySelector");
const themes = document.querySelectorAll("article .theme");
//objects (three.js)
const sphereGeometry = new THREE.SphereGeometry(2, 30, 30);
const sphereMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
        u_time: { type: "f", value: 0.0 },
        u_frequency: { type: "f", value: 0.0 }
    }
});
const count = sphereGeometry.attributes.position.count;
const newAttrArray = new Float32Array(count);
for (let i = 0; i < count; i++) {
    newAttrArray[i] = i % 2;
}
sphereGeometry.setAttribute("a_modulus", new THREE.BufferAttribute(newAttrArray, 1));
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

/** REQUIRED METHODS ***************************************************************/
//getting updated frequencies
const updateFrequencyData = () => {
    analyser.getByteFrequencyData(dataArray);
    const frequencyValues = Array.from(dataArray);
    const sum = frequencyValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    return (sum / 16);  //return average frequency
}

//making proper time format for timers
const getTimeFormat = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

//load audio
const loadAudio = () => {
    likedTracks = JSON.parse(localStorage.getItem("liked")) || {};
    const currentAudio = audios[currentTrack];
    audio.src = `./src/assets/${currentAudio.name}`;
    audioName.innerHTML = currentAudio.name;
    artistName.innerHTML = currentAudio.artist;
    if (likedTracks[currentTrack]) { //if current track is one of the liked tracks
        likeAudioIcon.classList.add("fa-solid");
        likeAudioIcon.classList.remove("fa-regular");
    } else {
        likeAudioIcon.classList.remove("fa-solid");
        likeAudioIcon.classList.add("fa-regular");
    }
};

//play audio
const playAudio = () => {
    likedTracks = JSON.parse(localStorage.getItem("liked")) || {};
    audio.play();
    isPaused = false;
    playPauseBtnIcon.classList.add("fa-pause");
    playPauseBtnIcon.classList.remove("fa-play");
    const listItems = audioList.querySelectorAll("li");
    listItems.forEach(item => {
        if (parseInt(item.id) === currentTrack) { //current track
            const animatedArea = item.querySelector(".animatedArea");
            animatedArea.classList.remove("d-none");
            animatedArea.classList.add("d-flex");
            const deAnimatedArea = item.querySelector(".deAnimatedArea");
            deAnimatedArea.classList.add("d-none");
            const heart1 = animatedArea.querySelector("i");
            if (!likedTracks[item.id]) {  //if track is one of the liked tracks
                heart1.classList.add("d-none");
            } else {
                heart1.classList.remove("d-none");
            }
            const animatedBars = animatedArea.querySelectorAll(".bar");
            animatedBars.forEach(bar => bar.style.animationPlayState = "running");
        } else {
            const animatedArea = item.querySelector(".animatedArea");
            animatedArea.classList.add("d-none");
            animatedArea.classList.remove("d-flex");
            const deAnimatedArea = item.querySelector(".deAnimatedArea");
            deAnimatedArea.classList.remove("d-none");
            deAnimatedArea.classList.add("d-flex");
            const heart2 = deAnimatedArea.querySelector("i");
            if (!likedTracks[item.id]) {  //if track is one of the liked tracks
                heart2.classList.add("d-none");
            } else {
                heart2.classList.remove("d-none");
            }
        }
    });
};

//pause audio
const pauseAudio = () => {
    audio.pause();
    isPaused = true;
    playPauseBtnIcon.classList.add("fa-play");
    playPauseBtnIcon.classList.remove("fa-pause");
    const currentlyPlayingAudio = document.getElementById(`${currentTrack}`);
    const animatedBars = currentlyPlayingAudio.querySelectorAll(".bar");
    animatedBars.forEach(bar => bar.style.animationPlayState = "paused");
};

//play previous audio
const playPrevAudio = () => {
    currentTrack = (currentTrack > 0) ? currentTrack - 1 : audios.length - 1;
    loadAudio();
    playAudio();
};

//play next audio
const playNextAudio = () => {
    currentTrack = (currentTrack < audios.length - 1) ? currentTrack + 1 : 0;
    loadAudio();
    playAudio();
};

//play by clicking the playlist
const playThis = (id) => {
    currentTrack = id;
    loadAudio();
    playAudio();
};

//update progress bar
const updateProgressBar = (currentTime) => {
    progressIndicator.style.width = `${(currentTime / totalAudioDuration) * 100}%`;
};

//load audios to playlist
const loadPlaylist = () => {
    audios.forEach((audio, index) => {
        const aud = new Audio(`./src/assets/${audio.name}`);
        aud.addEventListener('loadedmetadata', () => {

            //creating elements
            const li = document.createElement("li");
            li.className = 'd-flex justify-content-between align-items-center p-1';
            li.id = index;
            li.addEventListener('click', () => playThis(index));

            const description = document.createElement("div");
            description.className = "description";

            const audioName = document.createElement("p");
            audioName.className = "listAudioName m-0 p-0";
            const audioArtist = document.createElement("p");
            audioArtist.className = "listArtistName m-0 p-0";

            const animatedArea = document.createElement("div");
            animatedArea.className = "animatedArea justify-content-between align-items-center";
            const heart1 = document.createElement("i");
            heart1.className = "fa-solid fa-heart mx-2";
            const playAnimation = document.createElement("div");
            playAnimation.className = "playAnimation d-flex justify-content-between align-items-end";
            const bar = document.createElement("div");
            bar.className = "bar";

            const deAnimatedArea = document.createElement("div");
            deAnimatedArea.className = "deAnimatedArea justify-content-between align-items-center";
            const heart2 = document.createElement("i");
            heart2.className = "fa-solid fa-heart mx-2";
            const Duration = document.createElement("p");
            Duration.className = "Duration m-0 p-0";
            const span = document.createElement("span");

            //set values to elements
            audioName.innerHTML = audio.name;
            audioArtist.innerHTML = audio.artist;

            span.innerHTML = getTimeFormat(aud.duration);

            if (index === currentTrack) {
                animatedArea.classList.add("d-flex");
                playAnimation.classList.add("d-flex");
                deAnimatedArea.classList.add("d-none");
                totalAudioDuration = aud.duration;
                totalDurationTimer.innerHTML = getTimeFormat(totalAudioDuration);
            } else {
                animatedArea.classList.add("d-none");
                deAnimatedArea.classList.add("d-flex");
            }
            if (!likedTracks[index]) {
                heart1.classList.add("d-none");
                heart2.classList.add("d-none");
            }

            //append elements
            Duration.appendChild(span);

            deAnimatedArea.appendChild(heart2);
            deAnimatedArea.appendChild(Duration);

            for (let j = 0; j < 3; j++) {
                const clone = bar.cloneNode(true);
                playAnimation.appendChild(clone);
            }

            animatedArea.appendChild(heart1);
            animatedArea.appendChild(playAnimation);

            description.appendChild(audioName);
            description.appendChild(audioArtist);

            li.appendChild(description);
            li.appendChild(animatedArea);
            li.appendChild(deAnimatedArea);

            audioList.appendChild(li);
        });
    });
};

//rendering audio visualiser (three.js)
const animate = () => {
    orbit.update();
    renderer.render(scene, camera);
    if (!isPaused) {
        sphereMaterial.uniforms.u_time.value = clock.getElapsedTime();
        sphereMaterial.uniforms.u_frequency.value = updateFrequencyData();
    }
    sphere.rotation.y += 0.01;
};

/**EVENTS **************************************************************************/
//play-pause 
playPauseBtn.addEventListener("click", () => {
    if (isPaused) {
        playAudio();
    } else {
        pauseAudio();
    }
});

//play-previous audio
prevBtn.addEventListener("click", () => {
    playPrevAudio();
});

//play-next audio
nextBtn.addEventListener("click", () => {
    playNextAudio();
});

//change play mode
modeBtn.addEventListener("click", function () {
    const currentMode = this.getAttribute("title");
    switch (currentMode) {
        case "Shuffle":
            this.title = "List looped";
            modeBtnIcon.removeAttribute("class");
            modeBtnIcon.setAttribute("class", "fa-solid fa-arrows-rotate");
            break;
        case "List looped":
            this.title = "Replay";
            modeBtnIcon.removeAttribute("class");
            modeBtnIcon.setAttribute("class", "fa-solid fa-arrow-rotate-right");
            break;
        case "Replay":
            this.title = "Shuffle";
            modeBtnIcon.removeAttribute("class");
            modeBtnIcon.setAttribute("class", "fa-solid fa-shuffle");
    }
});

//show playlist
listShowBtn.addEventListener("click", () => {
    playlist.style.top = 0;
});

//hide playlist
listHideBtn.addEventListener("click", () => {
    playlist.style.top = "100%";
});

//like-unlike audio
likeAudio.addEventListener("click", function () {
    const audioToConsider = audios[currentTrack];
    let likedAudios = JSON.parse(localStorage.getItem("liked")) || {};
    const liToConsider = document.getElementById(`${audioToConsider.id}`);
    const hearts = liToConsider.querySelectorAll("i");
    if (likeAudioIcon.classList.contains("fa-solid")) { //if unliked
        likeAudioIcon.classList.remove("fa-solid");
        likeAudioIcon.classList.add("fa-regular");
        delete likedAudios[audioToConsider.id];
        hearts.forEach(heart => {
            heart.classList.add("d-none");
        });
    } else {  //if liked
        likeAudioIcon.classList.add("fa-solid");
        likeAudioIcon.classList.remove("fa-regular");
        likedAudios[audioToConsider.id] = audioToConsider.name;
        hearts.forEach(heart => {
            heart.classList.remove("d-none");
        });
    }
    if (likedAudios) {
        localStorage.setItem("liked", JSON.stringify(likedAudios));
    }
});

//show settings
openSettingBtn.addEventListener("click", () => {
    settings.style.top = "0";
});

//hide settings
closeSettingBtn.addEventListener("click", () => {
    settings.style.top = "100%";
});

//update duration by clicking progress bar
progressBar.addEventListener("click", function (e) {
    const percentage = e.offsetX / this.offsetWidth;
    const updatedAudiotime = percentage * totalAudioDuration;
    audio.currentTime = updatedAudiotime;
    updateProgressBar(updatedAudiotime);
    playAudio();
});

//update volume from slider
volumeSlider.addEventListener("input", function () {
    vloumeSelector.style.width = `${this.value}%`;
    audio.volume = this.value / 100;
});

//update frequency from slider
frequencySlider.addEventListener("input", function () {
    frequencySelector.style.width = `${this.value / 2}%`;
    audio.playbackRate = this.value / 100;
});

//change theme
themes.forEach(theme => {
    theme.addEventListener("click", function () {
        let body = document.body;
        body.removeAttribute("id");
        body.setAttribute("id", this.classList[1]);
        settings.style.top = "100%";
    });
});

//get current time of audio for updating progress bar
audio.addEventListener("timeupdate", () => {
    currentTimeTimer.innerHTML = getTimeFormat(audio.currentTime);
    updateProgressBar(audio.currentTime);
});

//decide what to do after the audio finished playing
audio.addEventListener("ended", () => {
    const currentMode = modeBtn.getAttribute("title");
    switch (currentMode) {
        case "Shuffle":
            let randomIndex = 0;
            do {
                randomIndex = Math.floor(Math.random() * audios.length);
            } while (randomIndex === currentTrack);
            currentTrack = randomIndex;
            loadAudio();
            playAudio();
            break;
        case "List looped":
            currentTrack = (currentTrack < audios.length - 1) ? currentTrack + 1 : 0;
            loadAudio();
            playAudio();
            break;
        case "Replay":
            audio.currentTime = 0;
            playAudio();
    }
});

/**WINDOW RESIZE ****************************************************************** */
window.addEventListener("resize", () => {
    dimensions.width = visualiser.clientWidth;
    dimensions.height = visualiser.clientHeight;
    camera.aspect = dimensions.width / dimensions.height;
    camera.updateProjectionMatrix();
    renderer.setSize(dimensions.width, dimensions.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**UPON PAGE LOAD ***************************************************************** */
//load playlist
loadPlaylist();

//load first audio
loadAudio();

//start rendering the musix visualiser (three.js)
renderer.setAnimationLoop(animate);

