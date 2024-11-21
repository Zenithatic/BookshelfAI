const bookContainer = document.getElementById("book-container")
const takePhoto = document.getElementById("photo-file")
const uploadFile = document.getElementById("upload-file")
let currentUploaded

// Preview image
const previewImage = document.getElementById("preview")
const fr = new FileReader()
fr.onload = async () => {
    previewImage.src = fr.result
}

let canPrompt = true

// Check if bookshelf exists in localStorage
let bookshelf = localStorage.getItem("bookshelf")

if (bookshelf === null) {
    window.alert("You need to login to access your bookshelf.")
    window.location.href = "/login"
}

// event listener for prompt button
const promptButton = document.getElementById("prompt-button")
promptButton.addEventListener("click", async () => {
    if (canPrompt == false) {
        window.alert("Please wait for the current prompt to finish.")
        return
    }
    else {
        const userPrompt = document.getElementById("prompt").value
        promptText(userPrompt)
    }
})


// event listener when user takes a photo
takePhoto.addEventListener("change", async () => {
    if (takePhoto.files[0] !== null) {
        currentUploaded = takePhoto.files[0]
        fr.readAsDataURL(takePhoto.files[0])
    }
})

// event listener when user uploads a file
uploadFile.addEventListener("change", async () => {
    if (uploadFile.files[0] !== null) {
        currentUploaded = uploadFile.files[0]
        fr.readAsDataURL(uploadFile.files[0])
    }
})

// event listener for when user clicks on the send image button
const sendImageButton = document.getElementById("send-image-button")
sendImageButton.addEventListener("click", async () => {
    if (canPrompt == false) {
        window.alert("Please wait for the current prompt to finish.")
        return
    }
    else {
        if (previewImage.src === "https://www.freeiconspng.com/thumbs/no-image-icon/no-image-icon-6.png") {
            window.alert("Please upload an image first.")
            return
        }

        const formData = new FormData()
        formData.append("image", currentUploaded)

        promptImage(formData)
    }
})


// function to prompt text
async function promptText(userPrompt) {
    canPrompt = false
    window.alert("Prompting...")
    const response = await fetch(`${window.env.BACKEND_URL}/search/prompt`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("jwt")
        },
        body: JSON.stringify({ bookshelf: JSON.stringify(localStorage.getItem("bookshelf")), prompt: userPrompt })
    })

    const data = await response.json()
    let foundBooks = data.response

    // clean up escape sequences
    while (true) {
        try {
            foundBooks = JSON.parse(foundBooks)
        }
        catch {
            break
        }
    }

    console.log(foundBooks)

    try {
        // load result
        bookContainer.scrollIntoView({ behavior: "smooth" })
        renderer.render(foundBooks)
        window.alert("Scan successful.")
    }
    catch (error) {
        window.alert(error)
    }

    canPrompt = true
}

// function to prompt image
async function promptImage(formData) {
    canPrompt = false
    window.alert("Scanning for books in image...")
    const response = await fetch(`${window.env.BACKEND_URL}/search/image`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("jwt")
        },
        body: formData
    })

    const data = await response.json()
    let foundBooks = data.response

    // clean up escape sequences
    while (true) {
        try {
            foundBooks = JSON.parse(foundBooks)
        }
        catch {
            break
        }
    }

    console.log(foundBooks)

    try {
        // load result
        bookContainer.scrollIntoView({ behavior: "smooth" })
        renderer.render(foundBooks)
        window.alert("Scan successful.")
    }
    catch (error) {
        window.alert("An error has occured while generating results. This means that the AI model is down, or your input is invalid.")
    }

    canPrompt = true
}

const renderer = bookshelfRenderer()

// Closure to manage bookshelf rendering
function bookshelfRenderer() {
    let dateaddedDelta = 0

    // Update backend with the current state of the bookshelf
    async function updateBackend() {
        const response = await fetch(`${window.env.BACKEND_URL}/bookshelf/updatebookshelf`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({ bookshelf: localStorage.getItem("bookshelf") })
        })
        const data = await response.json()
        if (!data.response.startsWith("Successful")) {
            window.alert("An error has occurred, your bookshelf has not been updated in the server")
        }
    }

    // Create a book element
    function makeBook(newBookData) {
        newBookData.cover = ""
        newBookData.dateadded = String(Date.now() + dateaddedDelta++)

        let newBook = document.createElement("div")
        newBook.classList.add("book")
        newBook.id = newBookData.dateadded


        newBook.innerHTML = `
            <div class="upper">
                <h2 class="title"><b>Title:</b> ${newBookData.title}</h2>
            </div>
            <div class="lower">
                <p class="author"><b>Author:</b> ${newBookData.author}</p>
                <p class="published"><b>Published:</b> ${newBookData.published}</p>
                <p class="isbn"><b>ISBN:</b> N/A</p>
                <p class="genre"><b>Genre:</b> ${newBookData.genre}</p>
                <p class="summary"><b>Summary:</b> ${newBookData.summary}</p>
                <p class="tags"><b>Tags:</b> N/A</p>
            </div>
            <div class="options">
                <button class="modify add">Add To Bookshelf</button>
            </div>
        `

        // Add event listener to add button
        const addButton = newBook.children[2].getElementsByClassName("add").item(0)
        addButton.addEventListener("click", async (event) => {
            let oldBookshelf = JSON.parse(localStorage.getItem("bookshelf"))

            // clean book data
            let cleanedBookData = {
                title: String(newBookData.title),
                author: String(newBookData.author),
                published: String(newBookData.published),
                isbn: "",
                genre: String(newBookData.genre),
                cover: "",
                summary: String(newBookData.summary),
                tags: "",
                dateadded: String(newBookData.dateadded)
            }

            oldBookshelf.books.push(cleanedBookData)
            localStorage.setItem("bookshelf", JSON.stringify(oldBookshelf))
            newBook.remove()

            updateBackend()
        })

        return newBook
    }

    // Render books
    function render(promptResults) {
        const books = promptResults.books
        bookContainer.innerHTML = ""

        for (let i = 0; i < books.length; i++) {
            let newBook = makeBook(books[i])

            bookContainer.appendChild(newBook)
        }

        dateaddedDelta = 0
    }

    return { render }
}