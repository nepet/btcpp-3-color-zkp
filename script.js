class Graph {
  constructor() {
    this.vertices = [];
    this.edges = [];
    this.colors = ["#ff6b6b", "#4ecdc4", "#ffcc33"];
    this.vertexColors = {};
    this.commitments = {}; // Hash commitments for each vertex
    this.nonces = {}; // Random nonces for each vertex
    this.committed = false;
    this.hiddenColors = false;
  }

  addVertex(x, y, id) {
    this.vertices.push({ x, y, id });
  }

  addEdge(v1, v2) {
    this.edges.push({ v1, v2 });
  }

  clear() {
    this.vertices = [];
    this.edges = [];
    this.vertexColors = {};
    this.commitments = {};
    this.nonces = {};
    this.committed = false;
    this.hiddenColors = false;
  }

  generateRandomGraph(numVertices = 8) {
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      this.clear();
      const canvas = document.getElementById("graphCanvas");
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const outerRadius = 220;
      const innerRadius = 140;

      // For 8 or fewer vertices, use single circle
      if (numVertices <= 8) {
        for (let i = 0; i < numVertices; i++) {
          const angle = (2 * Math.PI * i) / numVertices;
          const x = centerX + outerRadius * Math.cos(angle);
          const y = centerY + outerRadius * Math.sin(angle);
          this.addVertex(x, y, i);
        }
      } else {
        // For more than 8 vertices, use two circles
        const outerVertices = 8;
        const innerVertices = numVertices - 8;

        // Create outer circle (first 8 vertices)
        for (let i = 0; i < outerVertices; i++) {
          const angle = (2 * Math.PI * i) / outerVertices;
          const x = centerX + outerRadius * Math.cos(angle);
          const y = centerY + outerRadius * Math.sin(angle);
          this.addVertex(x, y, i);
        }

        // Create inner circle (remaining vertices)
        for (let i = 0; i < innerVertices; i++) {
          const angle = (2 * Math.PI * i) / innerVertices;
          const x = centerX + innerRadius * Math.cos(angle);
          const y = centerY + innerRadius * Math.sin(angle);
          this.addVertex(x, y, i + outerVertices);
        }
      }

      const addedEdges = new Set();

      if (numVertices <= 8) {
        // Single circle edge generation
        // Connect adjacent vertices to form a cycle (always 3-colorable)
        for (let i = 0; i < numVertices; i++) {
          const next = (i + 1) % numVertices;
          this.addEdge(i, next);
          addedEdges.add(`${Math.min(i, next)}-${Math.max(i, next)}`);
        }

        // Add some additional connections, but be careful not to create K4 or other non-3-colorable subgraphs
        // Connect vertices that are 2 positions apart (safe for cycles of length 8)
        for (let i = 0; i < numVertices; i++) {
          if (Math.random() > 0.4) {
            // 60% chance
            const skipTwo = (i + 2) % numVertices;
            const edgeKey = `${Math.min(i, skipTwo)}-${Math.max(i, skipTwo)}`;
            if (!addedEdges.has(edgeKey)) {
              this.addEdge(i, skipTwo);
              addedEdges.add(edgeKey);
            }
          }
        }

        // Add some diagonal connections, but avoid creating K4
        for (let i = 0; i < numVertices; i += 2) {
          // Only even vertices to avoid K4
          if (Math.random() > 0.7) {
            // 30% chance
            const opposite = (i + 4) % numVertices;
            const edgeKey = `${Math.min(i, opposite)}-${Math.max(i, opposite)}`;
            if (!addedEdges.has(edgeKey)) {
              this.addEdge(i, opposite);
              addedEdges.add(edgeKey);
            }
          }
        }
      } else {
        // Two circle edge generation
        const outerVertices = 8;
        const innerVertices = numVertices - 8;

        // Connect outer circle
        for (let i = 0; i < outerVertices; i++) {
          const next = (i + 1) % outerVertices;
          this.addEdge(i, next);
          addedEdges.add(`${Math.min(i, next)}-${Math.max(i, next)}`);
        }

        // Connect inner circle
        for (let i = 0; i < innerVertices; i++) {
          const current = i + outerVertices;
          const next = ((i + 1) % innerVertices) + outerVertices;
          this.addEdge(current, next);
          addedEdges.add(
            `${Math.min(current, next)}-${Math.max(current, next)}`
          );
        }

        // Connect between circles (each inner vertex connects to 1-2 outer vertices)
        for (let i = 0; i < innerVertices; i++) {
          const innerVertex = i + outerVertices;
          const outerVertex1 = Math.floor((i * outerVertices) / innerVertices);
          const outerVertex2 = (outerVertex1 + 1) % outerVertices;

          // Connect to first outer vertex
          const edgeKey1 = `${Math.min(innerVertex, outerVertex1)}-${Math.max(
            innerVertex,
            outerVertex1
          )}`;
          if (!addedEdges.has(edgeKey1)) {
            this.addEdge(innerVertex, outerVertex1);
            addedEdges.add(edgeKey1);
          }

          // Sometimes connect to second outer vertex
          if (Math.random() > 0.5) {
            const edgeKey2 = `${Math.min(innerVertex, outerVertex2)}-${Math.max(
              innerVertex,
              outerVertex2
            )}`;
            if (!addedEdges.has(edgeKey2)) {
              this.addEdge(innerVertex, outerVertex2);
              addedEdges.add(edgeKey2);
            }
          }
        }

        // Add some additional outer circle connections
        for (let i = 0; i < outerVertices; i++) {
          if (Math.random() > 0.6) {
            const skipTwo = (i + 2) % outerVertices;
            const edgeKey = `${Math.min(i, skipTwo)}-${Math.max(i, skipTwo)}`;
            if (!addedEdges.has(edgeKey)) {
              this.addEdge(i, skipTwo);
              addedEdges.add(edgeKey);
            }
          }
        }
      }

      // Test if we can find a valid 3-coloring
      if (this.colorGraph()) {
        // Successfully found a valid 3-coloring
        return;
      }

      attempts++;
    }

    // Fallback: create a simple cycle which is always 3-colorable
    this.clear();
    const canvas = document.getElementById("graphCanvas");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = 220;
    const innerRadius = 140;

    if (numVertices <= 8) {
      // Single circle for 8 or fewer vertices
      for (let i = 0; i < numVertices; i++) {
        const angle = (2 * Math.PI * i) / numVertices;
        const x = centerX + outerRadius * Math.cos(angle);
        const y = centerY + outerRadius * Math.sin(angle);
        this.addVertex(x, y, i);
      }

      // Simple cycle - guaranteed 3-colorable
      for (let i = 0; i < numVertices; i++) {
        const next = (i + 1) % numVertices;
        this.addEdge(i, next);
      }
    } else {
      // Two circles for more than 8 vertices
      const outerVertices = 8;
      const innerVertices = numVertices - 8;

      // Create outer circle
      for (let i = 0; i < outerVertices; i++) {
        const angle = (2 * Math.PI * i) / outerVertices;
        const x = centerX + outerRadius * Math.cos(angle);
        const y = centerY + outerRadius * Math.sin(angle);
        this.addVertex(x, y, i);
      }

      // Create inner circle
      for (let i = 0; i < innerVertices; i++) {
        const angle = (2 * Math.PI * i) / innerVertices;
        const x = centerX + innerRadius * Math.cos(angle);
        const y = centerY + innerRadius * Math.sin(angle);
        this.addVertex(x, y, i + outerVertices);
      }

      // Connect outer circle
      for (let i = 0; i < outerVertices; i++) {
        const next = (i + 1) % outerVertices;
        this.addEdge(i, next);
      }

      // Connect inner circle
      for (let i = 0; i < innerVertices; i++) {
        const current = i + outerVertices;
        const next = ((i + 1) % innerVertices) + outerVertices;
        this.addEdge(current, next);
      }

      // Connect each inner vertex to one outer vertex
      for (let i = 0; i < innerVertices; i++) {
        const innerVertex = i + outerVertices;
        const outerVertex = Math.floor((i * outerVertices) / innerVertices);
        this.addEdge(innerVertex, outerVertex);
      }
    }

    // Ensure we can color this simple graph
    this.colorGraph();
  }

  isValidColoring() {
    for (let edge of this.edges) {
      if (this.vertexColors[edge.v1] === this.vertexColors[edge.v2]) {
        return false;
      }
    }
    return true;
  }

  colorGraph() {
    const maxAttempts = 1000;
    let attempts = 0;

    while (attempts < maxAttempts) {
      this.vertexColors = {};

      for (let vertex of this.vertices) {
        const usedColors = new Set();

        for (let edge of this.edges) {
          if (
            edge.v1 === vertex.id &&
            this.vertexColors[edge.v2] !== undefined
          ) {
            usedColors.add(this.vertexColors[edge.v2]);
          }
          if (
            edge.v2 === vertex.id &&
            this.vertexColors[edge.v1] !== undefined
          ) {
            usedColors.add(this.vertexColors[edge.v1]);
          }
        }

        const availableColors = this.colors.filter(
          (_, index) => !usedColors.has(index)
        );

        if (availableColors.length === 0) {
          break;
        }

        this.vertexColors[vertex.id] = Math.floor(
          Math.random() * availableColors.length
        );
        if (usedColors.size > 0) {
          let colorIndex = 0;
          while (usedColors.has(colorIndex) && colorIndex < 3) {
            colorIndex++;
          }
          if (colorIndex < 3) {
            this.vertexColors[vertex.id] = colorIndex;
          }
        }
      }

      if (
        Object.keys(this.vertexColors).length === this.vertices.length &&
        this.isValidColoring()
      ) {
        return true;
      }

      attempts++;
    }

    this.vertexColors = {};
    for (let i = 0; i < this.vertices.length; i++) {
      this.vertexColors[i] = i % 3;
    }

    return false;
  }

  clearColors() {
    this.vertexColors = {};
    this.commitments = {};
    this.nonces = {};
    this.committed = false;
    this.hiddenColors = false;
  }

  // SHA-256 hash function (shortened to 16 characters for display)
  async sha256Hash(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex.substring(0, 16); // Return first 16 characters of SHA-256
  }

  // Synchronous wrapper for compatibility (uses cached results)
  simpleHash(str) {
    // For synchronous calls, we'll use the cached hash or compute it
    if (this._hashCache && this._hashCache[str]) {
      return this._hashCache[str];
    }

    // Fallback to simple hash if async hasn't been computed yet
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, "0").substring(0, 16);
  }

  // Generate random nonce
  generateNonce() {
    return Math.random().toString(36).substring(2, 15);
  }

  // Create cryptographic commitments for all vertex colors
  async createCommitments() {
    this.commitments = {};
    this.nonces = {};
    this._hashCache = {};

    for (let vertexId in this.vertexColors) {
      const color = this.vertexColors[vertexId];
      const nonce = this.generateNonce();
      const inputString = `${vertexId}-${color}-${nonce}`;
      const commitment = await this.sha256Hash(inputString);

      this.nonces[vertexId] = nonce;
      this.commitments[vertexId] = commitment;
      this._hashCache[inputString] = commitment; // Cache for synchronous access
    }
  }

  // Verify a commitment when revealing a vertex
  verifyCommitment(vertexId, color, nonce) {
    const expectedHash = this.simpleHash(`${vertexId}-${color}-${nonce}`);
    return expectedHash === this.commitments[vertexId];
  }
}

