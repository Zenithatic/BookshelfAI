// Get references to input fields
const emailInput = document.getElementById("email")
const codeInput = document.getElementById("code")
const passwordInput = document.getElementById("password")
const confirmInput = document.getElementById("confirm")

// Get references to buttons
const codeButton = document.getElementById("getEmailCode")
const resetButton = document.getElementById("confirmReset")

// Event listener for requesting a reset code
codeButton.addEventListener("click", async () => {
    let givenEmail = emailInput.value.trim()

    // Validate email input
    if (givenEmail.length == 0) {
        window.alert("Cannot send an empty email.")
        return
    }

    // Send request to get reset code
    const response = await fetch(`${window.env.BACKEND_URL}/passreset/getcode`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: givenEmail })
    })

    const data = await response.json()
    window.alert(data.response)
})

// Event listener for resetting the password
resetButton.addEventListener("click", async () => {
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
        // Send request to reset password
        const response = await fetch(`${window.env.BACKEND_URL}/passreset/reset`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: givenEmail, code: givenCode, pass: givenPass })
        })

        const data = await response.json()
        window.alert(data.response)

        // Redirect to login page if password reset is successful
        if (data.response.startsWith("Password successfully")) {
            window.location.href = "/login"
        }
    } else {
        window.alert("Your password and confirm password fields do not match.")
        return
    }
})