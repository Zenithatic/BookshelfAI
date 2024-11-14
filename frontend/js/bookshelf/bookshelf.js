// DOM Elements
const title = document.getElementById("bookshelf-title")
const bookContainer = document.getElementById("book-container")
const addBookButton = document.getElementById("addConfirm")
const previousBtn = document.getElementById("previous")
const nextBtn = document.getElementById("next")
const currentDisplay = document.getElementById("current")

// Check if bookshelf exists in localStorage
let bookshelf = localStorage.getItem("bookshelf")

if (bookshelf === null) {
    window.alert("You need to login to access your bookshelf.")
    window.location.href = "/login"
}

// Initialize renderer and searcher
let renderer = bookshelfRenderer()
let searcher = searchManager()
renderer.render()

// Event Listeners
previousBtn.addEventListener("click", () => {
    renderer.renderPrevious()
})

nextBtn.addEventListener("click", () => {
    renderer.renderNext()
})

addBookButton.addEventListener("click", () => {
    let newBookInfo = {
        "title": document.getElementById("addTitle").value,
        "author": document.getElementById("addAuthor").value,
        "published": document.getElementById("addPublished").value,
        "isbn": document.getElementById("addIsbn").value,
        "genre": document.getElementById("addGenre").value,
        "cover": document.getElementById("addCover").value,
        "summary": document.getElementById("addSummary").value,
        "tags": document.getElementById("addTags").value,
        "dateadded": String(Date.now())
    }

    renderer.addBook(newBookInfo)
})

// search fields
document.getElementById("search").addEventListener("click", () => {
    renderer.render()
})

// reset search fields
document.getElementById("reset").addEventListener("click", () => {
    document.getElementById("title").value = ""
    document.getElementById("author").value = ""
    document.getElementById("published").value = ""
    document.getElementById("genre").value = ""
    document.getElementById("summary").value = ""
    document.getElementById("tags").value = ""

    renderer.render()
})

// sort books
document.getElementById("sort-options").addEventListener("change", () => {
    renderer.render()
})

// mergesort for sorting books
function mergeSort(arr, field, order) {
    if (arr.length <= 1) {
        return arr
    } else {
        const mid = Math.floor(arr.length / 2)
        const left = arr.slice(0, mid)
        const right = arr.slice(mid)

        return merge(mergeSort(left, field, order), mergeSort(right, field, order), field, order)
    }

    function merge(left, right, field, order) {
        let result = []
        let leftIndex = 0
        let rightIndex = 0

        if (order === "increasing") {
            while (leftIndex < left.length && rightIndex < right.length) {
                if (left[leftIndex][field].toUpperCase() < right[rightIndex][field].toUpperCase()) {
                    result.push(left[leftIndex])
                    leftIndex++
                } else {
                    result.push(right[rightIndex])
                    rightIndex++
                }
            }
        }
        else if (order === "decreasing") {
            while (leftIndex < left.length && rightIndex < right.length) {
                if (left[leftIndex][field].toUpperCase() > right[rightIndex][field].toUpperCase()) {
                    result.push(left[leftIndex])
                    leftIndex++
                } else {
                    result.push(right[rightIndex])
                    rightIndex++
                }
            }
        }

        return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex))
    }
}

