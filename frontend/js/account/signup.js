const emailInput = document.getElementById("email")
const codeInput = document.getElementById("code")
const passwordInput = document.getElementById("password")
const confirmInput = document.getElementById("confirm")

const verifyButton = document.getElementById("getEmailCode")
const signupButton = document.getElementById("confirmSignup")

verifyButton.addEventListener("click", async () => {
    let givenEmail = emailInput.value.trim()

    const response = await fetch(`${window.env.BACKEND_URL}/signup/verify`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: givenEmail })
    })

    const data = await response.json()
    window.alert(data.response)
})

signupButton.addEventListener("click", async () => {
    let givenEmail = emailInput.value.trim()
    let givenCode = codeInput.value.trim()
    let givenPass = passwordInput.value.trim()
    let givenConfirm = confirmInput.value.trim()

    // check if some fields are empty
    if (givenEmail.length == 0 || givenCode.length == 0 || givenPass.length == 0 || givenConfirm.length == 0) {
        window.alert("Some fields are empty. Please fill them in.")
        return
    }

    // check if password length is at least 8
    if (givenPass.length < 8) {
        window.alert("Password must be at least 8 characters.")
        return
    }

    // check if password and confirm password are the same
    if (givenPass === givenConfirm) {
        const response = await fetch(`${window.env.BACKEND_URL}/signup/makeaccount`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: givenEmail, code: givenCode, pass: givenPass })
        })

        const data = await response.json()
        window.alert(data.response)

        if (data.response.startsWith("Account successfully")) {
            window.location.href = "/login"
        }
    }
    else {
        window.alert("Your password and confirm password do not match.")
        return
    }
})
