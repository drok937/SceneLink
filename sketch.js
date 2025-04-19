let bands = [];
let maxShows = 1;
let maxPConnections = 1; 
let maxSConnections = 1; 
let selectedBand = null; // Track the selected band

//Set time for magnetism to run. Stop after settleFrames
let settleFrames = 200;  // Number of frames before movement stops
let currentFrame = 0;    // Counter for frames

//zoom and pan settings
let zoom = 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let dragStartX, dragStartY;


//-----------------------Build class for each band node--------------------------------------------
class BandNode {
    
    constructor(name, numShows) {
        let padding = 200; // Ensures nodes don't get too close to the edges
        this.name = name;
  
        // If numShows is not passed in, look it up from the global counts object
         this.numShows =  counts[name] || 1;

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
                    stroke(200, 250); // White with some transparency
                    strokeWeight(map(allPairings[this.name][otherBand], 1, maxPConnections, 1, 6, true));
                    line(this.x, this.y, otherBandNode.x, otherBandNode.y);
                }
            }
        }
    }
    
    //-----------------------------------------------------------------------------------
    applyForces() {
        let forceX = 0;
        let forceY = 0;
     //-----------------------------TWEAK MAGNETISM SETTINGS HERE------------------------------- 
        let baseAttractionStrength = .1;  // Base attraction strength
        let baseRepulsionStrength = 2000;    // Base repulsion strength 
        let minDistance = 125;               // Minimum distance before repulsion kicks in
        let spreadStrength = 0.000;         // Outward spread force to prevent central clustering
        let bufferDistance = 1500            //buffer around each node
    //-----------------------------------------------------------------------------------
        for (let otherBand of bands) {
            if (otherBand === this) continue; // Skip self
            //calculate distance between nodes
            let dx = otherBand.x - this.x;
            let dy = otherBand.y - this.y;
            let distance = sqrt(dx * dx + dy * dy);

            //avoid dividing by 0
            if (distance < 1) distance = 1; // Avoid division by zero
            
            //sets variable for how many times band has played together
            // change denominators to alter ratio of primary to seconary connection strength
            let primaryStrength = allPairings[this.name]?.[otherBand.name] / 2  || 0;
            let secondaryStrength = (secondaryConnections[this.name]?.[otherBand.name] || 0) / 3;
            let connectionStrength = primaryStrength + secondaryStrength;

            let isConnected = connectionStrength > 0;
          
            if (isConnected) {
                // Scale attraction based on primary connection strength
                let attractionStrength = baseAttractionStrength * connectionStrength;
                let attractionForce = attractionStrength * (distance - minDistance);
                forceX += attractionForce * (dx / distance);
                forceY += attractionForce * (dy / distance);
            } 

            //keep it within bounds of the canvas
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


// Soft edge repulsion
let edgeMargin = 150;
let edgeForceStrength = 5;

if (this.x < edgeMargin) {
    forceX += edgeForceStrength * (edgeMargin - this.x) / edgeMargin;
}
if (this.x > windowWidth - edgeMargin) {
    forceX -= edgeForceStrength * (this.x - (windowWidth - edgeMargin)) / edgeMargin;
}
if (this.y < edgeMargin) {
    forceY += edgeForceStrength * (edgeMargin - this.y) / edgeMargin;
}
if (this.y > windowHeight - edgeMargin) {
    forceY -= edgeForceStrength * (this.y - (windowHeight - edgeMargin)) / edgeMargin;
}
    
        // Apply force to position

        this.x += forceX;
        this.y += forceY;
    
        // Constrain within window bounds with a small margin
        this.x = constrain(this.x, 100, windowWidth - 100);
        this.y = constrain(this.y, 100, windowHeight - 100);
    } 

    
//---------------------------------NODE VISUALS----------------------------------------
    display() {
        noStroke();
        fill(0, 200, 0);
        ellipse(this.x, this.y, this.size * 0.5, this.size * 0.5);

        let textSizeScaled = map(Object.keys(allPairings[this.name]).length, 1, maxShows, 10, 30);
        stroke(0);
        strokeWeight(2.5);
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


    bands = Object.keys(allPairings)
    .filter(band => (counts[band] || 1) > 1)  // Filter only bands with count > 2
    .map(band => new BandNode(band, Object.keys(allPairings[band]).length));

    // Define time limit for "applyforces"
    for (let i = 0; i < settleFrames; i++) {
    for (let band of bands) {
        band.applyForces();
        }
    }
    for (let band in allPairings) {
        maxShows = max(maxShows, Object.keys(allPairings[band]).length);
    }

    // Calculate Primary connection count
    maxPConnections = 1;
    for (let band in allPairings) {
        for (let otherBand in allPairings[band]) {
            maxPConnections = max(maxPConnections, allPairings[band][otherBand]);
        }
    }
    // Calculate Secondary connection count
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

//-------------------------------MOUSE PRESSED---------------------------------------
function mousePressed() {
   
    // Start dragging
    isDragging = true;
    dragStartX = mouseX - offsetX;
    dragStartY = mouseY - offsetY;

    let adjustedMouseX = (mouseX - offsetX) / zoom;
    let adjustedMouseY = (mouseY - offsetY) / zoom;

    
    //tell node to open popup when clicked
    for (let band of bands) {
        if (band.clicked(adjustedMouseX, adjustedMouseY)) {
            selectedBand = band;
            showPopup(band.name);
            return;
        }
    }
    closePopup();
}

function mouseReleased() {
    isDragging = false;
}

function mouseDragged() {
    if (isDragging) {
      offsetX = mouseX - dragStartX;
      offsetY = mouseY - dragStartY;
    }
  }

  function mouseWheel(event) {
    let zoomSensitivity = 0.004;
    let newZoom = zoom - event.delta * zoomSensitivity;
    newZoom = constrain(newZoom, 0.1, 5);
  
    // Adjust offset so zoom feels centered around mouse
    let zoomFactor = newZoom / zoom;

    offsetX = mouseX - (mouseX - offsetX) * zoomFactor;
    offsetY = mouseY - (mouseY - offsetY) * zoomFactor;
  
    zoom = newZoom;
    return false; // Prevent page scroll
  }

  

//------------------------------AVOID TEXT OVERLAPS---------------------------------------
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
        let push = (minDist - d) * 0.0001;
        let angle = atan2(dy, dx);
        a.x -= cos(angle) * push;
        a.y -= sin(angle) * push;
        b.x += cos(angle) * push;
        b.y += sin(angle) * push;
      }
    }
  }
}



//------------------------ Draw -----------------------------
function draw() {
    background(0);

    // Apply pan and zoom
    push();
    translate(offsetX, offsetY);
    scale(zoom);

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


    // Apply forces during settling frames
    if (currentFrame < settleFrames) {
        for (let band of bands) {
            band.applyForces();
        }
        currentFrame++;
    }

  
    // // Draw label nodes last so they render on top
    // for (let band of bands) {
    //     if (band instanceof LabelNode) {
    //         band.display();
    //     }
    // }

    avoidLabelOverlap(bands);

    pop();
    
}



