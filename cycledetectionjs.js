function toggleCycleAbout() {
  const overlay = document.getElementById('cycleAboutOverlay');
  overlay.style.display = (overlay.style.display === 'none' || overlay.style.display === '') ? 'block' : 'none';
}

const notificationBox = document.querySelector('.notification');
const notificationCloseButton = document.querySelector('.notification-close');

notificationBox.style.display = 'block';

notificationCloseButton.addEventListener('click', () => {
  notificationBox.classList.add('hide');
  setTimeout(() => {
    notificationBox.style.display = 'none';
  }, 300);
});

let graph = {
  vertices: [],
  edges: [],
};

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let draggingVertex = null;
let offsetX = 0;
let offsetY = 0;

let isEdgeMode = false;
let edgeFromVertex = null;

let history = [];
let historyIndex = -1;

function drawGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const radius = 20;
  const arrowSize = 10;

  graph.edges.forEach((edge) => {
    const dx = edge.to.x - edge.from.x;
    const dy = edge.to.y - edge.from.y;
    const dist = Math.hypot(dx, dy);

    if (dist === 0) return;

    const ux = dx / dist;
    const uy = dy / dist;

    const startX = edge.from.x + ux * radius;
    const startY = edge.from.y + uy * radius;

    const lineEndX = edge.to.x - ux * (radius + arrowSize / 2);
    const lineEndY = edge.to.y - uy * (radius + arrowSize / 2);

    const arrowTipX = edge.to.x - ux * radius;
    const arrowTipY = edge.to.y - uy * radius;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(lineEndX, lineEndY);
    ctx.strokeStyle = 'black';
    ctx.stroke();

    let angle = Math.atan2(dy, dx);

    ctx.beginPath();
    ctx.moveTo(arrowTipX, arrowTipY);
    ctx.lineTo(
      arrowTipX - arrowSize * Math.cos(angle - Math.PI / 6),
      arrowTipY - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      arrowTipX - arrowSize * Math.cos(angle + Math.PI / 6),
      arrowTipY - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    ctx.lineTo(arrowTipX, arrowTipY);
    ctx.fillStyle = 'black';
    ctx.fill();
  });

  graph.vertices.forEach((vertex) => {
    ctx.beginPath();
    ctx.arc(vertex.x, vertex.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#4cbb17';
    ctx.fill();

    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.fillText(vertex.label, vertex.x, vertex.y);
  });
}

setInterval(drawGraph, 100);

canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  graph.vertices.forEach((vertex) => {
    if (Math.hypot(x - vertex.x, y - vertex.y) < 20) {
      draggingVertex = vertex;
      offsetX = x - vertex.x;
      offsetY = y - vertex.y;
      saveHistory();
    }
  });
});

canvas.addEventListener('mousemove', (e) => {
  if (draggingVertex) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    draggingVertex.x = x - offsetX;
    draggingVertex.y = y - offsetY;
    // Avoid calling saveHistory repeatedly here
  }

  if (isEdgeMode && edgeFromVertex) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGraph();

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(edgeFromVertex.x, edgeFromVertex.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = 'black';
    ctx.stroke();

    let angle = Math.atan2(y - edgeFromVertex.y, x - edgeFromVertex.x);
    let arrowSize = 10;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - arrowSize * Math.cos(angle - Math.PI / 6), y - arrowSize * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x - arrowSize * Math.cos(angle + Math.PI / 6), y - arrowSize * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(x, y);
    ctx.fillStyle = 'black';
    ctx.fill();
  }
});

canvas.addEventListener('mouseup', (e) => {
  if (draggingVertex) {
    saveHistory();  // Save once on drag end
  }
  draggingVertex = null;
});

canvas.addEventListener('click', (e) => {
  if (isEdgeMode) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    graph.vertices.forEach((vertex) => {
      if (Math.hypot(x - vertex.x, y - vertex.y) < 20) {
        if (!edgeFromVertex) {
          edgeFromVertex = vertex;
        } else {
          graph.edges.push({ from: edgeFromVertex, to: vertex });
          edgeFromVertex = null;
          saveHistory();
        }
      }
    });
  }
});

// Use a selectedVertex variable to store vertex selected for deletion
let selectedVertex = null;
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  selectedVertex = graph.vertices.find(v => Math.hypot(x - v.x, y - v.y) < 20);
});

document.getElementById('edge-btn').addEventListener('click', () => {
  isEdgeMode = !isEdgeMode;
  edgeFromVertex = null;
});

document.getElementById('vertex-btn').addEventListener('click', () => {
  const rect = canvas.getBoundingClientRect();
  const x = rect.width / 2;
  const y = rect.height / 2;

  const label = prompt("Enter vertex label:");
  if (label && label.trim() !== '') {
    graph.vertices.push({ x, y, label: label.trim() });
    saveHistory();
  }
});

function saveHistory() {
  historyIndex++;
  history = history.slice(0, historyIndex);
  const graphState = {
    vertices: graph.vertices.map(vertex => ({ x: vertex.x, y: vertex.y, label: vertex.label })),
    edges: graph.edges.map(edge => ({
      from: graph.vertices.indexOf(edge.from),
      to: graph.vertices.indexOf(edge.to),
    })),
  };
  history.push(graphState);
}

document.getElementById('undo-btn').addEventListener('click', () => {
  if (historyIndex > 0) {
    historyIndex--;
    const graphState = history[historyIndex];
    graph.vertices = graphState.vertices.map(v => ({ x: v.x, y: v.y, label: v.label }));
    graph.edges = graphState.edges.map(e => ({
      from: graph.vertices[e.from],
      to: graph.vertices[e.to],
    }));
  }
});

document.getElementById('reset-btn').addEventListener('click', () => {
  history = [];
  historyIndex = -1;
  graph = { vertices: [], edges: [] };
  selectedVertex = null;
});

