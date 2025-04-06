
//Data importing and printing protocol taken from here:https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON
// Loop functions for generating pairings were assisted by Chat GPT

//-------------------------- Define allPairings and secondaryConnections as global variables
let allPairings;
let secondaryConnections;

//--------------------------------------------Import data from JSON file-------------------
async function populate() {
    try { 
        const response = await fetch('data.json'); //connect to JSON file
        const shows = await response.json();
        
        populateShows(shows);
        allPairings = generatePairings(shows);
        secondaryConnections = generateSecondaryConnections(allPairings);
        populatePairings(allPairings, secondaryConnections);

        // Call setupDataVis() once data is ready
        if (typeof setupDataVis !== "undefined") {
            setupDataVis(allPairings, secondaryConnections);
        } else {
            console.error("setupDataVis is not defined yet!");
        }

    } catch (error) {
        console.error("Error loading data:", error);
    }
}
//----------------Generate a list of the lineups that are in the JSON file--------------------
function populateShows(obj) { 
    const section = document.querySelector('section');//navigate to existing HTML section
    section.innerHTML = "";
    
    const concertList = obj.shows;
    for (const show of concertList) { //cycle through all of the shows in the list of shows and add the following text
        const showSection = document.createElement("article"); //the container that the shows are printed into
        const venueName = document.createElement("p"); //venue name
        const lineup = document.createElement('ul'); //show lineup

        venueName.textContent = `Venue: ${show.venue}`;
        
        for (const band of show.bands) { //in each show cycle through the bands to create lineup
            const artistName = document.createElement("li");
            artistName.textContent = band;
            lineup.appendChild(artistName);
        }
        
        showSection.appendChild(venueName);
        showSection.appendChild(lineup);
        section.appendChild(showSection);
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




//-----------------------------Print band pairings to webpage-------------------------------
function populatePairings(allPairings, secondaryConnections) {
    const pairingsSection = document.createElement('section');
    pairingsSection.innerHTML = "<h2>Artist Pairings</h2>";

    for (const artist in allPairings) {
        const artistHeading = document.createElement("h3");
        artistHeading.textContent = artist;

        // DIRECT CONNECTIONS
        const directHeader = document.createElement("h4");
        directHeader.textContent = "Direct Connections:";
        const directList = document.createElement("ul");

        for (const [otherArtist, count] of Object.entries(allPairings[artist])) {
            const listItem = document.createElement("li");
            listItem.textContent = `${otherArtist} (${count} times)`;
            directList.appendChild(listItem);
        }

        // INDIRECT CONNECTIONS
        const indirectHeader = document.createElement("h4");
        indirectHeader.textContent = "Indirect Connections:";
        const indirectList = document.createElement("ul");

        if (secondaryConnections && secondaryConnections[artist] && Object.keys(secondaryConnections[artist]).length > 0) {
            for (const [otherArtist, count] of Object.entries(secondaryConnections[artist])) {
                const listItem = document.createElement("li");
                listItem.textContent = `${otherArtist} (${count} times)`;
                indirectList.appendChild(listItem);
            }
        } else {
            const noConnections = document.createElement("li");
            noConnections.textContent = "No secondary connections";
            indirectList.appendChild(noConnections);
        }

        // Append everything
        pairingsSection.appendChild(artistHeading);
        pairingsSection.appendChild(directHeader);
        pairingsSection.appendChild(directList);
        pairingsSection.appendChild(indirectHeader);
        pairingsSection.appendChild(indirectList);
    }

    document.body.appendChild(pairingsSection);
}





populate();
