// Get references to DOM elements
const emailInput = document.getElementById("email")
const passwordInput = document.getElementById("password")
const loginButton = document.getElementById("confirmLogin")
const forgotPassword = document.getElementById("forgotPassword")

// Event listener for "Forgot Password" link
forgotPassword.addEventListener("click", () => {
    window.location.href = "/resetpassword"
})

// Event listener for login button
let loggingIn = false
loginButton.addEventListener("click", async () => {
    if (loggingIn == true) {
        window.alert("Please wait for the current login request to finish.")
        return
    }

    loggingIn = true
    // Get trimmed input values
    let givenEmail = emailInput.value.trim()
    let givenPass = passwordInput.value.trim()

    // Check for valid input
    if (givenEmail.length == 0 || givenPass.length == 0) {
        window.alert("Some fields are empty. Please fill them in.")
        return
    }

    // Request login
    const response = await fetch(`${window.env.BACKEND_URL}/login/authenticate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: givenEmail, pass: givenPass })
    })

    // Parse response data
    const data = await response.json()

    // Alert user with response message
    window.alert(data.response)

    loggingIn = false

    // Store new JWT in localStorage and clear old bookshelf if login is successful
    if (data.response.startsWith("Success")) {
        localStorage.setItem("jwt", data.jwt)
        await loadBookshelf()

        // check if user is a test user
        if (localStorage.getItem("user") === "test") {
            localStorage.setItem("bookshelf",
                `{
                    "books": [
                        {
                            "title": "randombook",
                            "author": "author2",
                            "published": "2023",
                            "isbn": "123456790",
                            "genre": "comedy",
                            "cover": "https://th.bing.com/th/id/OIP.4XB8NF1awQyApnQDDmBmQwHaEo?rs=1&pid=ImgDetMain",
                            "summary": "a",
                            "tags": "tag1",
                            "dateadded": "6"
                        },
                        {
                            "title": "book1",
                            "author": "author1",
                            "published": "2024",
                            "isbn": "123456789",
                            "genre": "romance, horror",
                            "cover": "https://th.bing.com/th/id/OIP.4XB8NF1awQyApnQDDmBmQwHaEo?rs=1&pid=ImgDetMain",
                            "summary": "a book about blah blah blah",
                            "tags": "tag1 tag2",
                            "dateadded": "7"
                        }
                    ]
                }`
            )
        }

        await updateBackend()

        window.location.href = "/"
    }
})

async function updateBackend() {
    // update bookshelf in backend
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

async function loadBookshelf() {
    // load bookshelf
    if (localStorage.getItem("jwt") !== null) {
        const response = await fetch(`${window.env.BACKEND_URL}/bookshelf/getbookshelf`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })

        const data = await response.json()

        if (data.response.startsWith("Successful")) {
            localStorage.setItem("bookshelf", data.bookshelf)
        }
        else {
            window.alert("Invalid credentials. Please try re-logging in.")
            window.location.href = "/signout"
        }
    }
}
