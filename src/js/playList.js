// Add "audio name" and "artist name" manually

let counter = 0;
const getId = () => {
    const c = counter;
    counter++;
    return c;
};

export default [
    {
        id: getId(),
        name: "Anywhere.mp3",
        artist: "Ikson"
    },
    {
        id: getId(),
        name: "Travel Celebration.mp3",
        artist: "Waesto"
    },
    {
        id: getId(),
        name: "Follow The Sun.mp3",
        artist: " Luke Bergs & Waesto"
    },
    {
        id: getId(),
        name: "Travel.mp3",
        artist: "G Korb"
    },
    {
        id: getId(),
        name: "Vlog.mp3",
        artist: "G Korb"
    },
    {
        id: getId(),
        name: "Upbeat and Happy Pop.mp3",
        artist: "MorningLightMusic"
    },
];