document.getElementById('delete-btn').addEventListener('click', () => {
  if (isEdgeMode && edgeFromVertex) {
    graph.edges = graph.edges.filter(edge => edge.from !== edgeFromVertex && edge.to !== edgeFromVertex);
    edgeFromVertex = null;
    saveHistory();
  } else if (selectedVertex) {
    graph.vertices = graph.vertices.filter(vertex => vertex !== selectedVertex);
    graph.edges = graph.edges.filter(edge => edge.from !== selectedVertex && edge.to !== selectedVertex);
    selectedVertex = null;
    saveHistory();
  }
});

// The solve button and graph algorithms remain unchanged
document.getElementById('solve-btn').addEventListener('click', () => {
  const edges = graph.edges.map(edge => [
    graph.vertices.indexOf(edge.from),
    graph.vertices.indexOf(edge.to),
  ]);

  const isCyclic = detectCycle(graph.vertices.length, edges);
  document.getElementById('cycle').checked = isCyclic;

  const isEulerPath = isEulerianPath(graph.vertices.length, edges);
  document.getElementById('euler-path').checked = isEulerPath;

  const isEulerCircuit = isEulerianCircuit(graph.vertices.length, edges);
  document.getElementById('euler-circuit').checked = isEulerCircuit;

  const isHamiltonianPath = isHamiltonianPath(graph.vertices.length, edges);
  document.getElementById('hamiltonian-path').checked = isHamiltonianPath;

  const isHamiltonianCircuit = isHamiltonianCircuit(graph.vertices.length, edges);
  document.getElementById('hamiltonian-circuit').checked = isHamiltonianCircuit;
});

function detectCycle(V, edges) {
    function isCyclicUtil(adj, u, visited, recStack) {
        if (recStack[u]) return true;
        if (visited[u]) return false;

        visited[u] = true;
        recStack[u] = true;

        for (let v of adj[u]) {
            if (isCyclicUtil(adj, v, visited, recStack)) return true;
        }

        recStack[u] = false;
        return false;
    }

    function constructAdj(V, edges) {
        let adj = Array.from({ length: V }, () => []);
        for (let [u, v] of edges) {
            adj[u].push(v);
        }
        return adj;
    }

    let adj = constructAdj(V, edges);
    let visited = new Array(V).fill(false);
    let recStack = new Array(V).fill(false);

    for (let i = 0; i < V; i++) {
        if (!visited[i] && isCyclicUtil(adj, i, visited, recStack)) return true;
    }

    return false;
}

function isEulerianPath(V, edges) {
    function constructAdj(V, edges) {
        let adj = Array.from({ length: V }, () => []);
        for (let [u, v] of edges) {
            adj[u].push(v);
        }
        return adj;
    }

    let adj = constructAdj(V, edges);
    let inDegree = new Array(V).fill(0);
    let outDegree = new Array(V).fill(0);

    for (let [u, v] of edges) {
        outDegree[u]++;
        inDegree[v]++;
    }

    let start = 0, end = 0;
    for (let i = 0; i < V; i++) {
        if (outDegree[i] - inDegree[i] === 1) start++;
        else if (inDegree[i] - outDegree[i] === 1) end++;
        else if (outDegree[i] !== inDegree[i]) return false;
    }

    return (start === 1 && end === 1) || (start === 0 && end === 0);
}

function isEulerianCircuit(V, edges) {
    function constructAdj(V, edges) {
        let adj = Array.from({ length: V }, () => []);
        for (let [u, v] of edges) {
            adj[u].push(v);
        }
        return adj;
    }

    let adj = constructAdj(V, edges);
    let inDegree = new Array(V).fill(0);
    let outDegree = new Array(V).fill(0);

    for (let [u, v] of edges) {
        outDegree[u]++;
        inDegree[v]++;
    }

    for (let i = 0; i < V; i++) {
        if (outDegree[i] !== inDegree[i]) return false;
    }

    let visited = new Array(V).fill(false);
    function dfs(u) {
        visited[u] = true;
        for (let v of adj[u]) {
            if (!visited[v]) dfs(v);
        }
    }

    dfs(0);
    for (let i = 0; i < V; i++) {
        if (!visited[i]) return false;
    }

    return true;
}

function isHamiltonianPath(V, edges) {
    function constructAdj(V, edges) {
        let adj = Array.from({ length: V }, () => []);
        for (let [u, v] of edges) {
            adj[u].push(v);
        }
        return adj;
    }

    let adj = constructAdj(V, edges);

    function isHamiltonianPathUtil(u, path) {
        if (path.length === V) return true;

        for (let v of adj[u]) {
            if (!path.includes(v)) {
                path.push(v);
                if (isHamiltonianPathUtil(v, path)) return true;
                path.pop();
            }
        }

        return false;
    }

    for (let i = 0; i < V; i++) {
        if (isHamiltonianPathUtil(i, [i])) return true;
    }

    return false;
}

function isHamiltonianCircuit(V, edges) {
    function constructAdj(V, edges) {
        let adj = Array.from({ length: V }, () => []);
        for (let [u, v] of edges) {
            adj[u].push(v);
        }
        return adj;
    }

    let adj = constructAdj(V, edges);

    function isHamiltonianCircuitUtil(u, path) {
        if (path.length === V) {
            for (let v of adj[u]) {
                if (v === path[0]) return true;
            }
            return false;
        }

        for (let v of adj[u]) {
            if (!path.includes(v)) {
                path.push(v);
                if (isHamiltonianCircuitUtil(v, path)) return true;
                path.pop();
            }
        }

        return false;
    }

    for (let i = 0; i < V; i++) {
        if (isHamiltonianCircuitUtil(i, [i])) return true;
    }

    return false;
}