class ZKPProtocol {
  constructor(graph) {
    this.graph = graph;
    this.selectedEdgeIndex = null;
    this.revealedVertices = new Set();
    this.verificationRounds = 0;
    this.successfulRounds = 0;
  }

  selectEdge(edgeIndex) {
    this.selectedEdgeIndex = edgeIndex;
    this.revealEdgeVertices();
    return true;
  }

  revealEdgeVertices() {
    if (this.selectedEdgeIndex !== null) {
      const edge = this.graph.edges[this.selectedEdgeIndex];
      this.revealedVertices.add(edge.v1);
      this.revealedVertices.add(edge.v2);
    }
  }

  async scrambleColors() {
    const colorMapping = [0, 1, 2].sort(() => Math.random() - 0.5);
    for (let vertexId in this.graph.vertexColors) {
      const oldColor = this.graph.vertexColors[vertexId];
      this.graph.vertexColors[vertexId] = colorMapping[oldColor];
    }
    // Regenerate commitments with new colors
    await this.graph.createCommitments();
    updateCommitmentsDisplay();
  }

  hideAllVertices() {
    this.revealedVertices.clear();
    this.selectedEdgeIndex = null;
  }

  revealAllVertices() {
    this.graph.vertices.forEach((vertex) => {
      this.revealedVertices.add(vertex.id);
    });
    this.selectedEdgeIndex = null;
  }

