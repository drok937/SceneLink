let isP5Ready = false;

let bands = [];
let maxShows = 1;
let maxPConnections = 1; 
let maxSConnections = 1; 
let selectedBand = null; 

let minShows = 4; // Alters number of shows a band needs to play to show up on the map
let minPairings = 2; // atlers the number of connections a band needs to show up on map

//Set time for magnetism to run. Stop after settleFrames
let settleFrames = 700;  // Number of frames before movement stops. Higher num = more latency better spread
let currentFrame = 0;    // Counter for frames

//zoom and pan settings
let zoom = 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let dragStartX, dragStartY;

/*------------------------------------------------------------------------------------------------
                     ||Build BandNode Class||
---------------------------------------------------------------------------------------------------*/

class BandNode {
    
    constructor(name, numShows) {
        let padding = 200; // 10 percent Ensures nodes don't get too close to the edges
        this.name = name;
        this.vx = 0;
        this.vy = 0;

        // look up the number of shows a band has played and map that to the size of the node
        this.numShows =  counts[name] || 1;
        this.size = map(numShows, 1, 10, 1, 20);

        //Distribute the nodes evenly across the campus randomly (pre-magnetism)
        this.x = random(-offsetX + padding, windowWidth - offsetX - padding);
        this.y = random(-offsetY + padding, windowHeight - offsetY - padding);
       
       
       //not working yet, this will replace the this.x =, this.y = above.
        // let paddingX = windowWidth * padding;
        // let paddingY = windowHeight * padding;

        // this.x = random(paddingX, windowWidth - paddingX);
        // this.y = random(paddingY, windowHeight - paddingY);
    }

    drawConnections() {
        // Draw secondary connections (Red)
        if (secondaryConnections[this.name]) {
            // But only if it's an object (with keys representing connected bands)
            if (typeof secondaryConnections[this.name] === 'object') {
                for (let otherBand in secondaryConnections[this.name]) {
                    let otherBandNode = bands.find(b => b.name === otherBand);
                    if (otherBandNode) {
                        stroke(255, 0, 0, 50); // Red color
                       
                        //map the stroke of the line to the strength of the connection
                        strokeWeight(map(secondaryConnections[this.name][otherBand], 1, maxSConnections, 1, 10, true)); 
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
                    
                    //map stroke weight to the strength of connection
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
        let baseAttractionStrength = .5;  // Base attraction strength
        let baseRepulsionStrength = 4500;    // Base repulsion strength 
        let minDistance = 100;               // Minimum distance before repulsion kicks in
        let spreadStrength = 0.0001;         // Outward spread force (from center) to prevent central clustering
        let bufferDistance = 5000;            //buffer around each node
        let edgeMargin = 150;                 //where edge force starts kicking
        let edgeForceStrength = 50;           //power of edge force to prevent clusters around edges
    //-----------------------------------------------------------------------------------
        for (let otherBand of bands) {
            if (otherBand === this) continue; // Skip self
            //calculate distance between nodes
            let dx = otherBand.x - this.x;
            let dy = otherBand.y - this.y;
            let distance = sqrt(dx * dx + dy * dy);

            //avoid dividing by 0
            if (distance < 1) distance = 1; // Avoid division by zero
            
            //sets force variable for how many times band has played together
            // change denominators to alter ratio of primary to seconary connection strength
            let primaryStrength = allPairings[this.name]?.[otherBand.name] / 2  || 0;
            let secondaryStrength = (secondaryConnections[this.name]?.[otherBand.name] || 0) / 3;
            let connectionStrength = primaryStrength + secondaryStrength;

            let isConnected = connectionStrength > 0;
          
            if (isConnected) {
                // Scale attraction based on connection strength
                let attractionStrength = baseAttractionStrength * connectionStrength;
                let attractionForce = attractionStrength * (distance - minDistance);
                forceX += attractionForce * (dx / distance);
                forceY += attractionForce * (dy / distance);
            } 

            // //keep it within bounds of the canvas
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
    
        // Update velocity with damping
        this.vx = (this.vx + forceX) * 0.4;  // damping factor
        this.vy = (this.vy + forceY) * 0.4;

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

            
    } 

/*------------------------------------------------------------------------------------------------
                     ||Node Visuals||
---------------------------------------------------------------------------------------------------*/    

    display() {
        noStroke();
        fill(0, 200, 0);
        ellipse(this.x, this.y, this.size * 0.5, this.size * 0.5);
    
        let textSizeScaled = map(Object.keys(allPairings[this.name]).length, 3, maxShows, 8, 20);
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
/*------------------------------------------------------------------------
                     ||Setup||
--------------------------------------------------------------------------*/

function setup() {
     // createCanvas(windowWidth / zoom, windowHeight / zoom);
        createCanvas(windowWidth, windowHeight);
        isP5Ready = true;
        populate()
        
        // Apply forces during settling frames. THIS CAN BE MOVED TO DRAW LOOP TO SEE FORCES
        if (currentFrame < settleFrames) {
        for (let band of bands) {
            band.applyForces();
            avoidLabelOverlap(bands);
        }
        currentFrame++;
    }
    
  
};

/*------------------------------------------------------------------------
                     ||Data Vis settings||
--------------------------------------------------------------------------*/
function setupDataVis(allPairings, secondaryConnections) {
    if (!allPairings || !secondaryConnections) {
        console.error("setupDataVis: Data not loaded properly.");
        return;
    }
 
    console.log("Data visualization initialized.");

    //---------------------------Apply min connections threshold

        // Step 1: Get bands that meet both thresholds
        let qualifiedBands = Object.keys(allPairings).filter(band => 
            (counts[band] || 0) >= minShows &&
            Object.keys(allPairings[band] || {}).length >= minPairings
        );
  
         // Step 2: Filter to only keep bands connected (via primary or secondary) to at least TWO other qualified bands
        bands = qualifiedBands.filter(band => {
            let primaryConnections = Object.keys(allPairings[band] || {});
            let secondaryConnectionsForBand = Object.keys(secondaryConnections[band] || {});
            let allConnections = [...new Set([...primaryConnections, ...secondaryConnectionsForBand])];
  
        // Count how many of those connections are to other qualified bands
        let qualifiedConnectionsCount = allConnections.filter(conn => qualifiedBands.includes(conn)).length;
  
    return qualifiedConnectionsCount >= 2;
    }).map(band => new BandNode(band, Object.keys(allPairings[band]).length));
  

  //---------------------- Define time limit for "applyforces"
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


// function windowResized() {
//     resizeCanvas(windowWidth, windowHeight);

//     // Reposition nodes to stay within bounds
//     for (let band of bands) {
//         band.x = constrain(band.x, 50, windowWidth - 50);
//         band.y = constrain(band.y, 55, windowHeight - 50);
//     }
// }

console.log("Simulation settled after " + settleFrames + " frames.");

/*------------------------------------------------------------------------
                     ||Mouse Settings||
--------------------------------------------------------------------------*/
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


  //------------------------------Scroll Zoom--------------------------
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

  
/*------------------------------------------------------------------------
                     ||Text Overlaps||
--------------------------------------------------------------------------*/
//--------------AVOID TEXT OVERLAPS------------------
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
        let push = (minDist - d) * 0.003; // change this multiplier to create more space between bands
        let angle = atan2(dy, dx);
        a.x -= cos(angle) * push;
        a.y -= sin(angle) * push;
        b.x += cos(angle) * push;
        b.y += sin(angle) * push;
      }
    }
  }
}


/*------------------------------------------------------------------------
                     ||Draw||
--------------------------------------------------------------------------*/
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

    //can add applyForces here if you want them to render in real time

    pop();
    
}



