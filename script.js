//Data importing and printing protocol taken from here:https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON
// Loop functions for generating pairings were assisted by Chat GPT


//--------------------------------------------Import data from JSON file-------------------
async function populate() {
    try {
        const response = await fetch('data.json');
        const shows = await response.json();
        
        populateShows(shows);
        const allPairings = generatePairings(shows);
        const secondaryConnections = generateSecondaryConnections(allPairings);
        populatePairings(allPairings);
        console.log("Secondary Connections:", secondaryConnections);
    } catch (error) {
        console.error("Error loading data:", error);
    }
}
//----------------Generate a list of the lineups that are in the JSON file--------------------
function populateShows(obj) {
    const section = document.querySelector('section');
    section.innerHTML = "";
    
    const showList = obj.shows;
    for (const show of showList) {
        const showArticle = document.createElement("article");
        const venuePara = document.createElement("p");
        const lineup = document.createElement('ul');

        venuePara.textContent = `Venue: ${show.venue}`;
        
        for (const band of show.bands) {
            const listItem = document.createElement("li");
            listItem.textContent = band;
            lineup.appendChild(listItem);
        }
        
        showArticle.appendChild(venuePara);
        showArticle.appendChild(lineup);
        section.appendChild(showArticle);
    }
}
//----------------------------------Process data for direct pairings of bands----------------------------
function generatePairings(obj) {
    const showList = obj.shows;
    const allPairings = {}; 

    for (const show of showList) {
        const lineup = show.bands; 
        for (let i = 0; i < lineup.length; i++) {
            const artist = lineup[i];
            if (!allPairings[artist]) {
                allPairings[artist] = {};
            }
            for (let j = i + 1; j < lineup.length; j++) {
                const otherArtist = lineup[j];
                if (!allPairings[otherArtist]) {
                    allPairings[otherArtist] = {};
                }
                allPairings[artist][otherArtist] = (allPairings[artist][otherArtist] || 0) + 1;
                allPairings[otherArtist][artist] = (allPairings[otherArtist][artist] || 0) + 1;
            }
        }
    }
    return allPairings;
}
//-----------------------------process data for indirect pairings of bands-----------------------------
function generateSecondaryConnections(allPairings) {
    const secondaryConnections = {};
    for (const artist in allPairings) {
        if (!secondaryConnections[artist]) {
            secondaryConnections[artist] = {};
        }
        for (const directPartner in allPairings[artist]) {
            for (const secondaryPartner in allPairings[directPartner]) {
                if (secondaryPartner !== artist && !(artist in allPairings[secondaryPartner])) {
                    secondaryConnections[artist][secondaryPartner] = 
                        (secondaryConnections[artist][secondaryPartner] || 0) + 1;
                }
            }
        }
    }
    return secondaryConnections;
}

//-----------------------------Print direct band pairings to webpage-------------------------------
function populatePairings(allPairings) {
    const pairingsSection = document.createElement('section');
    pairingsSection.innerHTML = "<h2>Artist Pairings</h2>";
    
    for (const artist in allPairings) {
        const artistHeading = document.createElement("h3");
        artistHeading.textContent = artist;
        
        const artistList = document.createElement("ul");
        for (const [otherArtist, count] of Object.entries(allPairings[artist])) {
            const listItem = document.createElement("li");
            listItem.textContent = `${otherArtist} (${count} times)`;
            artistList.appendChild(listItem);
        }
        
        pairingsSection.appendChild(artistHeading);
        pairingsSection.appendChild(artistList);
    }
    
    document.body.appendChild(pairingsSection);
}

populate();