  async resetToNewGraph(numVertices = 8) {
    this.selectedEdgeIndex = null;
    this.revealedVertices.clear();

    // Reset verification statistics
    this.verificationRounds = 0;
    this.successfulRounds = 0;

    this.graph.generateRandomGraph(numVertices);
    this.graph.colorGraph();

    // Make sure colors are hidden before commitments are created
    this.graph.hiddenColors = true;
    this.graph.committed = false;

    await this.graph.createCommitments(); // Create cryptographic commitments
    this.graph.committed = true;

    // Clear original positions so they get recalculated
    delete this.graph.originalPositions;
  }

  verify() {
    if (this.selectedEdgeIndex === null) {
      return null;
    }

    const edge = this.graph.edges[this.selectedEdgeIndex];
    const v1 = edge.v1;
    const v2 = edge.v2;
    const color1 = this.graph.vertexColors[v1];
    const color2 = this.graph.vertexColors[v2];

    const isValid = color1 !== color2;
    const areAdjacent = true; // Always true since we selected an edge

    this.verificationRounds++;
    if (isValid) {
      this.successfulRounds++;
    }

    return {
      isValid,
      areAdjacent,
      colors: [color1, color2],
      vertices: [v1, v2],
      edgeIndex: this.selectedEdgeIndex,
    };
  }

