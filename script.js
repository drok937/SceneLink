// Function to load JSON data and print band names
async function populate() {
      // Fetch the JSON data from 'data.json' file
      const response = await fetch('data.json');  // Make sure the file is in the same directory
      const shows = await response.json();         // Parse the JSON data

      populateShows(shows);
}
function populateShows(obj) {
    const section = document.querySelector('section');
    const showList = obj.shows;

    for (const show of showList) {
      const myArticle = document.createElement("article");
      const myPara1 = document.createElement("p");
      const myList = document.createElement('ul');

     
      myPara1.textContent = `Venue: ${show.venue}`;

      const lineup = show.bands;
          for (const band of lineup) {
          const listItem = document.createElement("li");
          listItem.textContent = band;
          myList.appendChild(listItem);
          }
      myArticle.appendChild(myPara1);
      myArticle.appendChild(myList);

      section.appendChild(myArticle);
      

<<<<<<< Updated upstream
=======
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
>>>>>>> Stashed changes
        }
      }
 
      populate();
    
      

<<<<<<< Updated upstream
    /*
    // Create a set to store unique band names
      const bandNames = new Set();
  
      // Loop through each show
      data.forEach(show => {
        // Loop through band properties (Band 1, Band 2, etc.)
        for (let i = 1; i <= 7; i++) {
          const bandName = show[`Band ${i}`];  // Access each band field
          if (bandName) {
            bandNames.add(bandName);  // Add to the set (ensures uniqueness)
          }
=======

//---------------------------------Generate Secondary Pairings-------------------------------------

function generateSecondaryConnections(allPairings) {
    const secondaryConnections = {}; // Store secondary pairings

    for (const artist in allPairings) {
        // Create an entry for the artist if it doesn't exist
        if (!secondaryConnections[artist]) {
            secondaryConnections[artist] = {};
        }

        // Loop through all direct pairings for the artist
        for (const directPartner in allPairings[artist]) {
            // Loop through the direct partner's pairings to find secondary connections
            for (const secondaryPartner in allPairings[directPartner]) {
                // Prevent self-connection (e.g., A → B → A is not a valid secondary connection)
                if (secondaryPartner !== artist && !(artist in allPairings[secondaryPartner])) {
                    // Count secondary connections
                    secondaryConnections[artist][secondaryPartner] = 
                        (secondaryConnections[artist][secondaryPartner] || 0) + 1;
                }
              
            }
            
        }
    }
 
    return secondaryConnections;
  
}


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
>>>>>>> Stashed changes
        }
      });
    
      // Print all unique band names to the console
      console.log("Band Names:");
      bandNames.forEach(band => console.log(band));
  

  
  // Call the function to load data and print band names
  loadAndPrintBandNames();
  
    */
