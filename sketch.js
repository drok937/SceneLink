
let bandNames = []; // Store band names




function setup(allPairings,secondaryConnections) {
    let cnv = createCanvas(800, 600);
    cnv.parent("canvas-container"); // Attach canvas to the div
    background(220);
       // Example: draw a circle for each band
       for (const band in allPairings) {
        bandNames.push(band); // Just store the band name
    
    }
}


let bands = [];

function setupDataVis(allPairings, secondaryConnections) {
    console.log("Data visualization initialized.");
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.parent("canvas-container"); // Attach canvas to the div
    // Convert the band names into an array of objects with random positions
    bands = Object.keys(allPairings).map((band, index) => ({
        name: band,
        x: random(100, windowWidth - 100),  // Random x position
        y: random(100, windowHeight - 100), // Random y position
    }));

    background(0);
}

function draw() {
    background(0); // Clear the background each frame

    fill(255); // White dots
    noStroke();

    // Draw a dot for each band
    for (let band of bands) {
        ellipse(band.x, band.y, 10, 10); // Draw dot
        textAlign(CENTER);
        fill(255);
        textSize(12);
        text(band.name, band.x, band.y - 10); // Label the dots
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}