  reset() {
    this.selectedEdgeIndex = null;
    this.revealedVertices.clear();
  }

  getStats() {
    // Calculate theoretical confidence using the correct ZKP formula
    // Confidence = 1 - (1 - 1/m)^k where m = number of edges, k = number of rounds
    let theoreticalConfidence = 0;
    if (this.verificationRounds > 0) {
      const numEdges = this.graph.edges.length;
      const probability = 1 / numEdges; // Probability of catching a cheater in one round
      const failureProbability = Math.pow(
        1 - probability,
        this.verificationRounds
      );
      theoreticalConfidence = (1 - failureProbability) * 100;
    }

    return {
      rounds: this.verificationRounds,
      successful: this.successfulRounds,
      confidence: theoreticalConfidence.toFixed(1),
      actualSuccess:
        this.verificationRounds > 0
          ? ((this.successfulRounds / this.verificationRounds) * 100).toFixed(1)
          : 0,
    };
  }
}

class GraphRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.graph = null;
    this.zkp = null;
    this.hoveredEdgeIndex = null;
  }

  setGraph(graph, zkp) {
    this.graph = graph;
    this.zkp = zkp;
  }

  setHoveredEdge(edgeIndex) {
    this.hoveredEdgeIndex = edgeIndex;
  }

  drawEdge(v1, v2, highlight = false, hovered = false) {
    // Presentation-ready edge widths
    const baseWidth = 3;
    const highlightWidth = 6;
    const hoverWidth = 5;

    this.ctx.beginPath();
    this.ctx.moveTo(v1.x, v1.y);
    this.ctx.lineTo(v2.x, v2.y);

    if (highlight) {
      this.ctx.strokeStyle = "#ff6b6b";
      this.ctx.lineWidth = highlightWidth;
    } else if (hovered) {
      this.ctx.strokeStyle = "#667eea";
      this.ctx.lineWidth = hoverWidth;
    } else {
      this.ctx.strokeStyle = "#333";
      this.ctx.lineWidth = baseWidth;
    }

    this.ctx.stroke();
  }

  drawVertex(vertex, colorIndex, hidden = false, selected = false) {
    // Larger vertices for presentation
    const vertexRadius = 28;

    this.ctx.beginPath();
    this.ctx.arc(vertex.x, vertex.y, vertexRadius, 0, 2 * Math.PI);

    if (hidden && !this.zkp.revealedVertices.has(vertex.id)) {
      this.ctx.fillStyle = "#999";
    } else if (colorIndex !== undefined) {
      this.ctx.fillStyle = this.graph.colors[colorIndex];
    } else {
      this.ctx.fillStyle = "#fff";
    }

    this.ctx.fill();

    // Presentation-ready border widths
    const borderWidth = 4;
    const selectedBorderWidth = 8;

    if (selected) {
      this.ctx.strokeStyle = "#ff6b6b";
      this.ctx.lineWidth = selectedBorderWidth;
    } else {
      this.ctx.strokeStyle = "#333";
      this.ctx.lineWidth = borderWidth;
    }
    this.ctx.stroke();

    // Always show vertex numbers for presentation purposes
    const fontSize = 24;
    this.ctx.fillStyle = "#000";
    this.ctx.font = `${fontSize}px Arial`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(vertex.id, vertex.x, vertex.y);
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.graph) return;

    // Draw edges with highlighting for selected edge
    for (let i = 0; i < this.graph.edges.length; i++) {
      const edge = this.graph.edges[i];
      const v1 = this.graph.vertices[edge.v1];
      const v2 = this.graph.vertices[edge.v2];
      const isSelected = this.zkp.selectedEdgeIndex === i;
      const isHovered = this.hoveredEdgeIndex === i;
      this.drawEdge(v1, v2, isSelected, isHovered);
    }

    // Draw vertices - only reveal colors of vertices connected by selected edge
    for (let vertex of this.graph.vertices) {
      const colorIndex = this.graph.vertexColors[vertex.id];
      const hidden = this.graph.hiddenColors;
      let revealed = false;

      // Check if this vertex is part of the selected edge
      if (this.zkp.selectedEdgeIndex !== null) {
        const selectedEdge = this.graph.edges[this.zkp.selectedEdgeIndex];
        revealed =
          vertex.id === selectedEdge.v1 || vertex.id === selectedEdge.v2;
      }

      const selected = false; // We don't select individual vertices anymore
      this.drawVertex(vertex, colorIndex, hidden && !revealed, selected);
    }
  }

  getClickedVertex(x, y) {
    // Larger hit detection for presentation
    const hitRadius = 32;

    for (let vertex of this.graph.vertices) {
      const distance = Math.sqrt((x - vertex.x) ** 2 + (y - vertex.y) ** 2);
      if (distance <= hitRadius) {
        return vertex.id;
      }
    }
    return null;
  }

  getClickedEdge(x, y) {
    const hitDistance = 15; // Distance from edge line to consider a hit

    for (let i = 0; i < this.graph.edges.length; i++) {
      const edge = this.graph.edges[i];
      const v1 = this.graph.vertices[edge.v1];
      const v2 = this.graph.vertices[edge.v2];

      // Calculate distance from point to line segment
      const A = x - v1.x;
      const B = y - v1.y;
      const C = v2.x - v1.x;
      const D = v2.y - v1.y;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;

      if (lenSq !== 0) {
        param = dot / lenSq;
      }

      let xx, yy;

      if (param < 0) {
        xx = v1.x;
        yy = v1.y;
      } else if (param > 1) {
        xx = v2.x;
        yy = v2.y;
      } else {
        xx = v1.x + param * C;
        yy = v1.y + param * D;
      }

      const dx = x - xx;
      const dy = y - yy;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= hitDistance) {
        return i; // Return edge index
      }
    }
    return null;
  }
}

