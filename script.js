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
    const showList = obj.shows;
    const allPairings = [];

    for (const show of showList) { //do the following to each show in the list of shows
        const lineup = show.bands; //defines lineup from the json file
        
        for (let i = 0; i < lineup.length; i++) { 
            for (let j = i + 1; j < lineup.length; j++) {
               
                const sortedPair = [lineup[i], lineup[j]].sort();// Sort the two bands alphabetically 

                // Create the pairing string with the sorted bands
                const pairing = `${sortedPair[0]} & ${sortedPair[1]}`;
                
                //If the pairing already exists append with number of times
                if (!allPairings.includes(pairing)) {
                    allPairings.push(pairing); // Avoid duplicates
                } else {
                    let k = 1
                    k ++ ;
                    allPairings[i] += ` x ${k};`
               }
            }
        }
    }
    allPairings.sort();
return allPairings;
}

//---------------------------------Generate Secondary Pairings-------------------------------------

/*
function generateSecondarys (allPairings) {
    const secondaries = [];

    for (const pairing of allPairings) {

    }


}


*/


//---------------------------------Populate Pairings-------------------------------------
function populatePairings(allPairings) {
    const section = document.querySelector('section');

    //----------------------------------Create a section for all band pairings-------------------------------------
    const pairingsSection = document.createElement('ul');
    pairingsSection.id = 'pairings-section'; // Optional: Add an ID for styling if needed
    section.appendChild(pairingsSection);

    const pairingsHeader = document.createElement('h2');
    pairingsHeader.textContent = 'All Band Pairings';
    pairingsSection.appendChild(pairingsHeader);

    const pairingsList = document.createElement('ul');
    pairingsList.id = 'pairings-list'; // Optional: Add an ID for styling if needed
    pairingsSection.appendChild(pairingsList);

    //----------------------------------Add all pairings to the list-------------------------------------
    for (const pairing of allPairings) {
        const pairingItem = document.createElement("li");
        pairingItem.textContent = pairing;
        pairingsList.appendChild(pairingItem);
    }
}

// Call the populate function
populate();
