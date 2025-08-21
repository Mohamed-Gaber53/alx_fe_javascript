
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
let categoryFilter = document.getElementById("categoryFilter");

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
// Populate Categories
// ----------------------
function populateCategories() {
    let categories = ["all", ...new Set(quotes.map(q => q.category))];

    // امسح الاختيارات القديمة
    categoryFilter.innerHTML = "";

    // أضف الاختيارات
    categories.forEach(cat => {
        let option = document.createElement("option");
        option.value = cat;
        option.innerText = cat.charAt(0).toUpperCase() + cat.slice(1);
        categoryFilter.appendChild(option);
    });

    // استرجع الفيلتر من localStorage
    let savedFilter = localStorage.getItem("selectedCategory") || "all";
    categoryFilter.value = savedFilter;
}

// ----------------------
// Filter Quotes
// ----------------------
function filterQuotes() {
    let selected = categoryFilter.value;
    localStorage.setItem("selectedCategory", selected);

    if (selected === "all") {
        quoteDisplay.innerText = "Showing all categories. Click 'Show New Quote'.";
    } else {
        quoteDisplay.innerText = `Showing only "${selected}" quotes. Click 'Show New Quote'.`;
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

    let selected = categoryFilter.value;
    let filteredQuotes = (selected === "all") ? quotes : quotes.filter(q => q.category === selected);

    if (filteredQuotes.length === 0) {
        quoteDisplay.innerText = `No quotes found in category "${selected}".`;
        return;
    }

    let randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    let randomQuote = filteredQuotes[randomIndex];
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
        populateCategories(); // update dropdown
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
                populateCategories();
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
populateCategories();
filterQuotes(); // apply saved filter

// لو فيه آخر Quote محفوظ في SessionStorage، نعرضه
let lastQuote = sessionStorage.getItem("lastQuote");
if (lastQuote) {
    let q = JSON.parse(lastQuote);
    quoteDisplay.innerText = `"${q.text}" — (${q.category})`;
}
