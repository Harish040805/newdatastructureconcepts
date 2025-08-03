  let huffmanTree = null;
  let huffmanCodes = {};
  let treeBuilt = false;

  function buildHuffmanTree(symbols) {
    const nodes = symbols.map(({ char, prob }) => ({
      char,
      prob: parseFloat(prob),
      left: null,
      right: null
    }));

    while (nodes.length > 1) {
      nodes.sort((a, b) => a.prob - b.prob);
      const left = nodes.shift();
      const right = nodes.shift();
      const merged = {
        char: left.char + right.char,
        prob: left.prob + right.prob,
        left,
        right
      };
      nodes.push(merged);
    }
    return nodes[0];
  }

  function generateCodes(node, path = "", codes = {}) {
    if (!node.left && !node.right) {
      codes[node.char] = path || "0";
      return codes;
    }
    if (node.left) generateCodes(node.left, path + "0", codes);
    if (node.right) generateCodes(node.right, path + "1", codes);
    return codes;
  }

  function readPanelSymbols() {
    const chars = charRow.querySelectorAll("input");
    const probs = probRow.querySelectorAll("input");
    const symbols = [];
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i].value.trim();
      const probRaw = probs[i].value.trim();
      const prob = parseFloat(probRaw);
      if (char !== "" && !isNaN(prob)) {
        symbols.push({ char, prob });
      }
    }
    return symbols;
  }

  function validateSymbols(symbols) {
    if (symbols.length === 0) {
      alert("Please enter at least one symbol with frequency.");
      return false;
    }
    const charsSet = new Set();
    for (const { char, prob } of symbols) {
      if (prob <= 0) {
        alert(`Frequency for symbol '${char}' must be positive.`);
        return false;
      }
      if (charsSet.has(char)) {
        alert(`Duplicate symbol '${char}' detected. Symbols must be unique.`);
        return false;
      }
      charsSet.add(char);
    }
    return true;
  }

  function normalizeSymbols(symbols) {
    const total = symbols.reduce((sum, s) => sum + s.prob, 0);
    return symbols.map(s => ({
      char: s.char,
      prob: s.prob / total
    }));
  }

  function updateDisplayTable() {
    if (!treeBuilt) return;
    const symbols = readPanelSymbols();
    if (!validateSymbols(symbols)) {
      clearTableRows();
      return;
    }
    const normalized = normalizeSymbols(symbols);
    const data = normalized.map(s => ({
      char: s.char,
      prob: s.prob,
      code: huffmanCodes[s.char] || "—"
    }));
    data.sort((a, b) => b.prob - a.prob);
    clearTableRows();
    for (const { char, code } of data) {
      const row = table.tBodies[0].insertRow();
      row.insertCell().textContent = char;
      row.insertCell().textContent = code;
       const codeLength = (code === "—") ? "—" : code.length;
       row.insertCell().textContent = codeLength;
    }
  }

  function clearTableRows() {
    const tbody = table.tBodies[0];
    while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
  }

  function removePanelColumn(index) {
    const charInputs = charRow.querySelectorAll("input");
    const probInputs = probRow.querySelectorAll("input");
    if (charInputs[index]) charRow.removeChild(charInputs[index]);
    if (probInputs[index]) probRow.removeChild(probInputs[index]);
    buildTreeAndCodes();
    updateDisplayTable();
  }

  function buildTreeAndCodes() {
    const symbols = readPanelSymbols();
    if (!validateSymbols(symbols)) {
      huffmanTree = null;
      huffmanCodes = {};
      treeBuilt = false;
      return false;
    }
    const normalized = normalizeSymbols(symbols);
    huffmanTree = buildHuffmanTree(normalized);
    huffmanCodes = generateCodes(huffmanTree);
    treeBuilt = true;
    return true;
  }

  function encodeText(text) {
    let encoded = '';
    for (let char of text) {
      if (!(char in huffmanCodes)) return null;
      encoded += huffmanCodes[char];
    }
    return encoded;
  }

  function decodeBinary(binary) {
    if (!huffmanTree) return null;
    let result = '';
    let node = huffmanTree;
    for (let i = 0; i < binary.length; i++) {
      const bit = binary[i];
      if (bit !== '0' && bit !== '1') return null;
      node = bit === '0' ? node.left : node.right;
      if (!node) return null;
      if (!node.left && !node.right) {
        result += node.char;
        node = huffmanTree;
      }
    }
    if (node !== huffmanTree) return null;
    return result;
  }

  const encodeInput = document.getElementById("encodeInput");
  const decodeInput = document.getElementById("decodeInput");

  encodeInput.addEventListener("input", () => {
    if (!treeBuilt) {
      if (!buildTreeAndCodes()) {
        decodeInput.value = "";
        return;
      }
    }
    const input = encodeInput.value.trim();
    if (input === "") {
      decodeInput.value = "";
      return;
    }
    const encoded = encodeText(input);
    decodeInput.value = encoded !== null ? encoded : "Invalid input!";
  });

  decodeInput.addEventListener("input", () => {
    if (!treeBuilt) {
      if (!buildTreeAndCodes()) {
        encodeInput.value = "";
        return;
      }
    }
    const input = decodeInput.value.trim();
    if (input === "") {
      encodeInput.value = "";
      return;
    }
    const decoded = decodeBinary(input);
    encodeInput.value = decoded !== null ? decoded : "Invalid or incomplete binary!";
  });

  const inputBtn = document.getElementById("inputBtn");
  const buildBtn = document.getElementById("buildHuffmanBtn");
  const encryBtn = document.getElementById("encryDecryBtn");
  const resetBtn = document.getElementById("resetBtn");

  const inputInterface = document.getElementById("inputInterface");
  const closeInput = document.getElementById("closeInput");

  const encryInterface = document.getElementById("encryInterface");
  const closeEncry = document.getElementById("closeEncry");

  const addColumnBtn = document.getElementById("addColumnBtn");
  const charRow = document.getElementById("charRow");
  const probRow = document.getElementById("probRow");
  const table = document.getElementById("dynamicTable");
  
  const deleteRow = document.getElementById("deleteRow");

  inputBtn.addEventListener("click", () => {
    if (encryInterface.classList.contains("open")) {
      alert("Close the Encry/Decry panel first!");
      return;
    }
    inputInterface.classList.add("open");
    updateDisplayTable();
  });

  closeInput.addEventListener("click", () => {
    inputInterface.classList.remove("open");
  });

  encryBtn.addEventListener("click", () => {
    if (inputInterface.classList.contains("open")) {
      alert("Close the Input panel first!");
      return;
    }
    encryInterface.classList.add("open");
  });

  closeEncry.addEventListener("click", () => {
    encryInterface.classList.remove("open");
  });

