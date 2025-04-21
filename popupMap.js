let myMiniSketch;

const miniSketch = (p) => {
  let miniNodes = [];
  let miniMainBand = null;

  p.setup = function () {
    const canvas = p.createCanvas(500, 500);
    canvas.parent("mini-canvas-container");

    p.noLoop();  // Stops continuous redraw; makes it static after the first render
  };

  p.draw = function () {
    p.background(0);

    if (!miniNodes.length) return;

    // Apply forces and draw connections and nodes
    for (let node of miniNodes) applyMiniForces(node);
    for (let node of miniNodes) drawMiniConnections(node);
    for (let node of miniNodes) {
      node.x += node.vx;
      node.y += node.vy;
      node.vx *= 0.4;
      node.vy *= 0.4;
      drawBandNode(node);
    }
  };

  function drawMiniConnections(node) {
    for (let other of miniNodes) {
      if (other === node) continue;
      let strength = allPairings[node.name]?.[other.name] || 0;
      strength += secondaryConnections[node.name]?.[other.name] || 0;
      if (strength > 0) {
        p.stroke(255, 0, 0, 50);
        p.strokeWeight(p.map(strength, 1, 10, 1, 4));
        p.line(node.x, node.y, other.x, other.y);
      }
    }
  }

  function drawBandNode(node) {
    if (node.name === miniMainBand) {
      p.fill(0);
      p.stroke(255);
      p.strokeWeight(2);
    } else {
      p.fill(255);
      p.noStroke();
    }
    p.ellipse(node.x, node.y, node.size + 5);
    p.fill(200);
    p.noStroke();
    p.textAlign(p.CENTER);
    p.textSize(12);
    p.text(node.name, node.x, node.y + 20);
  }

  function applyMiniForces(node) {
    let ax = 0,
      ay = 0;
    const minDist = 40;
    const repelStrength = 1000;
    const attractStrength = 0.5;

    for (let other of miniNodes) {
      if (other === node) continue;

      let dx = other.x - node.x;
      let dy = other.y - node.y;
      let dist = Math.sqrt(dx * dx + dy * dy) || 1;

      let connectionStrength = allPairings[node.name]?.[other.name] || 0;
      connectionStrength += secondaryConnections[node.name]?.[other.name] || 0;

      if (connectionStrength > 0) {
        let attract = attractStrength * connectionStrength;
        ax += (attract * dx) / dist;
        ay += (attract * dy) / dist;
      }

      if (dist < minDist) {
        let repel = repelStrength / (dist * dist);
        ax -= (repel * dx) / dist;
        ay -= (repel * dy) / dist;
      }
    }

    node.vx += ax;
    node.vy += ay;
  }

  p.setupMiniGraph = function (bandName) {
    console.log("Setting up mini graph for:", bandName);
    let connected = new Set();

    if (allPairings[bandName]) {
      for (let other in allPairings[bandName]) {
        if (allPairings[bandName][other] > 0) connected.add(other);
      }
    }

    if (secondaryConnections[bandName]) {
      for (let other in secondaryConnections[bandName]) {
        if (secondaryConnections[bandName][other] > 0) connected.add(other);
      }
    }

    connected.add(bandName);
    miniNodes = Array.from(connected).map(
      (name) => new BandNode(name, counts[name] || 1)
    );

    // Assign random starting positions and zero velocity
    for (let node of miniNodes) {
      node.x = p.random(50, 350);
      node.y = p.random(50, 350);
      node.vx = 0;
      node.vy = 0;
    }

    miniMainBand = bandName;

    p.redraw(); // Trigger a single update to apply forces and render the nodes once
  };
};
