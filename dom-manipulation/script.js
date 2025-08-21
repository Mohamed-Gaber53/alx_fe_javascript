// ========================
// Quotes Array
// ========================
let quotes = [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Don’t let yesterday take up too much of today.", category: "Life" },
    { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" }
  ];
  
  // ========================
  // DOM Elements
  // ========================
  let quoteDisplay = document.getElementById("quoteDisplay");
  let newQuoteBtn = document.getElementById("newQuote");
  let container = document.getElementById("container");
  let exportBtn = document.getElementById("exportQuotes");
  let importFileInput = document.getElementById("importFile");
  let categoryFilter = document.getElementById("categoryFilter");
  
  // ========================
  // Local Storage Helpers
  // ========================
  function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
  }
  
  function loadQuotes() {
    const stored = localStorage.getItem("quotes");
    if (stored) quotes = JSON.parse(stored);
  }
  
  // ========================
  // Show Random Quote
  // ========================
  function showRandomQuote() {
    let filtered = getFilteredQuotes();
    if (filtered.length === 0) {
      quoteDisplay.innerText = "No quotes available. Please add one!";
      return;
    }
    let randomIndex = Math.floor(Math.random() * filtered.length);
    let randomQuote = filtered[randomIndex];
    quoteDisplay.innerText = `"${randomQuote.text}" — (${randomQuote.category})`;
  
    sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
  }
  
  // ========================
  // Add New Quote
  // ========================
  function addQuote() {
    let newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();
    let newQuoteText = document.getElementById("newQuoteText").value.trim();
  
    if (newQuoteCategory && newQuoteText) {
      let newQuoteObj = { text: newQuoteText, category: newQuoteCategory };
      quotes.push(newQuoteObj);
      saveQuotes();
      message("New quote added successfully!", "success");
  
      document.getElementById("newQuoteText").value = "";
      document.getElementById("newQuoteCategory").value = "";
      populateCategories();
    } else {
      message("Please enter both quote and category!", "error");
    }
  }
  
  // ========================
  // Create Add Quote Form
  // ========================
  function createAddQuoteForm() {
    let formContainer = document.createElement("div");
    formContainer.classList.add("formContainer");
  
    let title = document.createElement("h2");
    title.innerText = "Add a New Quote";
  
    let inputQuote = document.createElement("input");
    inputQuote.id = "newQuoteText";
    inputQuote.type = "text";
    inputQuote.placeholder = "Enter a new quote";
  
    let inputCategory = document.createElement("input");
    inputCategory.id = "newQuoteCategory";
    inputCategory.type = "text";
    inputCategory.placeholder = "Enter quote category";
  
    let addBtn = document.createElement("button");
    addBtn.id = "addQuote";
    addBtn.innerText = "Add Quote";
  
    formContainer.appendChild(title);
    formContainer.appendChild(inputQuote);
    formContainer.appendChild(inputCategory);
    formContainer.appendChild(addBtn);
  
    container.appendChild(formContainer);
  
    addBtn.addEventListener("click", addQuote);
  }
  createAddQuoteForm();
  
  // ========================
  // Export / Import
  // ========================
  function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    a.click();
  
    URL.revokeObjectURL(url);
  }
  
  function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function (e) {
      try {
        const importedQuotes = JSON.parse(e.target.result);
        if (Array.isArray(importedQuotes)) {
          quotes.push(...importedQuotes);
          saveQuotes();
          message("Quotes imported successfully!", "success");
          populateCategories();
        } else {
          message("Invalid file format!", "error");
        }
      } catch (err) {
        message("Error reading file!", "error");
      }
    };
    fileReader.readAsText(event.target.files[0]);
  }
  
  // ========================
  // Categories + Filtering
  // ========================
  function populateCategories() {
    let categories = [...new Set(quotes.map(q => q.category))];
    categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
    categories.forEach(cat => {
      let opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      categoryFilter.appendChild(opt);
    });
  
    let savedFilter = localStorage.getItem("selectedCategory");
    if (savedFilter) categoryFilter.value = savedFilter;
  }
  
  function getFilteredQuotes() {
    let selected = categoryFilter.value;
    if (selected === "all") return quotes;
    return quotes.filter(q => q.category === selected);
  }
  
  function filterQuotes() {
    localStorage.setItem("selectedCategory", categoryFilter.value);
    showRandomQuote();
  }
  
  // ========================
  // Popup Message
  // ========================
  function message(msg, type) {
    let msgContainer = document.createElement("div");
    msgContainer.classList.add("msgContainer", type);
  
    let msgP = document.createElement("p");
    msgP.classList.add("msgText");
    msgP.innerText = msg;
  
    let closeBtn = document.createElement("span");
    closeBtn.innerHTML = "&times;";
    closeBtn.classList.add("closeBtn");
    closeBtn.onclick = function () {
      msgContainer.remove();
    };
  
    msgContainer.appendChild(msgP);
    msgContainer.appendChild(closeBtn);
    document.body.appendChild(msgContainer);
  
    setTimeout(() => msgContainer.remove(), 4000);
  }
  
  // ========================
  // Event Listeners
  // ========================
  newQuoteBtn.addEventListener("click", showRandomQuote);
  exportBtn.addEventListener("click", exportToJsonFile);
  importFileInput.addEventListener("change", importFromJsonFile);
  
  // ========================
  // Init
  // ========================
  loadQuotes();
  populateCategories();
  
  let lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    let q = JSON.parse(lastQuote);
    quoteDisplay.innerText = `"${q.text}" — (${q.category})`;
  }
  
  // ===================================================
  // Server Sync + Conflicts
  // ===================================================
  const SERVER_ENDPOINT = 'https://jsonplaceholder.typicode.com/posts';
  const SYNC_INTERVAL_MS = 30000;
  let lastSyncAt = null;
  let syncConflicts = [];
  
  // Create Sync Controls
  (function createSyncControls() {
    const controls = document.createElement('div');
    controls.style.marginTop = '16px';
    controls.style.display = 'grid';
    controls.style.gap = '8px';
  
    const syncBtn = document.createElement('button');
    syncBtn.id = 'syncNowBtn';
    syncBtn.textContent = 'Sync Now';
    syncBtn.addEventListener('click', runSyncCycle);
  
    const status = document.createElement('div');
    status.id = 'syncStatus';
    status.style.fontSize = '12px';
    status.style.color = '#666';
    status.textContent = 'Last sync: never';
  
    const resolveBtn = document.createElement('button');
    resolveBtn.id = 'resolveConflictsBtn';
    resolveBtn.textContent = 'Resolve Conflicts';
    resolveBtn.style.display = 'none';
    resolveBtn.addEventListener('click', openConflictResolver);
  
    controls.appendChild(syncBtn);
    controls.appendChild(resolveBtn);
    controls.appendChild(status);
    container.appendChild(controls);
  })();
  
  // Helpers
  function saveQuotesSafe() {
    try { saveQuotes(); } catch(e) {
      localStorage.setItem('quotes', JSON.stringify(quotes));
    }
  }
  function ensureLocalId(q) {
    if (!q.id) q.id = 'local-' + Date.now() + '-' + Math.random().toString(16).slice(2);
    if (!q.updatedAt) q.updatedAt = Date.now();
  }
  function toServerPayload(q) {
    return { title: q.category || 'General', body: q.text || '', userId: 1 };
  }
  function fromServerItem(item) {
    return { text: item.body || '', category: item.title || 'General', remoteId: item.id, id: 'remote-' + item.id, updatedAt: Date.now() };
  }
  async function fetchServerQuotes() {
    const res = await fetch(`${SERVER_ENDPOINT}?_limit=10`);
    if (!res.ok) throw new Error('Fetch failed');
    const data = await res.json();
    return data.map(fromServerItem);
  }
  async function pushLocalPendingQuotes() {
    let pushed = 0;
    for (let q of quotes) {
      if (!q.remoteId) {
        ensureLocalId(q);
        try {
          const res = await fetch(SERVER_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(toServerPayload(q)) });
          const created = await res.json();
          if (created && created.id) {
            q.remoteId = created.id;
            q.id = 'remote-' + created.id;
            q.updatedAt = Date.now();
            pushed++;
          }
        } catch (_) {}
      }
    }
    if (pushed > 0) saveQuotesSafe();
    return pushed;
  }
  function mergeServerQuotes(serverQuotes) {
    let added = 0, updated = 0, conflictsFound = 0;
    for (const s of serverQuotes) {
      const idx = quotes.findIndex(q => q.remoteId === s.remoteId);
      if (idx === -1) {
        quotes.push(s); added++; continue;
      }
      const local = quotes[idx];
      if (local.text !== s.text || local.category !== s.category) {
        conflictsFound++;
        syncConflicts.push({ local: { ...local }, server: { ...s }, index: idx });
        quotes[idx] = { ...local, ...s, updatedAt: Date.now() };
        updated++;
      }
    }
    if (added || updated) saveQuotesSafe();
    const resolveBtn = document.getElementById('resolveConflictsBtn');
    if (resolveBtn) resolveBtn.style.display = syncConflicts.length ? 'block' : 'none';
    return { added, updated, conflictsFound };
  }
  async function runSyncCycle() {
    let statsMsg = [];
    try {
      const pushed = await pushLocalPendingQuotes();
      if (pushed) statsMsg.push(`pushed ${pushed}`);
      const serverItems = await fetchServerQuotes();
      const { added, updated, conflictsFound } = mergeServerQuotes(serverItems);
      if (added) statsMsg.push(`added ${added}`);
      if (updated) statsMsg.push(`updated ${updated}`);
      if (conflictsFound) statsMsg.push(`conflicts ${conflictsFound}`);
      lastSyncAt = new Date();
      const status = document.getElementById('syncStatus');
      if (status) status.textContent = `Last sync: ${lastSyncAt.toLocaleString()}`;
      message(`Sync complete: ${statsMsg.join(', ') || 'no changes'}`, 'success');
    } catch (err) {
      message('Sync failed: ' + err.message, 'error');
    }
  }
  setInterval(runSyncCycle, SYNC_INTERVAL_MS);
  
  // Hook Add Quote
  (function hookAddQuote() {
    const originalAddQuote = typeof addQuote === 'function' ? addQuote : null;
    if (!originalAddQuote) return;
    window.addQuote = function wrappedAddQuote() {
      const beforeLen = quotes.length;
      originalAddQuote();
      if (quotes.length > beforeLen) {
        const q = quotes[quotes.length - 1];
        ensureLocalId(q);
        if (!q.remoteId) q.updatedAt = Date.now();
        saveQuotesSafe();
      }
    };
  })();
  
  // Conflict Resolver UI
  function openConflictResolver() {
    if (!syncConflicts.length) { message('No conflicts to resolve.', 'success'); return; }
    const old = document.getElementById('conflictPanel'); if (old) old.remove();
    const panel = document.createElement('div'); panel.id = 'conflictPanel';
    panel.style.padding = '12px'; panel.style.marginTop = '10px'; panel.style.border = '1px solid #ddd';
    panel.style.borderRadius = '8px'; panel.style.background = '#fff';
    const title = document.createElement('h3'); title.textContent = `Resolve Conflicts (${syncConflicts.length})`; panel.appendChild(title);
    syncConflicts.forEach((c, i) => {
      const box = document.createElement('div');
      box.style.border = '1px dashed #ccc'; box.style.borderRadius = '8px'; box.style.padding = '10px'; box.style.margin = '10px 0';
      const row = document.createElement('div'); row.style.display = 'grid'; row.style.gridTemplateColumns = '1fr 1fr'; row.style.gap = '10px';
      const localCol = document.createElement('div');
      localCol.innerHTML = `<strong>Local</strong><div style="background:#f8f9fa;padding:8px;border-radius:6px;">"${c.local.text}" — (${c.local.category})</div><button>Keep Local</button>`;
      const serverCol = document.createElement('div');
      serverCol.innerHTML = `<strong>Server</strong><div style="background:#f0f7ff;padding:8px;border-radius:6px;">"${c.server.text}" — (${c.server.category})</div><button>Keep Server</button>`;
      row.appendChild(localCol); row.appendChild(serverCol); box.appendChild(row); panel.appendChild(box);
      localCol.querySelector('button').addEventListener('click', () => {
        quotes[c.index] = { ...quotes[c.index], ...c.local, remoteId: undefined };
        saveQuotesSafe(); message('Chosen: Keep Local (will push on next sync)', 'success');
        syncConflicts.splice(i, 1); panel.remove(); openConflictResolver();
      });
      serverCol.querySelector('button').addEventListener('click', () => {
        quotes[c.index] = { ...quotes[c.index], ...c.server };
        saveQuotesSafe(); message('Chosen: Keep Server', 'success');
        syncConflicts.splice(i, 1); panel.remove(); openConflictResolver();
      });
    });
    const close = document.createElement('button'); close.textContent = 'Close'; close.style.marginTop = '8px';
    close.addEventListener('click', () => panel.remove()); panel.appendChild(close);
    container.appendChild(panel);
    const resolveBtn = document.getElementById('resolveConflictsBtn');
    if (resolveBtn) resolveBtn.style.display = syncConflicts.length ? 'block' : 'none';
  }
  
