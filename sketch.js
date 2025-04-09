let bands = [];
let maxShows = 1;
let maxConnections = 1; // Move maxConnections to global scope

class BandNode {
    constructor(name, numShows) {
        this.name = name;
        this.x = random(100, windowWidth - 50);
        this.y = random(100, windowHeight - 50);
        this.size = map(numShows, 1, 10, 10, 50);
    }

    drawConnections() {
        for (let otherBand in allPairings[this.name]) {
            if (allPairings[this.name][otherBand] > 0) {
                let otherBandNode = bands.find(b => b.name === otherBand);
                if (otherBandNode) {
                    stroke(255, 150);
                    strokeWeight(map(allPairings[this.name][otherBand], 1, maxConnections, 1, 6, true));
                    line(this.x, this.y, otherBandNode.x, otherBandNode.y);
                }
            }
        }
    }

    display() {
        fill(0, 200, 0);
        ellipse(this.x, this.y, this.size * 0.5, this.size * 0.5);

        let textSizeScaled = map(Object.keys(allPairings[this.name]).length, 1, maxShows, 10, 25);
        textAlign(CENTER);
        fill(255);
        textSize(textSizeScaled);
        text(this.name, this.x, this.y - 15);
    }
}

//------------------------ Setup -----------------------------
function setupDataVis(allPairings, secondaryConnections) {
    console.log("Data visualization initialized.");
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.parent("canvas-container");

    for (let band in allPairings) {
        maxShows = max(maxShows, Object.keys(allPairings[band]).length);
    }

    // Calculate maxConnections **before drawing**
    maxConnections = 1;
    for (let band in allPairings) {
        for (let otherBand in allPairings[band]) {
            maxConnections = max(maxConnections, allPairings[band][otherBand]);
        }
    }

    bands = Object.keys(allPairings).map(band => new BandNode(band, Object.keys(allPairings[band]).length));

    console.log(bands);
    console.log(bands[0] instanceof BandNode); // Should return true
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
