// Get input elements
const emailInput = document.getElementById("email")
const codeInput = document.getElementById("code")
const passwordInput = document.getElementById("password")
const confirmInput = document.getElementById("confirm")

// Get button elements
const verifyButton = document.getElementById("getEmailCode")
const signupButton = document.getElementById("confirmSignup")

// Event listener for email verification
verifyButton.addEventListener("click", async () => {
    let givenEmail = emailInput.value.trim()

    // Check if email input is empty
    if (givenEmail.length == 0) {
        window.alert("Cannot send an empty email.")
        return
    }

    // Send verification request to backend
    const response = await fetch(`${window.env.BACKEND_URL}/signup/verify`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: givenEmail })
    })

    // Handle response from backend
    const data = await response.json()
    window.alert(data.response)
})

// Event listener for signup
signupButton.addEventListener("click", async () => {
    let givenEmail = emailInput.value.trim()
    let givenCode = codeInput.value.trim()
    let givenPass = passwordInput.value.trim()
    let givenConfirm = confirmInput.value.trim()

    // Check if any fields are empty
    if (givenEmail.length == 0 || givenCode.length == 0 || givenPass.length == 0 || givenConfirm.length == 0) {
        window.alert("Some fields are empty. Please fill them in.")
        return
    }

    // Check if password length is at least 8 characters
    if (givenPass.length < 8) {
        window.alert("Password must be at least 8 characters.")
        return
    }

    // Check if password and confirm password match
    if (givenPass === givenConfirm) {
        // Send signup request to backend
        const response = await fetch(`${window.env.BACKEND_URL}/signup/makeaccount`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: givenEmail, code: givenCode, pass: givenPass })
        })

        // Handle response from backend
        const data = await response.json()
        window.alert(data.response)

        // Redirect to login page if account creation is successful
        if (data.response.startsWith("Account successfully")) {
            window.location.href = "/login"
        }
    } else {
        window.alert("Your password and confirm password fields do not match.")
        return
    }
})