// Closure to manage bookshelf rendering
function bookshelfRenderer() {
    // Parse bookshelf and initialize variables
    bookshelf = JSON.parse(bookshelf)
    let books = bookshelf.books
    let bookshelfLength = books.length
    const pageSize = 20
    let currentPage = 0

    // Update backend with the current state of the bookshelf
    async function updateBackend() {
        const response = await fetch(`${window.env.BACKEND_URL}/bookshelf/updatebookshelf`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({ bookshelf: JSON.stringify(bookshelf) })
        })
        const data = await response.json()
        if (!data.response.startsWith("Successful")) {
            window.alert("An error has occurred, your bookshelf has not been updated in the server")
        }
    }

    // Create a book element
    function makeBook(newBookData) {
        let newBook = document.createElement("div")
        newBook.classList.add("book")
        newBook.id = newBookData.dateadded

        newBook.innerHTML = `
            <div class="upper">
                <img width="100px" src="${newBookData.cover}">
                <h2 class="title"><b>Title:</b> ${newBookData.title}</h2>
            </div>
            <div class="lower">
                <p class="author"><b>Author:</b> ${newBookData.author}</p>
                <p class="published"><b>Published:</b> ${newBookData.published}</p>
                <p class="isbn"><b>ISBN:</b> ${newBookData.isbn}</p>
                <p class="genre"><b>Genre:</b> ${newBookData.genre}</p>
                <p class="summary"><b>Summary:</b> ${newBookData.summary}</p>
                <p class="tags"><b>Tags:</b> ${newBookData.tags}</p>
            </div>
            <div class="options">
                <button class="modify edit">Edit</button>
                <button class="modify delete">Delete</button>
            </div>
        `

        // Add event listeners to edit and delete buttons
        let buttons = newBook.children[2].getElementsByClassName("modify")
        for (let i = 0; i < 2; i++) {
            const button = buttons[i]
            button.addEventListener("click", async (event) => {
                if (event.target.classList.contains("edit")) {
                    handleEdit(newBookData)
                } else if (event.target.classList.contains("delete")) {
                    handleDelete(event)
                }
            })
        }

        return newBook
    }

    // Handle book edit
    function handleEdit(newBookData) {
        let currentEdit = document.getElementsByClassName("edit-book")
        if (currentEdit.length != 0) {
            currentEdit.item(0).remove()
        }

        // Prompt user for new data
        let edit_book_div = document.createElement("div")
        edit_book_div.classList.add("edit-book")
        edit_book_div.classList.add(newBookData.dateadded)
        edit_book_div.innerHTML = `
            <p>Editing: ${newBookData.title}</p>
            <input type="text" name="title" id="newTitle" placeholder="New Title" value=${newBookData.title}>
            <input type="text" name="author" id="newAuthor" placeholder="New Author" value=${newBookData.author}>
            <input type="text" name="published" id="newPublished" placeholder="New Published" value=${newBookData.published}>
            <input type="text" name="isbn" id="newIsbn" placeholder="New ISBN" value=${newBookData.isbn}>
            <input type="text" name="genre" id="newGenre" placeholder="New Genre" value=${newBookData.genre}>
            <input type="text" name="cover" id="newCover" placeholder="New Cover" value=${newBookData.cover}>
            <input type="text" name="summary" id="newSummary" placeholder="New Summary" value=${newBookData.summary}>
            <input type="text" name="tags" id="newTags" placeholder="New Tags" value=${newBookData.tags}>
            <button class="editConfirm">Confirm Edit</button>
        `
        document.getElementsByClassName("container")[0].appendChild(edit_book_div)
        edit_book_div.scrollIntoView({ behavior: "smooth" })

        edit_book_div.getElementsByClassName("editConfirm")[0].addEventListener("click", async () => {
            const dateadded = edit_book_div.classList.item(1)

            let bookList = JSON.parse(localStorage.getItem("bookshelf")).books.map((book) => {
                if (String(book.dateadded) !== String(dateadded)) {
                    return book
                } else {
                    let newBookInfo = {
                        "title": document.getElementById("newTitle").value,
                        "author": document.getElementById("newAuthor").value,
                        "published": document.getElementById("newPublished").value,
                        "isbn": document.getElementById("newIsbn").value,
                        "genre": document.getElementById("newGenre").value,
                        "cover": document.getElementById("newCover").value,
                        "summary": document.getElementById("newSummary").value,
                        "tags": document.getElementById("newTags").value,
                        "dateadded": book.dateadded
                    }

                    return newBookInfo
                }
            })

            edit_book_div.remove()
            bookContainer.scrollIntoView({ behavior: "smooth" })

            bookshelf = { books: bookList }
            books = bookshelf.books
            bookshelfLength = books.length

            await updateBackend()

            // Re-render books
            localStorage.setItem("bookshelf", JSON.stringify(bookshelf))
            render()
        })
    }

    // Handle book delete
    function handleDelete(event) {
        const toDelete = event.target.parentElement.parentElement
        const dateadded = toDelete.id

        let bookList = JSON.parse(localStorage.getItem("bookshelf")).books.filter((book) => {
            return String(book.dateadded) !== String(dateadded)
        })
        bookshelf = { books: bookList }
        books = bookshelf.books
        bookshelfLength = books.length

        updateBackend()

        // Re-render books
        localStorage.setItem("bookshelf", JSON.stringify(bookshelf))
        if (bookshelfLength % 20 == 0 && currentPage > Math.ceil(bookshelfLength / pageSize) - 1) {
            renderPrevious()
        } else {
            render()
        }
    }

    // Render next page of books
    function renderNext() {
        if ((currentPage + 1) <= Math.ceil(bookshelfLength / pageSize) - 1) {
            currentPage += 1
            render()
        }
    }

    // Render previous page of books
    function renderPrevious() {
        if ((currentPage - 1) >= 0) {
            currentPage -= 1
            render()
        }
    }

    // Render books
    function render() {
        let tempBooks = searcher.search()

        const sortType = document.getElementById("sort-options").value
        // const books = JSON.parse(localStorage.getItem("bookshelf")).books

        switch (sortType) {
            case "titleaz":
                tempBooks = mergeSort(tempBooks, "title", "increasing")
                break;

            case "titleza":
                tempBooks = mergeSort(tempBooks, "title", "decreasing")
                break;

            case "authoraz":
                tempBooks = mergeSort(tempBooks, "author", "increasing")
                break;

            case "authorza":
                tempBooks = mergeSort(tempBooks, "author", "decreasing")
                break;

            case "publishednew":
                tempBooks = mergeSort(tempBooks, "published", "decreasing")
                break;

            case "publishedold":
                tempBooks = mergeSort(tempBooks, "published", "increasing")
                break;

            default:
                break;
        }

        let tempLength = tempBooks.length

        bookContainer.innerHTML = ""
        title.textContent = `Bookshelf: ${tempLength} Books`
        for (let i = 0; i < Math.min(20, tempLength - currentPage * pageSize); i++) {
            let newBookIndex = i + currentPage * pageSize
            let newBookData = tempBooks[newBookIndex]
            let newBook = makeBook(newBookData)

            bookContainer.appendChild(newBook)
        }

        currentDisplay.textContent = `Current: ${currentPage + 1}/${Math.ceil(tempLength / pageSize)}`
    }

    // Add a new book to the bookshelf
    async function addBook(bookInfo) {
        books = JSON.parse(localStorage.getItem("bookshelf")).books
        bookshelfLength = books.push(bookInfo)
        bookshelf = { books: books }
        localStorage.setItem("bookshelf", JSON.stringify(bookshelf))

        render()

        updateBackend()

        window.alert("Book successfully added locally.")
    }

    return { render, renderNext, renderPrevious, addBook }
}

