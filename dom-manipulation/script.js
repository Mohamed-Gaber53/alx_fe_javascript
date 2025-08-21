/* =========================================
   Base State + Storage
   ========================================= */
   (function () {
    // Default quotes (used if no saved data)
    const defaultQuotes = [
      { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { text: "Don’t let yesterday take up too much of today.", category: "Life" },
      { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" }
    ];
  
    // Global state
    window.quotes = JSON.parse(localStorage.getItem("quotes")) || defaultQuotes;
  
    function saveQuotes() {
      localStorage.setItem("quotes", JSON.stringify(window.quotes));
    }
    window.saveQuotes = saveQuotes; // expose if needed elsewhere
  
    /* =========================================
       UI Helpers (message popup)
       ========================================= */
    function message(text, type = "success") {
      const msg = document.createElement("div");
      msg.className = `msgContainer ${type}`;
      // minimal inline style (works even without CSS file)
      msg.style.position = "fixed";
      msg.style.top = "20px";
      msg.style.right = "20px";
      msg.style.minWidth = "240px";
      msg.style.padding = "12px 16px";
      msg.style.borderRadius = "8px";
      msg.style.color = "#fff";
      msg.style.fontSize = "14px";
      msg.style.display = "flex";
      msg.style.justifyContent = "space-between";
      msg.style.alignItems = "center";
      msg.style.gap = "8px";
      msg.style.boxShadow = "0 6px 18px rgba(0,0,0,0.18)";
      msg.style.background = type === "error" ? "#dc3545" : "#28a745";
      msg.textContent = text;
  
      const close = document.createElement("span");
      close.textContent = "×";
      close.style.cursor = "pointer";
      close.style.fontWeight = "bold";
      close.onclick = () => msg.remove();
  
      msg.appendChild(close);
      document.body.appendChild(msg);
  
      setTimeout(() => msg.remove(), 4000);
    }
    window.message = message;
  
    /* =========================================
       DOM Ready
       ========================================= */
    document.addEventListener("DOMContentLoaded", () => {
      // DOM references
      const container = document.getElementById("container") || document.body;
      const quoteDisplay = document.getElementById("quoteDisplay");
      const newQuoteBtn = document.getElementById("newQuote");
      const exportBtn = document.getElementById("exportQuotes");
      const importFileInput = document.getElementById("importFile");
      const categoryFilter = document.getElementById("categoryFilter");
  
      /* =========================================
         Core: Show Random Quote (respects filter)
         ========================================= */
      function showRandomQuote() {
        let pool = window.quotes;
        const selected = (categoryFilter && categoryFilter.value) || "all";
        if (selected !== "all") {
          pool = window.quotes.filter(q => (q.category || "").toLowerCase() === selected.toLowerCase());
        }
  
        if (!pool.length) {
          quoteDisplay.textContent = "No quotes available for this selection. Please add one!";
          return;
        }
  
        const randomIndex = Math.floor(Math.random() * pool.length);
        const randomQuote = pool[randomIndex];
        quoteDisplay.textContent = `"${randomQuote.text}" — (${randomQuote.category})`;
  
        // Save last shown quote to sessionStorage
        sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
      }
      window.showRandomQuote = showRandomQuote;
  
      /* =========================================
         Add Quote (called from dynamic form)
         ========================================= */
      function addQuote() {
        // remove any visible message first (optional)
        const oldMsg = document.querySelector(".msgContainer");
        if (oldMsg && oldMsg.parentNode) oldMsg.parentNode.removeChild(oldMsg);
  
        const textInput = document.getElementById("newQuoteText");
        const catInput = document.getElementById("newQuoteCategory");
        const text = (textInput?.value || "").trim();
        const category = (catInput?.value || "").trim();
  
        if (!text || !category) {
          message("Please enter both quote and category!", "error");
          return;
        }
  
        const newObj = { text, category };
        window.quotes.push(newObj);
        saveQuotes();
        message("New quote added successfully!", "success");
  
        // clear inputs
        textInput.value = "";
        catInput.value = "";
  
        // update categories dropdown if needed
        populateCategories();
  
        // if current filter == this category or all, you may update the display
        const currentFilter = categoryFilter?.value || "all";
        if (currentFilter === "all" || currentFilter.toLowerCase() === category.toLowerCase()) {
          showRandomQuote();
        }
      }
      window.addQuote = addQuote;
  
      /* =========================================
         Dynamic Add Quote Form
         ========================================= */
      function createAddQuoteForm() {
        const formContainer = document.createElement("div");
        formContainer.classList.add("formContainer");
  
        const title = document.createElement("h2");
        title.textContent = "Add a New Quote";
  
        const inputQuote = document.createElement("input");
        inputQuote.id = "newQuoteText";
        inputQuote.type = "text";
        inputQuote.placeholder = "Enter a new quote";
  
        const inputCategory = document.createElement("input");
        inputCategory.id = "newQuoteCategory";
        inputCategory.type = "text";
        inputCategory.placeholder = "Enter quote category";
  
        const addBtn = document.createElement("button");
        addBtn.id = "addQuote";
        addBtn.textContent = "Add Quote";
        addBtn.addEventListener("click", addQuote);
  
        formContainer.appendChild(title);
        formContainer.appendChild(inputQuote);
        formContainer.appendChild(inputCategory);
        formContainer.appendChild(addBtn);
  
        container.appendChild(formContainer);
      }
      window.createAddQuoteForm = createAddQuoteForm;
  
      /* =========================================
         Categories: populate + filter + persist
         ========================================= */
      function getUniqueCategories() {
        return [...new Set(window.quotes.map(q => (q.category || "").trim()).filter(Boolean))].sort();
      }
  
      function populateCategories() {
        if (!categoryFilter) return;
        const last = localStorage.getItem("selectedCategory") || "all";
        const current = categoryFilter.value || "all";
  
        // clear all options
        categoryFilter.innerHTML = "";
        // add "All"
        const allOpt = document.createElement("option");
        allOpt.value = "all";
        allOpt.textContent = "All Categories";
        categoryFilter.appendChild(allOpt);
  
        // add unique categories
        getUniqueCategories().forEach(cat => {
          const opt = document.createElement("option");
          opt.value = cat;
          opt.textContent = cat;
          categoryFilter.appendChild(opt);
        });
  
        // restore selected category (prefer saved, else current)
        const toSelect = getUniqueCategories().includes(last) || last === "all" ? last : "all";
        categoryFilter.value = toSelect;
  
        // if a quote was saved in session, show it; else do nothing until user clicks
        const lastQuote = sessionStorage.getItem("lastQuote");
        if (lastQuote) {
          try {
            const q = JSON.parse(lastQuote);
            quoteDisplay.textContent = `"${q.text}" — (${q.category})`;
          } catch {
            // ignore
          }
        }
      }
      window.populateCategories = populateCategories;
  
      function filterQuotes() {
        const val = categoryFilter?.value || "all";
        localStorage.setItem("selectedCategory", val);
        // Update the visible quote according to the filter
        showRandomQuote();
      }
      window.filterQuotes = filterQuotes;
  
      /* =========================================
         Export / Import JSON
         ========================================= */
      function exportToJsonFile() {
        const dataStr = JSON.stringify(window.quotes, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
  
        const a = document.createElement("a");
        a.href = url;
        a.download = "quotes.json";
        a.click();
  
        URL.revokeObjectURL(url);
      }
      window.exportToJsonFile = exportToJsonFile;
  
      function importFromJsonFile(event) {
        const fileReader = new FileReader();
        fileReader.onload = function (e) {
          try {
            const importedQuotes = JSON.parse(e.target.result);
            if (Array.isArray(importedQuotes)) {
              window.quotes.push(...importedQuotes);
              saveQuotes();
              populateCategories();
              message("Quotes imported successfully!", "success");
            } else {
              message("Invalid file format!", "error");
            }
          } catch (err) {
            message("Error reading file!", "error");
          }
        };
        if (event.target.files && event.target.files[0]) {
          fileReader.readAsText(event.target.files[0]);
        }
      }
      window.importFromJsonFile = importFromJsonFile;
  
      /* =========================================
         Event listeners
         ========================================= */
      if (newQuoteBtn) newQuoteBtn.addEventListener("click", showRandomQuote);
      if (exportBtn) exportBtn.addEventListener("click", exportToJsonFile);
      if (importFileInput) importFileInput.addEventListener("change", importFromJsonFile);
      if (categoryFilter) categoryFilter.addEventListener("change", filterQuotes);
  
      // Build dynamic form + categories on load
      createAddQuoteForm();
      populateCategories();
  
      // If there is a saved last quote in this session, show it initially
      const lastQuote = sessionStorage.getItem("lastQuote");
      if (lastQuote) {
        try {
          const q = JSON.parse(lastQuote);
          quoteDisplay.textContent = `"${q.text}" — (${q.category})`;
        } catch {
          // ignore
        }
      }
    });
  
    /* =========================================
       Server Sync + Conflicts (Mock API)
       ========================================= */
    const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';
    const SYNC_INTERVAL = 30000; // 30s
    let lastSyncTime = null;
    let quoteConflicts = []; // [{local, server, index}]
  
    // Helpers
    function ensureLocalQuoteId(q) {
      if (!q.id) q.id = 'local-' + Date.now() + '-' + Math.random().toString(16).slice(2);
      if (!q.updatedAt) q.updatedAt = Date.now();
    }
    function prepareServerPayload(q) {
      return { title: q.category || 'General', body: q.text || '', userId: 1 };
    }
    function mapFromServer(item) {
      return {
        text: item.body || '',
        category: item.title || 'General',
        remoteId: item.id,
        id: 'remote-' + item.id,
        updatedAt: Date.now()
      };
    }
  
    // Required: fetchQuotesFromServer
    async function fetchQuotesFromServer() {
      const res = await fetch(`${SERVER_URL}?_limit=10`);
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      return data.map(mapFromServer);
    }
    window.fetchQuotesFromServer = fetchQuotesFromServer;
  
    async function pushLocalQuotes() {
      let pushed = 0;
      for (let q of window.quotes) {
        if (!q.remoteId) {
          ensureLocalQuoteId(q);
          try {
            const res = await fetch(SERVER_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(prepareServerPayload(q))
            });
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
      if (pushed) window.saveQuotes();
      return pushed;
    }
  
    function mergeQuotesFromServer(serverQuotes) {
      let added = 0, updated = 0, conflictsFound = 0;
  
      for (const s of serverQuotes) {
        const idx = window.quotes.findIndex(q => q.remoteId === s.remoteId);
        if (idx === -1) {
          window.quotes.push(s);
          added++;
          continue;
        }
        const local = window.quotes[idx];
        const same = (local.text === s.text) && (local.category === s.category);
        if (!same) {
          conflictsFound++;
          quoteConflicts.push({ local: { ...local }, server: { ...s }, index: idx });
          // Server wins by default
          window.quotes[idx] = { ...local, ...s, updatedAt: Date.now() };
          updated++;
        }
      }
  
      if (added || updated) window.saveQuotes();
  
      // show/hide resolve button
      const btn = document.getElementById('resolveConflictsBtn');
      if (btn) btn.style.display = quoteConflicts.length ? 'block' : 'none';
  
      return { added, updated, conflictsFound };
    }
  
    // Required: syncQuotes
    async function syncQuotes() {
      const logs = [];
      try {
        const pushed = await pushLocalQuotes();
        if (pushed) logs.push(`pushed ${pushed}`);
  
        const serverItems = await fetchQuotesFromServer();
        const { added, updated, conflictsFound } = mergeQuotesFromServer(serverItems);
        if (added) logs.push(`added ${added}`);
        if (updated) logs.push(`updated ${updated}`);
        if (conflictsFound) logs.push(`conflicts ${conflictsFound}`);
  
        lastSyncTime = new Date();
        const status = document.getElementById('syncStatus');
        if (status) status.textContent = `Last sync: ${lastSyncTime.toLocaleString()}`;
  
        window.message(logs.length ? `Sync complete: ${logs.join(', ')}` : 'Sync complete: no changes', 'success');
      } catch (err) {
        window.message('Sync failed: ' + err.message, 'error');
      }
    }
    window.syncQuotes = syncQuotes;
  
    // Create sync controls after DOM is ready
    document.addEventListener("DOMContentLoaded", () => {
      const container = document.getElementById("container") || document.body;
  
      const controls = document.createElement('div');
      controls.style.marginTop = '16px';
      controls.style.display = 'grid';
      controls.style.gap = '8px';
  
      const syncBtn = document.createElement('button');
      syncBtn.id = 'syncNowBtn';
      syncBtn.textContent = 'Sync Now';
      syncBtn.addEventListener('click', syncQuotes);
  
      const resolveBtn = document.createElement('button');
      resolveBtn.id = 'resolveConflictsBtn';
      resolveBtn.textContent = 'Resolve Conflicts';
      resolveBtn.style.display = 'none';
      resolveBtn.addEventListener('click', openConflictResolver);
  
      const status = document.createElement('div');
      status.id = 'syncStatus';
      status.style.fontSize = '12px';
      status.style.color = '#666';
      status.textContent = 'Last sync: never';
  
      controls.appendChild(syncBtn);
      controls.appendChild(resolveBtn);
      controls.appendChild(status);
      container.appendChild(controls);
    });
  
    // Periodic sync
    setInterval(syncQuotes, SYNC_INTERVAL);
  
    // Hook addQuote so new items get local ids
    function tryHookAddQuote() {
      if (typeof window.addQuote === 'function' && !window.addQuote.__wrapped) {
        const original = window.addQuote;
        function wrapped() {
          const before = window.quotes.length;
          original();
          const after = window.quotes.length;
          if (after > before) {
            const q = window.quotes[window.quotes.length - 1];
            ensureLocalQuoteId(q);
            if (!q.remoteId) q.updatedAt = Date.now();
            window.saveQuotes();
          }
        }
        wrapped.__wrapped = true;
        window.addQuote = wrapped;
      }
    }
    tryHookAddQuote();
    document.addEventListener("DOMContentLoaded", tryHookAddQuote);
  
    /* =========================================
       Conflict Resolver UI
       ========================================= */
    function openConflictResolver() {
      if (!quoteConflicts.length) {
        window.message('No conflicts to resolve.', 'success');
        return;
      }
  
      const container = document.getElementById("container") || document.body;
      const old = document.getElementById('conflictPanel');
      if (old) old.remove();
  
      const panel = document.createElement('div');
      panel.id = 'conflictPanel';
      panel.style.padding = '12px';
      panel.style.marginTop = '10px';
      panel.style.border = '1px solid #ddd';
      panel.style.borderRadius = '8px';
      panel.style.background = '#fff';
  
      const title = document.createElement('h3');
      title.textContent = `Resolve Conflicts (${quoteConflicts.length})`;
      panel.appendChild(title);
  
      quoteConflicts.forEach((c, i) => {
        const box = document.createElement('div');
        box.style.border = '1px dashed #ccc';
        box.style.borderRadius = '8px';
        box.style.padding = '10px';
        box.style.margin = '10px 0';
  
        const row = document.createElement('div');
        row.style.display = 'grid';
        row.style.gridTemplateColumns = '1fr 1fr';
        row.style.gap = '10px';
  
        const localCol = document.createElement('div');
        localCol.innerHTML = `
          <strong>Local</strong>
          <div style="background:#f8f9fa;padding:8px;border-radius:6px;">
            "${c.local.text}" — (${c.local.category})
          </div>
          <button style="margin-top:6px;width:100%;">Keep Local</button>
        `;
  
        const serverCol = document.createElement('div');
        serverCol.innerHTML = `
          <strong>Server</strong>
          <div style="background:#f0f7ff;padding:8px;border-radius:6px;">
            "${c.server.text}" — (${c.server.category})
          </div>
          <button style="margin-top:6px;width:100%;">Keep Server</button>
        `;
  
        row.appendChild(localCol);
        row.appendChild(serverCol);
        box.appendChild(row);
        panel.appendChild(box);
  
        localCol.querySelector('button').addEventListener('click', () => {
          window.quotes[c.index] = { ...window.quotes[c.index], ...c.local, remoteId: undefined };
          window.saveQuotes();
          window.message('Chosen: Keep Local (will push on next sync)', 'success');
          quoteConflicts.splice(i, 1);
          panel.remove();
          openConflictResolver();
        });
  
        serverCol.querySelector('button').addEventListener('click', () => {
          window.quotes[c.index] = { ...window.quotes[c.index], ...c.server };
          window.saveQuotes();
          window.message('Chosen: Keep Server', 'success');
          quoteConflicts.splice(i, 1);
          panel.remove();
          openConflictResolver();
        });
      });
  
      const close = document.createElement('button');
      close.textContent = 'Close';
      close.style.marginTop = '8px';
      close.addEventListener('click', () => panel.remove());
      panel.appendChild(close);
  
      container.appendChild(panel);
  
      const resolveBtn = document.getElementById('resolveConflictsBtn');
      if (resolveBtn) resolveBtn.style.display = quoteConflicts.length ? 'block' : 'none';
    }
    window.openConflictResolver = openConflictResolver;
  })();
  
