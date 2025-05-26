//Data importing and printing protocol taken from here:https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON
// Loop functions for generating pairings were assisted by Chat GPT

//Data taken (with permission) from Philly-shows.org

//-------------------------- Define allPairings and secondaryConnections as global variables
let allPairings;
let secondaryConnections;
let counts = {};

async function populate() {
    try { 
        const response = await fetch('data.json');
        const data = await response.json();  // ✅ data is local here

        // ✅ Access nested structures correctly
        allPairings = data.directConnections;
        secondaryConnections = data.secondaryConnections;

        // ✅ Use countShows correctly
        counts = data.bandShowCounts;

        // ✅ Set max connection values here
        maxPConnections = data.maxPConnections || 1;
        maxSConnections = data.maxSConnections || 1;

        await waitForP5();
        setupDataVis(allPairings, secondaryConnections);

    } catch (error) {
        console.error("Error loading data:", error);
    }
}
function waitForP5() {
    return new Promise(resolve => {
        const check = () => {
            if (typeof map === "function") {
                resolve();
            } else {
                setTimeout(check, 10);
            }
        };
        check();
    });
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