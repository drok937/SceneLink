let bands = [];
let maxShows = 1;
let maxPConnections = 1; 
let maxSConnections = 1; 
let selectedBand = null; // Track the selected band


let settleFrames = 800;  // Number of frames before movement stops
let currentFrame = 0;    // Counter for frames



//-----------------------Build class for each band node--------------------------------------------
class BandNode {
    
    constructor(name, numShows) {
        let padding = 100; // Ensures nodes don't get too close to the edges
        this.name = name;
        this.size = map(numShows, 1, 10, 10, 50);

        this.x = random(padding, windowWidth - padding);
        this.y = random(padding, windowHeight - padding);
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
    
    applyForces() {
        let forceX = 0;
        let forceY = 0;
        
        let baseAttractionStrength = .08;  // Base attraction strength
        let baseRepulsionStrength = 800;    // Base repulsion strength 
        let minDistance = 200;               // Minimum distance before repulsion kicks in
        let spreadStrength = 0.001;         // Outward spread force to prevent central clustering
        let bufferDistance = 200000            //buffer around each node

        for (let otherBand of bands) {
            if (otherBand === this) continue; // Skip self
            //calculate distance between nodes
            let dx = otherBand.x - this.x;
            let dy = otherBand.y - this.y;
            let distance = sqrt(dx * dx + dy * dy);

            //avoid dividing by 0
            if (distance < 1) distance = 1; // Avoid division by zero
            
            //sets variable for how many times band has played together
            let connectionStrength = allPairings[this.name]?.[otherBand.name]  || 0;
            let isConnected = connectionStrength > 0;
    
            if (isConnected) {
                // Scale attraction based on primary connection strength
                let attractionStrength = baseAttractionStrength * connectionStrength;
                let attractionForce = attractionStrength * (distance - minDistance);
                forceX += attractionForce * (dx / distance);
                forceY += attractionForce * (dy / distance);
            } 

            if (distance < bufferDistance) {
                let repulsionForce = baseRepulsionStrength / (distance * distance);
                    let overlapFactor = (bufferDistance - distance) / bufferDistance;
                    repulsionForce *= 1 + overlapFactor * 2
                    
        

            
            // Apply repulsion force if too close
                forceX -= repulsionForce * (dx / distance);
                forceY -= repulsionForce * (dy / distance);
            }
        }
    
        // Outward spread force to counteract central pooling
        let centerX = windowWidth / 2;
        let centerY = windowHeight / 2;
        let spreadX = this.x - centerX;
        let spreadY = this.y - centerY;
        forceX += spreadX * spreadStrength;
        forceY += spreadY * spreadStrength;
    
        // Apply force to position

        this.x += forceX;
        this.y += forceY;
    
        // Constrain within window bounds with a small margin
        this.x = constrain(this.x, 100, windowWidth - 100);
        this.y = constrain(this.y, 100, windowHeight - 100);
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
   
    clicked(mx, my) {
        let d = dist(mx, my, this.x, this.y);
        return d < this.size * 0.5; // Check if clicked inside the node
    }
  
}

//------------------------ Setup -------------------------------------------------------------------
function setupDataVis(allPairings, secondaryConnections) {

        // // Run attraction and repulsion forces for `settleFrames` frames
        for (let i = 0; i < settleFrames; i++) {
            for (let band of bands) {
                band.applyForces();
            }
        }
        
        console.log("Simulation settled after " + settleFrames + " frames.");

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

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);

    // Reposition nodes to stay within bounds
    for (let band of bands) {
        band.x = constrain(band.x, 50, windowWidth - 50);
        band.y = constrain(band.y, 55, windowHeight - 50);
    }
}




function mousePressed() {
    for (let band of bands) {
        if (band.clicked(mouseX, mouseY)) {
            selectedBand = band;
            showPopup(band.name);
            return;
        }
    }
    closePopup();
}



//------------------------ Draw -----------------------------
function draw() {
    background(0);
    //  // Apply forces for magnetism
    //  for (let band of bands) {
    // band.applyForces();
    // }

    if (currentFrame < settleFrames) {
        for (let band of bands) {
            band.applyForces();
        }
        currentFrame++;
    }

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


// ---------------------- POPUP FUNCTIONS ----------------------

function showPopup(bandName) {
    let popup = document.getElementById("popup");
    let popupContent = document.getElementById("popup-content");

    if (!popupContent) {
        console.error("Popup content element not found!");
        return;
    }

    // Ensure the band has primary connections before looping
    let primaryConnectionsList = "";
    if (allPairings[bandName]) {
        primaryConnectionsList = Object.keys(allPairings[bandName])
            .map(otherBand => `<li>${otherBand} (${allPairings[bandName][otherBand]})</li>`)
            .join("");
    };

    if (secondaryConnections[bandName]) {
        secondaryConnectionsList = Object.keys(secondaryConnections[bandName])
            .map(otherBand => `<li>${otherBand} (${secondaryConnections[bandName][otherBand]})</li>`)
            .join("");
        };
    

    

    // Inject the content into the popup
    popupContent.innerHTML = `
        <h2>${bandName}</h2>
        <p>Details about ${bandName}.</p>
            <div class="connections-container">
                <div class="connections-list">
                    <h3>Primary Connections:</h3>
                    <ul>${primaryConnectionsList || "<li>No primary connections</li>"}</ul>
                </div>
                <div class="connections-list">
                    <h3>Secondary Connections:</h3>
                    <ul>${secondaryConnectionsList || "<li>No secondary connections</li>"}</ul>
                </div>
            </div>
    `;

    popup.style.display = "block";
};

function closePopup() {
    let popup = document.getElementById("popup");
    popup.style.display = "none";
}

// Close the popup when clicking outside
window.onclick = function(event) {
    let popup = document.getElementById("popup");
    let popupBox = document.querySelector(".popup-box");

    // If the click is outside the popup-box but inside the popup, close it
    if (event.target === popup) {
        closePopup();
    }
};