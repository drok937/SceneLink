class Connection {
    constructor(band1, band2, strength, isDirect) {
        this.band1 = band1;         // The first band in the connection
        this.band2 = band2;         // The second band in the connection
        this.strength = strength;   // How many times they've played together
        this.isDirect = isDirect;   // Whether this is a direct (true) or secondary (false) connection
    }

    display() {
        // Code to visually represent the connection (e.g., draw a line in p5.js)
    }
}


//Data importing and printing protocol taken from here:https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON
// Loop functions for generating pairings were assisted by Chat GPT


//--------------------------------------------Import data from JSON file-------------------
async function populate() {
    try { 
        const response = await fetch('data.json'); //connect to JSON file
        const shows = await response.json();
        
        populateShows(shows);
        const allPairings = generatePairings(shows);
        const secondaryConnections = generateSecondaryConnections(allPairings);
        populatePairings(allPairings, secondaryConnections);
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


//---------------------------Modify data to work with P5---------------------------

let bands = {};
let connections = [];

//for each band that is listed in the pairings make a node
function setupDataVis(allPairings, secondaryConnections) {
    console.log("Setting up data visualization...");

    // Debug: Check if input data exists
    console.log("All Pairings:", allPairings);
    console.log("Secondary Connections:", secondaryConnections);

    for (const band in allPairings) {
        bands[band] = new BandNode(band)
        console.log(`Created BandNode: ${band}`);
    }
       // Debug: Confirm all band nodes are created
    console.log("Bands object after creation:", bands);
    //for each band go through and make a direct connection with the other bands on the bill
    for (const band in allPairings) {
        for (const otherBand in allPairings[band]) {
            connections.push(new Connection(bands[band], bands[otherBand], allPairings[band][otherband], true));
        }
    }

    //create secondary connections
    for (const band in secondaryConnections) {
        for (const otherBand in secondaryConnections[band]) {
            connections.push(new Connection(bands[band], bands[otherBand], secondaryConnections[band][partner], false));
        }
    }

}



//-----------------------------Print band pairings to webpage-------------------------------
function populatePairings(allPairings, secondaryConnections) {
    const pairingsSection = document.createElement('section');
    pairingsSection.innerHTML = "<h2>Artist Pairings</h2>";

    for (const artist in allPairings) {
        const artistHeading = document.createElement("h3");
        artistHeading.textContent = artist;

        // **DIRECT CONNECTIONS**
        const directHeader = document.createElement("h4");
        directHeader.textContent = "Direct Connections:";
        const directList = document.createElement("ul");

        for (const [otherArtist, count] of Object.entries(allPairings[artist])) {
            const listItem = document.createElement("li");
            listItem.textContent = `${otherArtist} (${count} times)`;
            directList.appendChild(listItem);
        }

        // **INDIRECT CONNECTIONS**
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
            noConnections.textContent = "❌ No secondary connections";
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
