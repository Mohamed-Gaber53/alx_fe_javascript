let quotes = [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Don’t let yesterday take up too much of today.", category: "Life" },
    { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" }
];

let quoteDisplay = document.getElementById("quoteDisplay");
let newQuote = document.getElementById("newQuote");
let container = document.getElementById("container");

function displayRandomQuote() {
    if (quotes.length === 0) {
        quoteDisplay.innerText = "No quotes available. Please add one!";
        return;
    }

    let randomIndex = Math.floor(Math.random() * quotes.length);
    let randomQuote = quotes[randomIndex];
    quoteDisplay.innerText = `"${randomQuote.text}" — (${randomQuote.category})`;
}

newQuote.addEventListener("click", displayRandomQuote);

function addQuote() {
    // مسح أي رسالة قديمة قبل عرض جديدة
    let oldMsg = document.querySelector(".msgContainer");
    if (oldMsg) {
        container.removeChild(oldMsg);
    }

    let newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();
    let newQuoteText = document.getElementById("newQuoteText").value.trim();

    if (newQuoteCategory && newQuoteText) {
        let newQuoteObj = {
            text: newQuoteText,
            category: newQuoteCategory
        };

        quotes.push(newQuoteObj);
        message("New quote added successfully!", "success");

        document.getElementById("newQuoteText").value = "";
        document.getElementById("newQuoteCategory").value = "";
    } else {
        message("Please enter both quote and category!", "error");
    }
}

let addQuoteBtn = document.getElementById("addQuote");
addQuoteBtn.addEventListener("click", addQuote);

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
            container.removeChild(msgContainer);
        }
    }, 4000);
}