const graph = new Graph();
const zkp = new ZKPProtocol(graph);
const renderer = new GraphRenderer("graphCanvas");
renderer.setGraph(graph, zkp);

// Auto mode state
let autoMode = {
  active: false,
  intervalId: null,
  targetConfidence: 99.9,
};

// Auto mode functions
async function selectRandomEdge() {
  if (!autoMode.active || graph.edges.length === 0) return;

  const randomIndex = Math.floor(Math.random() * graph.edges.length);

  // If we already have an edge selected, scramble colors first
  if (zkp.selectedEdgeIndex !== null) {
    await zkp.scrambleColors();
    zkp.hideAllVertices();
  }

  const success = zkp.selectEdge(randomIndex);
  if (success) {
    renderer.render();

    const verification = zkp.verify();
    updateUI(); // Update UI after verification to get updated confidence

    if (verification) {
      const colorNames = ["Red", "Teal", "Yellow"];
      const v1 = verification.vertices[0];
      const v2 = verification.vertices[1];
      const color1Name = colorNames[verification.colors[0]];
      const color2Name = colorNames[verification.colors[1]];

      const stats = zkp.getStats();

      // Verify cryptographic commitments
      const commitment1Verified = graph.verifyCommitment(
        v1,
        verification.colors[0],
        graph.nonces[v1]
      );
      const commitment2Verified = graph.verifyCommitment(
        v2,
        verification.colors[1],
        graph.nonces[v2]
      );

      logVerification(
        `[AUTO] Cryptographic verification: V${v1} ${
          commitment1Verified ? "✓" : "✗"
        } V${v2} ${commitment2Verified ? "✓" : "✗"}`
      );

      // Show detailed verification process
      await showCommitmentVerification(
        v1,
        verification.colors[0],
        graph.nonces[v1],
        graph.commitments[v1]
      );

      if (verification.isValid) {
        logVerification(
          `[AUTO] ✓ Edge V${v1} (${color1Name}) ↔ V${v2} (${color2Name}) - Valid! Confidence: ${stats.confidence}%`
        );
      } else {
        logVerification(
          `[AUTO] ✗ Edge V${v1} (${color1Name}) ↔ V${v2} (${color2Name}) - Invalid! Confidence: ${stats.confidence}%`
        );
      }

      // Check if we've reached target confidence
      if (parseFloat(stats.confidence) >= autoMode.targetConfidence) {
        stopAutoMode();
        logVerification(
          `[AUTO] Target confidence ${autoMode.targetConfidence}% reached! Auto mode stopped.`
        );
      }
    }
  }
}

