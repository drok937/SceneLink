//Data importing and printing protocol taken from here:https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON
// Loop functions for generating pairings were assisted by Chat GPT

//-------------------------- Define allPairings and secondaryConnections as global variables
let allPairings;
let secondaryConnections;
let counts = {};

//--------------------------------------------Import data from JSON file-------------------
async function populate() {
    try { 
        const response = await fetch('data.json'); // connect to JSON file
        const shows = await response.json();

        const uniqueShows = [];
        const seen = new Set();

        // Filter duplicates
        shows.shows.forEach(show => {
         if (!show.date || !Array.isArray(show.bands)) return; // basic sanity check

         // Build a unique key based on date and sorted band lineup
        const key = `${show.date}::${show.bands.slice().sort().join(',')}`;

             if (!seen.has(key)) {
             seen.add(key);
            uniqueShows.push(show);
            }
        });
        // Count shows per band and store globally
        counts = countShowsForAllBands(shows);

        function countShowsForAllBands(data) {
            const counts = {};
            data.shows.forEach(show => {
                // Check if show.bands is an array before calling .forEach
                if (Array.isArray(show.bands)) {
                    show.bands.forEach(band => {
                        if (!counts[band]) {
                            counts[band] = 0;
                        }
                        counts[band]++;
                    });
                } else {
                    console.warn('show.bands is not an array:', show.bands);
                }
            });
            return counts;
        }
        allPairings = generatePairings(shows);
        secondaryConnections = generateSecondaryConnections(allPairings);

        // 🟡 Wait until p5 is fully ready before calling BandNode (which uses `map`)
        const waitForP5 = () => new Promise(resolve => {
            const check = () => {
                if (isP5Ready && typeof map === "function") {
                    resolve();
                } else {
                    setTimeout(check, 10);
                }
            };
            check();
        });

        await waitForP5();
        setupDataVis(allPairings, secondaryConnections);

    } catch (error) {
        console.error("Error loading data:", error);
    }
}

//----------------------------------Process data for direct pairings of bands----------------------------
function generatePairings(obj) { //show which artists have played with which other artists how many times
    const concertList = obj.shows;
    const allPairings = {};  //create new set that will hold the pairings

    for (const show of concertList) { //go through each show and add a set to hold their connections
        const lineup = show.bands; 
        for (let i = 0; i < lineup.length; i++) {
            const artist = lineup[i];
            if (!allPairings[artist]) { //if the artist does not already have a subset to hold their connections create one
                allPairings[artist] = {};
            }
            for (let j = i + 1; j < lineup.length; j++) { //go through the other artists on the bill and connect the artists one at a time
                const otherArtist = lineup[j];
                if (!allPairings[otherArtist]) {
                    allPairings[otherArtist] = {};
                }
                allPairings[artist][otherArtist] = (allPairings[artist][otherArtist] || 0) + 1; //add the connection
                allPairings[otherArtist][artist] = (allPairings[otherArtist][artist] || 0) + 1; //reverse connection so band A connects to B and B to A
            }
        }
    }
    return allPairings;
}

//populate()

//-----------------------------process data for indirect pairings of bands-----------------------------
//this will show when two artists have both shared a bill with the same artist. Works same way as "generate pairings"
function generateSecondaryConnections(allPairings) {
    const secondaryConnections = {}; //new set to hold secondaries
    for (const artist in allPairings) { //go through each artist in the direct pairings
        if (!secondaryConnections[artist]) { //build a subset if one doesn't exist for this artist
            secondaryConnections[artist] = {};
        }
        for (const directPartner in allPairings[artist]) { ////direct partner is an artist that the artist has shared a bill with.
            for (const secondaryPartner in allPairings[directPartner]) { //go through all of the direct pairings for each artist
                if (secondaryPartner !== artist //presents self pairing
                    && !(artist in allPairings[secondaryPartner])) { //might not keep this condition. Elminates repeats of secondary and primary connections but I might actually want the repetition
                    secondaryConnections[artist][secondaryPartner] = //creates connection
                        (secondaryConnections[artist][secondaryPartner] || 0) + 1; //adds the tally
                }
            }
        }
    }
    return secondaryConnections;
}



// ---------------------- POPUP FUNCTIONS ----------------------
function getTopConnections(bandName, topN = 10) {
    let connections = [];

    for (let otherName in allPairings[bandName]) {
        if (otherName === bandName) continue;

        let primaryStrength = (allPairings[bandName]?.[otherName] || 0) / 2;
        let secondaryStrength = (secondaryConnections[bandName]?.[otherName] || 0) / 3;
        let connectionStrength = primaryStrength + secondaryStrength;

        connections.push({ name: otherName, strength: connectionStrength });
    }

    // Sort by connection strength descending
    connections.sort((a, b) => b.strength - a.strength);

    // Return top N
    return connections.slice(0, topN);
}

function showPopup(bandName) {
    let popup = document.getElementById("popup");
    let popupContent = document.getElementById("popup-content");

    if (!popupContent) {
        console.error("Popup content element not found!");
        return;
    }

    // Get the top 10 strongest connections using your combined metric
    let topConnections = getTopConnections(bandName, 10); // <-- uses your helper function

    let topConnectionsList = topConnections.length > 0
        ? topConnections.map(conn => `<li>${conn.name} </li>`).join("")
        : "<li>No strong connections</li>";

    
   // Inject the content into the popup
   popupContent.innerHTML = `
   <h2>${bandName}</h2>
   <p>Show Count: ${counts[bandName] || 0}</p>
   <div class="connections-container">
       <div class="connections-list">
           <h3>Top Connections:</h3>
           <ul>${topConnectionsList}</ul>
       </div>
   </div>
`;

popup.style.display = "block";
}

function closePopup() {
    let popup = document.getElementById("popup");
    popup.style.display = "none";
}

// Close the popup when clicking outside
window.onclick = function(event) {
    let popup = document.getElementById("popup");
    let popupBox = document.querySelector(".popup-box");

    // If the click is outside the popup-box but inside the popup, close it
    if (event.target === popup) {
        closePopup();
    }
};