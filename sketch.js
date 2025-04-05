let bands = [];

function setupDataVis(allPairings, secondaryConnections) {
    console.log("Data visualization initialized.");
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.parent("canvas-container"); // Attach canvas to the div
    // Convert the band names into an array of objects with random positions
    bands = Object.keys(allPairings).map((band, index) => {
        const numShows = Object.keys(allPairings[band]).length;
        return {
            name: band,
            x: random(100, windowWidth - 100),  // Random x position
            y: random(100, windowHeight - 100), // Random y position
            size: map(numShows, 1, 10, 10, 50) // Scale the size based on the number of shows
        };
    });

    background(0);
}

function draw() {
    background(0); // Clear the background each frame

   

    // loop function that goes through each pairing of bands
    for (let band of bands) {
        for (let otherBand in allPairings[band.name]) { //look at connected band
            if (allPairings[band.name][otherBand] > 0) { //if they have played together before do following
                let otherBandPosition = bands.find(b => b.name === otherBand); //find the band in the stored connections
                //draw the line
                stroke(255, 150);
                strokeWeight(allPairings[band.name][otherBand]);
                line(band.x, band.y, otherBandPosition.x, otherBandPosition.y);
            }
        }

    }
    fill(255); // White dots
    noStroke();
    for (let band of bands) {
        fill(0, 200, 0);
        ellipse(band.x, band.y, band.size * .5, band.size * .5); // Draw dot
        textAlign(CENTER);
        fill(255);
        textSize(12);
        text(band.name, band.x, band.y - 10); // Label the dots
       
    }
}



function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}