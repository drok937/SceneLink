// Function to load JSON data and print band names
async function populate() {
  // Fetch the JSON data from 'data.json' file
  const response = await fetch('data.json');  // Ensure the file is in the correct directory
  const shows = await response.json();        // Parse the JSON data

  populateShows(shows);  // Populate show lineups
  const allPairings = generatePairings(shows); // Generate all band pairings
  populatePairings(allPairings);  // Populate band pairings
}

//---------------------------------Populate list of shows-------------------------------------
function populateShows(obj) {
    const section = document.querySelector('section'); //place list in the "section" of html
    const showList = obj.shows; // link show list to the json data
    const showListContainer = document.createElement('ul'); //created unordered list of the shows
    showListContainer.id = 'show-list'; // Optional: Add an ID for styling if needed
    section.appendChild(showListContainer); // Add show list to the section

    //Loop through each show to collect the data for that show-------------------------------------
    for (const show of showList) {
        const myArticle = document.createElement("article"); // Create container for each lineup
        const venuePara = document.createElement("p"); // Build paragraph container for venue name
        const lineupList = document.createElement('ul'); // Build list container for lineup

        venuePara.textContent = `Venue: ${show.venue}`; // Set value of p for venue

        const lineup = show.bands; // Get the list of bands for this show

          //Populate list of bands for each show-------------------------------------
           for (const band of lineup) {
              const listItem = document.createElement("li"); // Create new list item
              listItem.textContent = band; // Set list item's text to the name of the band
              lineupList.appendChild(listItem); // Add this list item to the bottom of the list
            }

      // Add each show into the list of shows
      const showItem = document.createElement("li"); // build list item for each show
      showItem.appendChild(venuePara); // add venue name into that item
      showItem.appendChild(lineupList); // add lineup into that item
      showListContainer.appendChild(showItem); // Append this show to the show list container
    }
}


//---------------------------------Generate Direct Pairings-------------------------------------
function generatePairings(obj) { 
    const showList = obj.shows; //create a list of every show
    const allPairings = {}; //build an empty set that will hold the pairings

    for (const show of showList) {  //for each individual show in the list of shows
        const lineup = show.bands; //build an item that holds each band that played that show
        
        for (let i = 0; i < lineup.length; i++) { //itterate through each band and perform the following actions
            const artist = lineup[i]; //perform the function on band i

            if (!allPairings[artist]) { //if the artist does not already have a sub set in the pairings list
                allPairings[artist] = {}; //then create a new set that will hold all of that artists pairings
            }

            for (let j = i + 1; j < lineup.length; j++) {  //itterate through the bands on the lineup
                const otherArtist = lineup[j]; //define other artist as each other band on the lineup

                // Ensure the otherArtist is also initialized
                if (!allPairings[otherArtist]) {  //if there is not already a subset for the other artist
                    allPairings[otherArtist] = {}; //then build a sub set for them as well
                }

                // Update both directions
                allPairings[artist][otherArtist] = (allPairings[artist][otherArtist] || 0) + 1; //if there is already a value for the pairing add 1 to it. If the pairing doesn't exist yet, set the value as 0, then add 1
                allPairings[otherArtist][artist] = (allPairings[otherArtist][artist] || 0) + 1; // do the same thing in reverse
            }
        }
    }
    return allPairings;
    
}


//---------------------------------Generate Secondary Pairings-------------------------------------

/*
function generateSecondarys (allPairings) {
    const secondaries = {};

    for (const pairing of allPairings) {

    }


}


*/


//---------------------------------Populate Pairings-------------------------------------
function populatePairings(allPairings) {
    const pairingsSection = document.createElement('section');
    pairingsSection.innerHTML = "<h2>Artist Pairings</h2>";

    for (const artist in allPairings) {
        const artistHeading = document.createElement("h3");
        artistHeading.textContent = artist;

        const artistList = document.createElement("ul");

        // Corrected: Iterate over the entries in the object
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


// Call the populate function
populate();