function startAutoMode() {
  if (autoMode.active) return;

  autoMode.active = true;
  const autoButton = document.getElementById("autoMode");
  autoButton.textContent = "Stop Auto Mode";
  autoButton.classList.add("auto-active");

  // Disable other buttons during auto mode
  document.getElementById("hideVertices").disabled = true;
  document.getElementById("revealAll").disabled = true;
  document.getElementById("resetGraph").disabled = true;

  logVerification(
    `[AUTO] Auto mode started - targeting ${autoMode.targetConfidence}% confidence`
  );

  // Start selecting edges every 500ms
  autoMode.intervalId = setInterval(selectRandomEdge, 200);
}

function stopAutoMode() {
  if (!autoMode.active) return;

  autoMode.active = false;

  if (autoMode.intervalId) {
    clearInterval(autoMode.intervalId);
    autoMode.intervalId = null;
  }

  const autoButton = document.getElementById("autoMode");
  autoButton.textContent = "Start Auto Mode";
  autoButton.classList.remove("auto-active");

  // Re-enable other buttons
  document.getElementById("hideVertices").disabled =
    zkp.revealedVertices.size === 0;
  document.getElementById("revealAll").disabled = false;
  document.getElementById("resetGraph").disabled = false;

  logVerification("[AUTO] Auto mode stopped");
}

function updateUI() {
  // Update regular UI
  document.getElementById("hideVertices").disabled =
    zkp.revealedVertices.size === 0;

  // Update manual verification max vertex ID
  const maxVertexId = Math.max(0, graph.vertices.length - 1);
  const manualVertexInput = document.getElementById("manualVertexId");
  if (manualVertexInput) {
    manualVertexInput.setAttribute("max", maxVertexId);
    manualVertexInput.setAttribute("placeholder", `0-${maxVertexId}`);
  }

  if (zkp.selectedEdgeIndex === null) {
    document.getElementById("selectedVertices").innerHTML = `
      <div class="nonces-title">Selected Edge Nonces</div>
      <div class="nonces-placeholder">Select an edge</div>
    `;
  } else {
    const edge = graph.edges[zkp.selectedEdgeIndex];
    const v1 = edge.v1;
    const v2 = edge.v2;
    const nonce1 = graph.nonces[v1];
    const nonce2 = graph.nonces[v2];

    // Show nonces and color codes directly in selectedVertices
    const color1 = graph.vertexColors[v1];
    const color2 = graph.vertexColors[v2];
    document.getElementById("selectedVertices").innerHTML = `
      <div class="nonces-title">Selected Edge Nonces:</div>
      <div class="nonces-list">
        <div class="nonce-item">
          <div class="nonce-item-label">V${v1} (Color ${color1}) Nonce:</div>
          <div class="nonce-item-value">${nonce1}</div>
        </div>
        <div class="nonce-item">
          <div class="nonce-item-label">V${v2} (Color ${color2}) Nonce:</div>
          <div class="nonce-item-value">${nonce2}</div>
        </div>
      </div>
    `;
  }

  // Update confidence display
  const stats = zkp.getStats();
  document.getElementById("confidenceValue").textContent =
    stats.confidence + "%";
  document.getElementById(
    "confidenceRounds"
  ).textContent = `(${stats.rounds} rounds)`;

  updateCommitmentsDisplay();
}

function updateCommitmentsDisplay() {
  const commitmentsList = document.getElementById("commitmentsList");
  if (!graph.commitments || Object.keys(graph.commitments).length === 0) {
    commitmentsList.innerHTML =
      '<div style="text-align: center; color: #666; font-size: 16px; padding: 40px;">No commitments yet - generate a graph first</div>';
    return;
  }

  let html = "";
  for (let vertexId in graph.commitments) {
    const commitment = graph.commitments[vertexId];
    const isRevealed = zkp.revealedVertices.has(parseInt(vertexId));
    const isSelected =
      zkp.selectedEdgeIndex !== null &&
      (graph.edges[zkp.selectedEdgeIndex].v1 == parseInt(vertexId) ||
        graph.edges[zkp.selectedEdgeIndex].v2 == parseInt(vertexId));

    const itemClass = isSelected
      ? "commitment-item commitment-item-selected"
      : "commitment-item";

    if (isRevealed) {
      html += `<div class="${itemClass}">
                        <div><strong>Vertex ${vertexId}:</strong></div>
                        <div class="commitment-hash">${commitment}</div>
                     </div>`;
    } else {
      html += `<div class="${itemClass}">
                        <div><strong>Vertex ${vertexId}:</strong></div>
                        <div class="commitment-hash">${commitment}</div>
                     </div>`;
    }
  }

  commitmentsList.innerHTML = html;
}