// Closure to manage searching
function searchManager() {
    // Clean search results
    function cleanResult(result) {
        let cleaned = []

        for (let i = 0; i < result.length; i++) {
            let cleanedBook = {
                title: result[i].title,
                author: result[i].author,
                published: result[i].published,
                isbn: result[i].isbn,
                genre: result[i].genre,
                cover: result[i].cover,
                summary: result[i].summary,
                tags: result[i].tags,
                dateadded: result[i].id
            }

            cleaned.push(cleanedBook)
        }

        return cleaned
    }

    // Perform search
    function search() {
        let bookSearch = JSON.parse(localStorage.getItem("bookshelf")).books

        let minisearch = new MiniSearch({
            idField: "dateadded",
            fields: ["title", "author", "published", "genre", "summary", "tags"],
            storeFields: ["title", "author", "published", "isbn", "genre", "cover", "summary", "tags", "dateadded"]
        })
        minisearch.addAll(bookSearch)

        const titleSearch = document.getElementById("title").value
        const authorSearch = document.getElementById("author").value
        const publishedSearch = document.getElementById("published").value
        const genreSearch = document.getElementById("genre").value
        const summarySearch = document.getElementById("summary").value
        const tagsSearch = document.getElementById("tags").value

        // Search through titles
        if (titleSearch.length != 0) {
            bookSearch = minisearch.search(titleSearch, { fields: ["title"], prefix: true, fuzzy: 0.2 })
            minisearch.removeAll()
            bookSearch = cleanResult(bookSearch)
            minisearch.addAll(bookSearch)
        }

        // Search through authors
        if (authorSearch.length != 0) {
            bookSearch = minisearch.search(authorSearch, { fields: ["author"], prefix: true, fuzzy: 0.2 })
            minisearch.removeAll()
            bookSearch = cleanResult(bookSearch)
            minisearch.addAll(bookSearch)
        }

        // Search through published
        if (publishedSearch.length != 0) {
            bookSearch = minisearch.search(publishedSearch, { fields: ["published"], prefix: true })
            minisearch.removeAll()
            bookSearch = cleanResult(bookSearch)
            minisearch.addAll(bookSearch)
        }

        // Search through genre
        if (genreSearch.length != 0) {
            bookSearch = minisearch.search(genreSearch, { fields: ["genre"], prefix: true })
            minisearch.removeAll()
            bookSearch = cleanResult(bookSearch)
            minisearch.addAll(bookSearch)
        }

        // Search through summary
        if (summarySearch.length != 0) {
            bookSearch = minisearch.search(summarySearch, { fields: ["summary"], prefix: true, fuzzy: 0.2 })
            minisearch.removeAll()
            bookSearch = cleanResult(bookSearch)
            minisearch.addAll(bookSearch)
        }

        // Search through tags
        if (tagsSearch.length != 0) {
            bookSearch = minisearch.search(tagsSearch, { fields: ["tags"], prefix: true })
            minisearch.removeAll()
            bookSearch = cleanResult(bookSearch)
            minisearch.addAll(bookSearch)
        }

        return bookSearch
    }

    return { search }
}