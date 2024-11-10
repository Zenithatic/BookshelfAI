const title = document.getElementById("bookshelf-title")
const bookContainer = document.getElementById("book-container")
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
                    console.log("edit, not implemented yet")
                }
                else if (event.target.classList.contains("delete")) {
                    const toDelete = event.target.parentElement.parentElement
                    const dateadded = toDelete.id
                    console.log(dateadded)

                    let bookList = bookshelf.books.filter((book) => {
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

                    // send to backend for update
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
                    else {
                        window.alert("successful update")
                    }

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
        bookContainer.innerHTML = ""
        for (let i = 0; i < Math.min(20, bookshelfLength - currentPage * pageSize); i++) {
            let newBookIndex = i + currentPage * pageSize
            let newBookData = books[newBookIndex]
            let newBook = makeBook(newBookData)

            bookContainer.appendChild(newBook)
        }

        currentDisplay.textContent = `Current: ${currentPage + 1}/${Math.ceil(bookshelfLength / pageSize)}`
    }

    return { render, renderNext, renderPrevious }
}

let renderer = bookshelfRenderer()
renderer.render()

previousBtn.addEventListener("click", () => {
    renderer.renderPrevious()
})

nextBtn.addEventListener("click", () => {
    renderer.renderNext()
})