async function showCommitmentVerification(
  vertexId,
  color,
  nonce,
  storedCommitment
) {
  const colorNames = ["Red", "Teal", "Yellow"];
  const inputString = `${vertexId}-${color}-${nonce}`;
  const calculatedHash = await graph.sha256Hash(inputString);
  const isValid = calculatedHash === storedCommitment;

  // Show the verification section
  document.getElementById("commitmentVerificationSection").style.display =
    "block";

  // Step 1: Input Data
  document.getElementById(
    "verificationInput"
  ).textContent = `Vertex ID: ${vertexId}
Color: ${color} (${colorNames[color]})
Nonce: ${nonce}
Combined: "${inputString}"`;

  // Step 2: Hash Calculation
  document.getElementById(
    "verificationCalculation"
  ).textContent = `SHA-256("${inputString}")

Calculating SHA-256 hash...
Result: ${calculatedHash} (first 16 chars)`;

  // Step 3: Comparison
  document.getElementById(
    "verificationComparison"
  ).textContent = `Calculated: ${calculatedHash}
Stored:     ${storedCommitment}

Match: ${isValid ? "✓ YES - Commitment verified!" : "✗ NO - Commitment failed!"}

${
  isValid
    ? "This proves we knew the color before any challenge!"
    : "This indicates potential cheating or data corruption."
}`;
}

function logVerification(message) {
  const timestamp = new Date().toLocaleTimeString();
  const logMessage = `[${timestamp}] ${message}\n`;

  const log = document.getElementById("verificationLog");
  log.innerHTML += logMessage;
  log.scrollTop = log.scrollHeight;
}

const autoModeElement = document.getElementById("autoMode");
if (!autoModeElement) {
  console.error("autoMode element not found!");
} else {
  autoModeElement.addEventListener("click", () => {
    if (autoMode.active) {
      stopAutoMode();
    } else {
      startAutoMode();
    }
  });
}

document.getElementById("hideVertices").addEventListener("click", async () => {
  await zkp.scrambleColors();
  zkp.hideAllVertices();
  renderer.render();
  updateUI();
  logVerification("All revealed vertices hidden, colors scrambled");
});

document.getElementById("revealAll").addEventListener("click", () => {
  zkp.revealAllVertices();
  renderer.render();
  updateUI();
  logVerification("All vertex colors revealed");
});

document.getElementById("resetGraph").addEventListener("click", async () => {
  // Stop auto mode if active
  if (autoMode.active) {
    stopAutoMode();
  }

  // Use default node count of 8
  const nodeCount = 8;
  await zkp.resetToNewGraph(nodeCount);
  renderer.render();
  updateUI();
  // Hide verification details when resetting
  document.getElementById("commitmentVerificationSection").style.display =
    "none";
  logVerification(`Generated new committed graph with ${nodeCount} vertices`);
});

document.getElementById("hideVerification").addEventListener("click", () => {
  document.getElementById("commitmentVerificationSection").style.display =
    "none";
});

// Manual SHA-256 verification handler
document.getElementById("calculateHash").addEventListener("click", async () => {
  const vertexId = document.getElementById("manualVertexId").value;
  const color = document.getElementById("manualColor").value;
  const nonce = document.getElementById("manualNonce").value.trim();
  const commitment = document.getElementById("manualCommitment").value.trim();

  if (!vertexId || !color || !nonce) {
    document.getElementById("manualResult").textContent =
      "Please fill in Vertex ID, Color, and Nonce fields";
    return;
  }

  const maxVertexId = Math.max(0, graph.vertices.length - 1);
  if (parseInt(vertexId) < 0 || parseInt(vertexId) > maxVertexId) {
    document.getElementById(
      "manualResult"
    ).textContent = `Vertex ID must be between 0 and ${maxVertexId}`;
    return;
  }

  if (parseInt(color) < 0 || parseInt(color) > 2) {
    document.getElementById("manualResult").textContent =
      "Color must be 0, 1, or 2";
    return;
  }

  try {
    const inputString = `${vertexId}-${color}-${nonce}`;
    const hash = await graph.sha256Hash(inputString);
    const colorNames = ["Red", "Teal", "Yellow"];

    let result = `<strong>SHA-256 Hash:</strong> ${hash}`;

    if (commitment) {
      const isMatch = hash === commitment;
      result += `

<strong>Comparison:</strong>
Calculated: ${hash}
Commitment: ${commitment}

<strong>Result:</strong> ${
        isMatch
          ? "✓ MATCH - Commitment verified!"
          : "✗ NO MATCH - Verification failed"
      }`;

      if (isMatch) {
        result += `
<em>This proves the vertex ${vertexId} was committed to color ${parseInt(
          color
        )} (${colorNames[parseInt(color)]}) with nonce "${nonce}"</em>`;
      }
    }

    document.getElementById("manualResult").innerHTML = result;
  } catch (error) {
    document.getElementById("manualResult").textContent =
      "Error calculating hash: " + error.message;
  }
});

