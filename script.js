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
      

        }
      }
 
      populate();
    
      

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
        }
      });
    
      // Print all unique band names to the console
      console.log("Band Names:");
      bandNames.forEach(band => console.log(band));
  

  
  // Call the function to load data and print band names
  loadAndPrintBandNames();
  
    */
