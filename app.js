const button = document.getElementById("add-book-btn");
const overlay = document.getElementById("search-overlay");
const homebtn = document.getElementById("home-btn");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const searchResults = document.getElementById("search-results")
const customBtn = document.getElementById("custom-btn");
const customOverlay = document.getElementById("custom-overlay");
// Choice Panel Elements
const choiceOverlay = document.getElementById("choice-overlay");
const chooseSearchBtn = document.getElementById("choose-search-btn");
const chooseCustomBtn = document.getElementById("choose-custom-btn");
const closeChoiceBtn = document.getElementById("close-choice-btn");

let libraryBooks = [];
let bookUpdating = null;


let isSearching = false;

customBtn.addEventListener("click", function(){ // It's for the Close button in the custom menu.
    customOverlay.style.display = "none"; // Sets the display to none in css.
})
// If they press the '+' button at home screen.
button.addEventListener("click", function(){
    choiceOverlay.style.display = "flex"; 
    
    // Ensure the other menus are closed just in case
    overlay.style.display = "none";
    customOverlay.style.display = "none";
    searchResults.style.display = "none";
    
    // Reset search fields from previous uses
    const resultsContainer = document.getElementById("search-results");
    resultsContainer.innerHTML = "";
    searchInput.value = "";
});

//  If they click "Search Database"
chooseSearchBtn.addEventListener("click", function() {
    choiceOverlay.style.display = "none"; // Hide choice panel
    overlay.style.display = "flex";       // Open API Search
});

//  ROUTE: If they click "Add Manually"
chooseCustomBtn.addEventListener("click", function() {
    choiceOverlay.style.display = "none"; // Hide choice panel
    customOverlay.style.display = "flex"; // Open Custom Book panel
});

//  CANCEL: If they change their mind
closeChoiceBtn.addEventListener("click", function() {
    choiceOverlay.style.display = "none";
});

homebtn.addEventListener("click", function(){
    searchResults.style.display = "none";
    overlay.style.display = "none";
});

searchBtn.addEventListener("click", function(){
    const query = searchInput.value; 
        if(query.trim() !== "") {
            searchBooks(query);
        }
})

searchInput.addEventListener('keypress', function(e) {
    
    
    if(e.key === 'Enter') { 
        const query = searchInput.value; 
        if(query.trim() !== "") {
            searchBooks(query);
        }
    }
});

async function searchBooks(query) {
    if (isSearching) {
        return;
    }

    isSearching = true;
    searchInput.style.opacity = "0.5";
    
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`;
    const resultsContainer = document.getElementById("search-results");

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        
        resultsContainer.innerHTML = ""; 

        if (data.docs && data.docs.length > 0) {
            data.docs.forEach(book => {
                const title = book.title; 
                
                const author = book.author_name ? book.author_name[0] : "Unknown Author";
                
                
                const image = book.cover_i 
                    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` 
                    : "https://via.placeholder.com/128x192?text=No+Cover";

                searchResults.style.display = "flex";
                resultsContainer.innerHTML += createCardHTML(title, author, image);
            });
        } else {
            resultsContainer.innerHTML = "<p>No books found.</p>";
        }

    } catch (error) {
        resultsContainer.innerHTML = "<p>Something went wrong. Please try again.</p>";
    } finally {
        
        setTimeout(() => {
            isSearching = false; 
            searchInput.style.opacity = "1";
        }, 3000); // Waiting 3 seconds between each search.
    }
}

function createCardHTML(title, author, thumbnail) {
    
    const cleanTitle = title.replace(/"/g, '&quot;');
    const cleanAuthor = author.replace(/"/g, '&quot;');
    // HTML for horizotnal cards in the search menu.
    return `
           
        <div class="search-card">
            <div class="card-info">
                <h4 style="margin: 0;">${title}</h4>
                <p style="margin: 0;">${author}</p>
            </div>
            <button class="add-btn" 
                data-img="${thumbnail}" 
                data-title="${cleanTitle}" 
                data-author="${cleanAuthor}">+</button>
        </div>
    `;
}

function reDrawGrid(){
    const libraryGrid = document.getElementById("library-grid");
    const addButton = document.getElementById("add-book-btn");
    
    // Removing all the existing books in the library grid.
    const existingBooks = document.querySelectorAll('.book-card.info-sash-card');
    existingBooks.forEach(bookCard => {
        bookCard.remove();
    });

    libraryBooks.forEach((book, index) => {
        const newBook = document.createElement("div");
        newBook.classList.add("book-card", "info-sash-card"); 
        newBook.setAttribute('data-index', index);

        // ONLY draw an image if a cover URL/data exists
        const imageHTML = book.cover 
            ? `<img src="${book.cover}" alt="${book.title}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">` 
            : ``; 

        newBook.innerHTML = ` 
            ${imageHTML}
            <div class="book-info-sash">
                <div>
                    <h4>${book.title}</h4>
                    <p>${book.author}</p>
                </div>
                <div class="rmv-btn">
                    <span>&minus;</span>
                </div>
            </div>
        `;

        libraryGrid.insertBefore(newBook, document.getElementById("add-book-btn"));
    });
}

// WHEN I PRESS THE '+' BUTTON IN THE SEARCH RESULTS SCREEN CONTAINER.
const resultsContainer = document.getElementById("search-results");
resultsContainer.addEventListener("click", function(e) {
    if (e.target.classList.contains("add-btn")) { 
        const imgUrl = e.target.getAttribute("data-img");
        const title = e.target.getAttribute("data-title");  
        const author = e.target.getAttribute("data-author"); 

        const brandNewBook = {
            id: Date.now(),
            title: title,
            author: author,
            cover: imgUrl
        };

        libraryBooks.push(brandNewBook);
        overlay.style.display = "none";
        reDrawGrid();

    }
});

const libraryGrid = document.getElementById("library-grid");

// The fully synced deletion code
libraryGrid.addEventListener("click", function(e){ 
    const removeBtn = e.target.closest(".rmv-btn"); 
    if(removeBtn) {
        const cardToRemove = removeBtn.closest(".book-card");
        const arrayIndex = cardToRemove.getAttribute('data-index');
        libraryBooks.splice(arrayIndex, 1);
        reDrawGrid();
    }
})

// --- Custom Book Form Logic ---
const fileUpload = document.getElementById("file-upload");
const triggerUploadBtn = document.getElementById("trigger-upload-btn");
const customAuthorInput = document.getElementById("custom-author");
const customTitleInput = document.getElementById("custom-title");
const saveCustomBtn = document.getElementById("save-custom-btn");

let currentCustomImage = null; 

// Trigger hidden file input
triggerUploadBtn.addEventListener("click", function() {
    fileUpload.click();
});

// Read and convert uploaded image
fileUpload.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            currentCustomImage = event.target.result; 
            triggerUploadBtn.textContent = "Image Selected ✓"; 
        };
        reader.readAsDataURL(file);
    }
});

// Save the custom book
saveCustomBtn.addEventListener("click", function() {
    const title = customTitleInput.value.trim();
    const author = customAuthorInput.value.trim();

    if (title === "" || author === "") {
        alert("Please enter both a title and an author!");
        return;
    }

    const brandNewBook = {
        id: Date.now(),
        title: title,
        author: author,
        cover: currentCustomImage 
    };

    libraryBooks.push(brandNewBook);
    reDrawGrid();

    // Reset modal
    customTitleInput.value = "";
    customAuthorInput.value = "";
    currentCustomImage = null;
    triggerUploadBtn.textContent = "Custom Image";
    customOverlay.style.display = "none";
});