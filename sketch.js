let bands = [];
let maxShows = 1;
let maxPConnections = 1; 
let maxSConnections = 1; 


//-----------------------Build class for each band node--------------------------------------------
class BandNode {
    constructor(name, numShows) {
        this.name = name;
        this.x = random(100, windowWidth - 50);
        this.y = random(100, windowHeight - 50);
        this.size = map(numShows, 1, 10, 10, 50);
    }
   

    drawConnections() {
        // Draw secondary connections (Red)
        if (secondaryConnections[this.name]) {
            // If it's an object (with keys representing connected bands)
            if (typeof secondaryConnections[this.name] === 'object') {
                for (let otherBand in secondaryConnections[this.name]) {
                    let otherBandNode = bands.find(b => b.name === otherBand);
                    if (otherBandNode) {
                        stroke(255, 0, 0, 50); // Red color
                        strokeWeight(map(secondaryConnections[this.name][otherBand], 1, maxSConnections, .5, 4, true)); 
                        line(this.x, this.y, otherBandNode.x, otherBandNode.y);
                    }
                }
            } else {
                console.warn(`${this.name} has an invalid connection type. Expected an object.`);
            }
        }
    
        // Draw primary connections
        for (let otherBand in allPairings[this.name]) {
            if (allPairings[this.name][otherBand] > 0) {
                let otherBandNode = bands.find(b => b.name === otherBand);
                if (otherBandNode) {
                    stroke(255, 200); // White with some transparency
                    strokeWeight(map(allPairings[this.name][otherBand], 1, maxPConnections, 1, 6, true));
                    line(this.x, this.y, otherBandNode.x, otherBandNode.y);
                }
            }
        }
    }
    
    

    display() {
        noStroke();
        fill(0, 200, 0);
        ellipse(this.x, this.y, this.size * 0.5, this.size * 0.5);

        let textSizeScaled = map(Object.keys(allPairings[this.name]).length, 1, maxShows, 10, 25);
        stroke(.50);
        textAlign(CENTER);
        fill(255);
        textSize(textSizeScaled);
        text(this.name, this.x, this.y - 15);
    }
}

//------------------------ Setup -------------------------------------------------------------------
function setupDataVis(allPairings, secondaryConnections) {
    //console.log(secondaryConnections[this.name]);

    console.log("Data visualization initialized.");
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.parent("canvas-container");

    for (let band in allPairings) {
        maxShows = max(maxShows, Object.keys(allPairings[band]).length);
    }

    // Calculate maxPConnections **before drawing**
    maxPConnections = 1;
    for (let band in allPairings) {
        for (let otherBand in allPairings[band]) {
            maxPConnections = max(maxPConnections, allPairings[band][otherBand]);
        }
    }

    maxSConnections = 1;
    for (let band in secondaryConnections) {
        for (let otherBand in secondaryConnections[band]) {
            maxSConnections = max(maxSConnections, secondaryConnections[band][otherBand]);
        }
    }

    bands = Object.keys(allPairings).map(band => new BandNode(band, Object.keys(allPairings[band]).length));


}

//------------------------ Draw -----------------------------
function draw() {
    background(0);

    // Draw connections
    for (let band of bands) {
        if (band instanceof BandNode) {
            band.drawConnections();
        }
    }

    // Draw band nodes
    for (let band of bands) {
        if (band instanceof BandNode) {
            band.display();
        }
    }
}
