
const title = document.getElementById("bookshelf-title")
const bookContainer = document.getElementById("book-container")
const addBookButton = document.getElementById("addConfirm")
const previousBtn = document.getElementById("previous")
const nextBtn = document.getElementById("next")
const currentDisplay = document.getElementById("current")

// check if bookshelf exists in localstorage
let bookshelf = localStorage.getItem("bookshelf")

if (bookshelf === null) {
    window.alert("You need to login to access your bookshelf.")
    window.location.href = "/login"
}

// closure to manage bookshelf
function bookshelfRenderer() {
    // jsonify bookshelf and initialize variables
    bookshelf = JSON.parse(bookshelf)
    let books = bookshelf.books
    let bookshelfLength = books.length
    const pageSize = 20
    let currentPage = 0

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

    function makeBook(newBookData) {
        let newBook = document.createElement("div")

        newBook.classList.add("book")
        newBook.id = newBookData.dateadded

        newBook.innerHTML = `
            <div class="upper">
                <img width="100px"
                    src="${newBookData.cover}">
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

        let buttons = newBook.children[2].getElementsByClassName("modify")

        for (let i = 0; i < 2; i++) {
            const button = buttons[i]
            button.addEventListener("click", async (event) => {
                if (event.target.classList.contains("edit")) {
                    let currentEdit = document.getElementsByClassName("edit-book")
                    if (currentEdit.length != 0) {
                        currentEdit.item(0).remove()
                    }

                    // prompt user for new data
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
                            }
                            else {
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

                        // re-render books
                        localStorage.setItem("bookshelf", JSON.stringify(bookshelf))
                        render()
                    })
                }
                else if (event.target.classList.contains("delete")) {
                    const toDelete = event.target.parentElement.parentElement
                    const dateadded = toDelete.id

                    let bookList = JSON.parse(localStorage.getItem("bookshelf")).books.filter((book) => {
                        if (String(book.dateadded) !== String(dateadded)) {
                            return true
                        }
                        else {
                            return false
                        }
                    })
                    bookshelf = { books: bookList }
                    books = bookshelf.books
                    bookshelfLength = books.length

                    updateBackend()

                    // re-render books
                    localStorage.setItem("bookshelf", JSON.stringify(bookshelf))
                    if (bookshelfLength % 20 == 0 && currentPage > Math.ceil(bookshelfLength / pageSize) - 1) {
                        renderPrevious()
                    }
                    else {
                        render()
                    }
                }
            })
        }

        return newBook
    }

    function renderNext() {
        if ((currentPage + 1) <= Math.ceil(bookshelfLength / pageSize) - 1) {
            currentPage = currentPage + 1
            render()
        }
    }

    function renderPrevious() {
        if ((currentPage - 1) >= 0) {
            currentPage = currentPage - 1
            render()
        }
    }

    function render() {
        let tempBooks = searcher.search()
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

// closure to manage searching
function searchManager() {
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

        // search through titles
        if (titleSearch.length != 0) {
            bookSearch = minisearch.search(titleSearch, { fields: ["title"], prefix: true, fuzzy: 0.2 })
            minisearch.removeAll()
            bookSearch = cleanResult(bookSearch)
            minisearch.addAll(bookSearch)
        }

        // search through authors
        if (authorSearch.length != 0) {
            bookSearch = minisearch.search(authorSearch, { fields: ["author"], prefix: true, fuzzy: 0.2 })
            minisearch.removeAll()
            bookSearch = cleanResult(bookSearch)
            minisearch.addAll(bookSearch)
        }

        // search through published
        if (publishedSearch.length != 0) {
            bookSearch = minisearch.search(publishedSearch, { fields: ["published"], prefix: true })
            minisearch.removeAll()
            bookSearch = cleanResult(bookSearch)
            minisearch.addAll(bookSearch)
        }

        // search through genre
        if (genreSearch.length != 0) {
            bookSearch = minisearch.search(genreSearch, { fields: ["genre"], prefix: true })
            minisearch.removeAll()
            bookSearch = cleanResult(bookSearch)
            minisearch.addAll(bookSearch)
        }

        // search through summary
        if (summarySearch.length != 0) {
            bookSearch = minisearch.search(summarySearch, { fields: ["summary"], prefix: true, fuzzy: 0.2 })
            minisearch.removeAll()
            bookSearch = cleanResult(bookSearch)
            minisearch.addAll(bookSearch)
        }

        // search through tags
        if (tagsSearch.length != 0) {
            bookSearch = minisearch.search(tagsSearch, { fields: ["tags"], prefix: true, fuzzy: 0.2 })
            minisearch.removeAll()
            bookSearch = cleanResult(bookSearch)
            minisearch.addAll(bookSearch)
        }

        return bookSearch
    }

    return { search }
}

let renderer = bookshelfRenderer()
let searcher = searchManager()
renderer.render()

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

document.getElementById("search").addEventListener("click", () => {
    renderer.render()
})

document.getElementById("reset").addEventListener("click", () => {
    document.getElementById("title").value = ""
    document.getElementById("author").value = ""
    document.getElementById("published").value = ""
    document.getElementById("genre").value = ""
    document.getElementById("summary").value = ""
    document.getElementById("tags").value = ""

    renderer.render()
})