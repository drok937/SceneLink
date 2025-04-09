class BandNode {
    constructor(name, numShows) {
        this.name = name;
        this.x = random(100, windowWidth - 50),  // Random x position
        this.y = random(100, windowHeight - 50), // Random y position
        this.size = map(numShows, 1, 10, 10, 50) // Scale the size based on the number of shows
    }
//-----------------------------------Draw line connections-------------------------
    // loop function that goes through each pairing of bands
    drawConnections() {
        for (let otherBand in allPairings[this.name]) { //look at connected band
            if (allPairings[this.name][otherBand] > 0) { //if they have played together before do following
                let otherBandNode = bands.find(b => b.name === otherBand); //find the band in the stored connections
                //draw the line
                stroke(255, 150);
                strokeWeight(map(allPairings[this.name][otherBand], 1, maxConnections, 1, 6, true)); 
                line(this.x, this.y, otherBandNode.x, otherBandNode.y);
            }
        }

    }

     //--------------------------------Create band nodes + labels------------------------
     
     display() {
        fill(0, 200, 0); 
        noStroke();
        ellipse(this.x, this.y, this.size * .5, this.size * .5); // Draw dot
 
         // Dynamically scale the text size based on the number of shows
         let textSizeScaled = map(Object.keys(allPairings[this.name]).length, 1, maxShows, 10, 25); // Scale text size
 
         textAlign(CENTER);
         fill(255);
         textSize(textSizeScaled); 
         text(this.name, this.x, this.y - 15); // Label the dots
        
     }
 }


// Export the class
export default BandNode;