let bands = [];
let maxShows = 1;
let maxPConnections = 1; 
let maxSConnections = 1; 
let selectedBand = null; // Track the selected band


let settleFrames = 200;  // Number of frames before movement stops
let currentFrame = 0;    // Counter for frames



//-----------------------Build class for each band node--------------------------------------------
class BandNode {
    
    constructor(name, numShows) {
        let padding = 500; // Ensures nodes don't get too close to the edges
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
        
        let baseAttractionStrength = .06;  // Base attraction strength
        let baseRepulsionStrength = 900;    // Base repulsion strength 
        let minDistance = 200;               // Minimum distance before repulsion kicks in
        let spreadStrength = 0.001;         // Outward spread force to prevent central clustering
        let bufferDistance = 2000            //buffer around each node

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

        let textSizeScaled = map(Object.keys(allPairings[this.name]).length, 1, maxShows, 12, 35);
        stroke(0);
        strokeWeight(.7);
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

     

    console.log("Data visualization initialized.");
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.parent("canvas-container");

    bands = Object.keys(allPairings).map(band => new BandNode(band, Object.keys(allPairings[band]).length));

       // // Run attraction and repulsion forces for `settleFrames` frames
   for (let i = 0; i < settleFrames; i++) {
    for (let band of bands) {
        band.applyForces();
    }
}
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




}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);

    // Reposition nodes to stay within bounds
    for (let band of bands) {
        band.x = constrain(band.x, 50, windowWidth - 50);
        band.y = constrain(band.y, 55, windowHeight - 50);
    }
}



console.log("Simulation settled after " + settleFrames + " frames.");


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

function avoidLabelOverlap(bands) {
    for (let i = 0; i < bands.length; i++) {
      for (let j = i + 1; j < bands.length; j++) {
        let a = bands[i];
        let b = bands[j];
     
         // Estimate text dimensions
      textSize(a.size || 12);  // Default size if not set
      let aWidth = textWidth(a.name);
      let aHeight = a.size || 12;

      textSize(b.size || 12);
      let bWidth = textWidth(b.name);
      let bHeight = b.size || 12;

      // Use diagonal bounding box distance
      let minDist = sqrt((aWidth / 2 + bWidth / 2) ** 2 + (aHeight / 2 + bHeight / 2) ** 2);

      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let d = sqrt(dx * dx + dy * dy);

      if (d < minDist && d > 0.01) {
        let push = (minDist - d) * 0.05;
        let angle = atan2(dy, dx);
        a.x -= cos(angle) * push;
        a.y -= sin(angle) * push;
        b.x += cos(angle) * push;
        b.y += sin(angle) * push;

            // Constrain within window bounds with a small margin
            this.x = constrain(this.x, 100, windowWidth - 100);
            this.y = constrain(this.y, 100, windowHeight - 100);
      }
    }
  }
}



//------------------------ Draw -----------------------------
function draw() {
   
    background(0);
    //  // Apply forces for magnetism
    //  for (let band of bands) {
    // band.applyForces();
    // }
    avoidLabelOverlap(bands);
    // Draw connections
    for (let band of bands) {
        if (band instanceof BandNode) {
            band.drawConnections();
        }
    }

    if (currentFrame < settleFrames) {
        for (let band of bands) {
            band.applyForces();
        }
        currentFrame++;
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