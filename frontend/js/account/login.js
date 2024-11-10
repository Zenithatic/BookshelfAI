const emailInput = document.getElementById("email")
const passwordInput = document.getElementById("password")
const loginButton = document.getElementById("confirmLogin")
const forgotPassword = document.getElementById("forgotPassword")

forgotPassword.addEventListener("click", () => {
    window.location.href = "/resetpassword"
})

loginButton.addEventListener("click", async () => {
    let givenEmail = emailInput.value.trim()
    let givenPass = passwordInput.value.trim()

    // check for valid input
    if (givenEmail.length == 0 || givenPass.length == 0) {
        window.alert("Some fields are empty. Please fill them in.")
    }

    // request login
    const response = await fetch(`${window.env.BACKEND_URL}/login/authenticate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: givenEmail, pass: givenPass })
    })

    let data = await response.json()

    window.alert(data.response)

    // store new jwt in localStorage, clear old bookshelf
    if (data.response.startsWith("Success")) {
        localStorage.setItem("jwt", data.jwt)
        localStorage.removeItem("bookshelf")
        window.location.href = "/"
    }
})