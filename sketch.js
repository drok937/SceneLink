let bands = [];
let maxShows = 1;

//----------------------------------Setup-----------------------
function setupDataVis(allPairings, secondaryConnections) { //Not currently using secondary connections, add later
    console.log("Data visualization initialized.");
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.parent("canvas-container"); // Attach canvas to the div

     // Find the maximum number of shows that any one artist has played
        for (let band in allPairings) {
        maxShows = max(maxShows, Object.keys(allPairings[band]).length);
    }

    // Convert the band names into an array of objects with random positions
    bands = Object.keys(allPairings).map((band) => {
        const numShows = Object.keys(allPairings[band]).length;
        return {
            name: band,
            x: random(100, windowWidth - 50),  // Random x position
            y: random(100, windowHeight - 50), // Random y position
            size: map(numShows, 1, 10, 10, 50) // Scale the size based on the number of shows
        };
    });
}
//---------------------------------Draw---------------------------------------
function draw() {


   // Find the highest pairing count dynamically
    let maxConnections = 1; // Default minimum
    for (let band in allPairings) {
        for (let otherBand in allPairings[band]) {
        maxConnections = max(maxConnections, allPairings[band][otherBand]);
        }
    }

    background(0); // Clear the background each frame


//-----------------------------------Draw line connections-------------------------
    // loop function that goes through each pairing of bands
    for (let band of bands) {

        for (let otherBand in allPairings[band.name]) { //look at connected band
            if (allPairings[band.name][otherBand] > 0) { //if they have played together before do following
                let otherBandPosition = bands.find(b => b.name === otherBand); //find the band in the stored connections
                //draw the line
                stroke(255, 150);
                strokeWeight(map(allPairings[band.name][otherBand], 1, maxConnections, 1, 6, true)); 
                line(band.x, band.y, otherBandPosition.x, otherBandPosition.y);
            }
        }

    }

 //--------------------------------Create band nodes + labels------------------------
    fill(255); 
    noStroke();
    for (let band of bands) {
        fill(0, 200, 0);
        ellipse(band.x, band.y, band.size * .5, band.size * .5); // Draw dot

        // Dynamically scale the text size based on the number of shows
        let textSizeScaled = map(Object.keys(allPairings[band.name]).length, 1, maxShows, 10, 25); // Scale text size

        textAlign(CENTER);
        textAlign(CENTER);
        fill(255);
        textSize(textSizeScaled); 
        text(band.name, band.x, band.y - 15); // Label the dots
       
    }
}