// Quotes Array
// ----------------------
let quotes = [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Don’t let yesterday take up too much of today.", category: "Life" },
    { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" }
];

// ----------------------
// DOM Elements
// ----------------------
let quoteDisplay = document.getElementById("quoteDisplay");
let newQuoteBtn = document.getElementById("newQuote");
let container = document.getElementById("container");
let exportBtn = document.getElementById("exportQuotes");
let importFileInput = document.getElementById("importFile");

// ----------------------
// Local Storage Helpers
// ----------------------
function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
    const stored = localStorage.getItem("quotes");
    if (stored) {
        quotes = JSON.parse(stored);
    }
}

// ----------------------
// Show Random Quote
// ----------------------
function showRandomQuote() {
    if (quotes.length === 0) {
        quoteDisplay.innerText = "No quotes available. Please add one!";
        return;
    }

    let randomIndex = Math.floor(Math.random() * quotes.length);
    let randomQuote = quotes[randomIndex];
    quoteDisplay.innerText = `"${randomQuote.text}" — (${randomQuote.category})`;

    // save last shown quote in sessionStorage
    sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
}

// ----------------------
// Add New Quote
// ----------------------
function addQuote() {
    let msgContainer = document.querySelector(".msgContainer")
    if(msgContainer){
        container.removeChild(msgContainer)
    }
    let newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();
    let newQuoteText = document.getElementById("newQuoteText").value.trim();

    if (newQuoteCategory && newQuoteText) {
        let newQuoteObj = { text: newQuoteText, category: newQuoteCategory };
        quotes.push(newQuoteObj);

        saveQuotes(); // save to localStorage
        message("New quote added successfully!", "success");

        // reset form
        document.getElementById("newQuoteText").value = "";
        document.getElementById("newQuoteCategory").value = "";
    } else {
        message("Please enter both quote and category!", "error");
    }
}

// ----------------------
// Create Add Quote Form (Dynamic)
// ----------------------
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

    // append elements
    formContainer.appendChild(title);
    formContainer.appendChild(inputQuote);
    formContainer.appendChild(inputCategory);
    formContainer.appendChild(addBtn);

    container.appendChild(formContainer);

    // event listener for add button
    addBtn.addEventListener("click", addQuote);
}
createAddQuoteForm();

// ----------------------
// Export Quotes (Download JSON)
// ----------------------
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

// ----------------------
// Import Quotes (Upload JSON)
// ----------------------
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function (e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            if (Array.isArray(importedQuotes)) {
                quotes.push(...importedQuotes);
                saveQuotes();
                message("Quotes imported successfully!", "success");
            } else {
                message("Invalid file format!", "error");
            }
        } catch (err) {
            message("Error reading file!", "error");
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// ----------------------
// Popup Message
// ----------------------
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
        container.removeChild(msgContainer);
    };

    msgContainer.appendChild(msgP);
    msgContainer.appendChild(closeBtn);
    container.appendChild(msgContainer);

    setTimeout(() => {
        if (container.contains(msgContainer)) {
            msgContainer.classList.add("fadeOut");
            setTimeout(() => {
                if (container.contains(msgContainer)) {
                    container.removeChild(msgContainer);
                }
            }, 500);
        }
    }, 4000);
}

// ----------------------
// Event Listeners
// ----------------------
newQuoteBtn.addEventListener("click", showRandomQuote);
exportBtn.addEventListener("click", exportToJsonFile);
importFileInput.addEventListener("change", importFromJsonFile);

// ----------------------
// Init
// ----------------------
loadQuotes();

// لو فيه آخر Quote محفوظ في SessionStorage، نعرضه
let lastQuote = sessionStorage.getItem("lastQuote");
if (lastQuote) {
    let q = JSON.parse(lastQuote);
    quoteDisplay.innerText = `"${q.text}" — (${q.category})`;
}
