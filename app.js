const button = document.getElementById("add-book-btn");
const overlay = document.getElementById("search-overlay");
const homebtn = document.getElementById("home-btn");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const searchResults = document.getElementById("search-results")
const customBtn = document.getElementById("custom-btn");
const customOverlay = document.getElementById("custom-overlay");
let libraryBooks = [];
let bookUpdating = null;


let isSearching = false;

customBtn.addEventListener("click", function(){ // It's for the Close button in the custom menu.
    customOverlay.style.display = "none"; // Sets the display to none in css.
})
// WHEN I PRESS THE '+' BUTTON AT THE HOME SCREEN.
button.addEventListener("click", function(){
    overlay.style.display = "flex";
    searchResults.style.display = "none";
    const resultsContainer = document.getElementById("search-results");
    resultsContainer.innerHTML = "";
    searchInput.value = "";
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

        newBook.innerHTML = ` 
            <img src="${book.cover}" alt="${book.title}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">
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

libraryGrid.addEventListener("click", function(e){ // Event listener for the whole grid, and using
    const removeBtn = e.target.closest(".rmv-btn"); // e as the remove button.
    if(removeBtn) {
        const cardToRemove = removeBtn.closest(".book-card");
        cardToRemove.remove();
    }
})