addColumnBtn.addEventListener("click", () => {
  const charInput = document.createElement("input");
  charInput.type = "text";
  charInput.placeholder = "a, b, c...";
  charInput.addEventListener("input", () => {
    treeBuilt = false;
    updateDisplayTable();
  });

  const probInput = document.createElement("input");
  probInput.type = "number";
  probInput.min = "0";
  probInput.step = "any";
  probInput.placeholder = "1, 2, 3...";
  probInput.addEventListener("input", () => {
    treeBuilt = false;
    updateDisplayTable();
  });

  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.className = "delete-btn";

  const index = charRow.children.length - 1; // exclude label

  delBtn.onclick = () => {
    charRow.removeChild(charRow.children[index + 1]);
    probRow.removeChild(probRow.children[index + 1]);
    deleteRow.removeChild(deleteRow.children[index + 1]);
    updateDisplayTable();
  };

  const charWrapper = document.createElement("div");
  charWrapper.style.display = "flex";
  charWrapper.style.alignItems = "center";
  charWrapper.style.gap = "6px";
  charWrapper.style.marginBottom = "6px";
  charWrapper.appendChild(charInput);

  const probWrapper = document.createElement("div");
  probWrapper.style.display = "flex";
  probWrapper.style.alignItems = "center";
  probWrapper.style.gap = "6px";
  probWrapper.style.marginBottom = "6px";
  probWrapper.appendChild(probInput);

  const delWrapper = document.createElement("div");
  delWrapper.style.display = "flex";
  delWrapper.style.alignItems = "center";
  delWrapper.style.gap = "6px";
  delWrapper.style.marginBottom = "6px";
  delWrapper.appendChild(delBtn);

  charRow.appendChild(charWrapper);
  probRow.appendChild(probWrapper);
  deleteRow.appendChild(delWrapper);

  updateDisplayTable();
});


  buildBtn.addEventListener("click", () => {
    const symbols = readPanelSymbols();
    if (!validateSymbols(symbols)) return;
    huffmanTree = null;
    huffmanCodes = {};
    treeBuilt = false;
    if (!buildTreeAndCodes()) return;
    updateDisplayTable();
    alert("Huffman Tree built successfully!");
  });

  resetBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset the entire page?")) {
      location.reload();
    }
  });

  addColumnBtn.click();
  
function calculateTotalBits() {
  const symbols = readPanelSymbols();
  if (!validateSymbols(symbols)) return;

  const normalized = normalizeSymbols(symbols);
  let totalBits = 0;

  for (const { char, prob } of normalized) {
    const code = huffmanCodes[char];
    if (code) {
      totalBits += prob * code.length;
    }
  }

  alert("Total number of bits (weighted): " + totalBits.toFixed(4));
}