// Graph canvas mouse move handler for hover effects
document
  .getElementById("graphCanvas")
  .addEventListener("mousemove", (event) => {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const hoveredEdge = renderer.getClickedEdge(x, y);
    const previousHovered = renderer.hoveredEdgeIndex;

    renderer.setHoveredEdge(hoveredEdge);

    // Only re-render if hover state changed
    if (previousHovered !== hoveredEdge) {
      renderer.render();

      // Change cursor style
      if (hoveredEdge !== null) {
        event.target.style.cursor = "pointer";
      } else {
        event.target.style.cursor = "default";
      }
    }
  });

// Graph canvas mouse leave handler to clear hover
document.getElementById("graphCanvas").addEventListener("mouseleave", () => {
  const previousHovered = renderer.hoveredEdgeIndex;
  renderer.setHoveredEdge(null);

  if (previousHovered !== null) {
    renderer.render();
  }

  document.getElementById("graphCanvas").style.cursor = "default";
});

// Graph canvas click handler
document
  .getElementById("graphCanvas")
  .addEventListener("click", async (event) => {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clickedEdge = renderer.getClickedEdge(x, y);
    if (clickedEdge !== null && !autoMode.active) {
      // If we already have an edge selected, clicking a new edge starts a new verification
      if (zkp.selectedEdgeIndex !== null) {
        await zkp.scrambleColors();
        zkp.hideAllVertices();
      }

      const success = zkp.selectEdge(clickedEdge);
      if (success) {
        renderer.render();

        const verification = zkp.verify();
        updateUI(); // Update UI after verification to get updated confidence
        if (verification) {
          const colorNames = ["Red", "Teal", "Yellow"];
          const v1 = verification.vertices[0];
          const v2 = verification.vertices[1];
          const color1Name = colorNames[verification.colors[0]];
          const color2Name = colorNames[verification.colors[1]];

          const stats = zkp.getStats();

          // Verify cryptographic commitments
          const commitment1Verified = graph.verifyCommitment(
            v1,
            verification.colors[0],
            graph.nonces[v1]
          );
          const commitment2Verified = graph.verifyCommitment(
            v2,
            verification.colors[1],
            graph.nonces[v2]
          );

          logVerification(
            `Cryptographic verification: V${v1} ${
              commitment1Verified ? "✓" : "✗"
            } V${v2} ${commitment2Verified ? "✓" : "✗"}`
          );

          // Show detailed verification process
          await showCommitmentVerification(
            v1,
            verification.colors[0],
            graph.nonces[v1],
            graph.commitments[v1]
          );

          if (verification.isValid) {
            logVerification(
              `✓ Edge V${v1} (${color1Name}) ↔ V${v2} (${color2Name}) has different colored endpoints - Valid!`
            );
            logVerification(
              `Theoretical confidence: ${stats.confidence}% (formula: 1-(1-1/${graph.edges.length})^${stats.rounds})`
            );
          } else {
            logVerification(
              `✗ Edge V${v1} (${color1Name}) ↔ V${v2} (${color2Name}) has same colored endpoints - Invalid!`
            );
            logVerification(
              `Theoretical confidence: ${stats.confidence}% (formula: 1-(1-1/${graph.edges.length})^${stats.rounds})`
            );
          }

          // Keep edge selected until user clicks elsewhere or selects a new edge
        }
      }
    } else if (!autoMode.active) {
      // Clicked on empty space - scramble colors if we have an edge selected
      if (zkp.selectedEdgeIndex !== null) {
        await zkp.scrambleColors();
        zkp.hideAllVertices();
        renderer.render();
        updateUI();
        logVerification("Colors scrambled for next verification");
      }
    }
  });

(async () => {
  graph.generateRandomGraph();
  graph.colorGraph();

  // Set hidden state before creating commitments
  graph.hiddenColors = true;
  graph.committed = false;

  await graph.createCommitments();
  graph.committed = true;

  renderer.render();
  updateUI();
  updateCommitmentsDisplay(); // Ensure commitments are displayed immediately
  logVerification(
    "Application initialized with cryptographically committed graph (SHA-256 hashes)"
  );
})();
