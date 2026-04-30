const button = document.getElementById("add-book-btn");
const overlay = document.getElementById("search-overlay");
const homebtn = document.getElementById("home-btn");
const searchInput = document.getElementById("search-input");
let isSearching = false;

button.addEventListener("click", function(){
    overlay.style.display = "flex";
    const resultsContainer = document.getElementById("search-results");
    resultsContainer.innerHTML = "";
    searchInput.value = "";
});

homebtn.addEventListener("click", function(){
    overlay.style.display = "none";
});

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
        }, 3000);
    }
}

function createCardHTML(title, author, thumbnail) {
    
    const cleanTitle = title.replace(/"/g, '&quot;');
    const cleanAuthor = author.replace(/"/g, '&quot;');

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

const resultsContainer = document.getElementById("search-results");

resultsContainer.addEventListener("click", function(e) {
    if (e.target.classList.contains("add-btn")) { 
        const imgUrl = e.target.getAttribute("data-img");
        const title = e.target.getAttribute("data-title");  
        const author = e.target.getAttribute("data-author"); 

        const libraryGrid = document.getElementById("library-grid");
        const newBook = document.createElement("div");
        newBook.classList.add("book-card", "info-sash-card"); 

        newBook.innerHTML = `
            <img src="${imgUrl}" alt="${title}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">
            <div class="book-info-sash">
                <h4>${title}</h4>
                <p>${author}</p>
                <div class="rmv-btn">
                    <span>&minus;</span>
                </div>
            </div>
        `;

        libraryGrid.insertBefore(newBook, document.getElementById("add-book-btn"));
        overlay.style.display = "none";
    }
});
