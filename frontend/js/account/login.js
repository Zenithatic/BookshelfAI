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
    let data = await response.json()

    // Alert user with response message
    window.alert(data.response)

    loggingIn = false

    // Store new JWT in localStorage and clear old bookshelf if login is successful
    if (data.response.startsWith("Success")) {
        localStorage.setItem("jwt", data.jwt)
        localStorage.removeItem("bookshelf")
        window.location.href = "/"
    }
})