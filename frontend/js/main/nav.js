
// Navigation behavior
const nav_btns = document.getElementsByClassName("nav-btn")
const login_sec = document.getElementsByClassName("nav-bar-login")[0]
const login_btn = document.getElementsByClassName("nav-account")[0]
const signup_btn = document.getElementsByClassName("nav-account")[1]

// Click event handler for navigation buttons
function on_nav_click(event) {
    const element = event.target
    if (!element.classList.contains("nav-active")) {
        window.location.href = element.getAttribute("data-url")
    }
}

// Add click event handler to each navigation button
for (let i = 0; i < nav_btns.length; i++) {
    nav_btns[i].addEventListener("click", on_nav_click)
}

login_btn.addEventListener("click", () => {
    if (!window.location.href.endsWith("login/")) {
        window.location.href = "/login"
    }
})

signup_btn.addEventListener("click", () => {
    if (!window.location.href.endsWith("signup/")) {
        window.location.href = "/signup"
    }
})

async function checkLogin() {
    // check if user is logged in
    if (localStorage.getItem("jwt") !== null) {
        // switch login/signup button with signout button
        let signoutBtn = document.createElement("button")
        signoutBtn.classList.add("nav-account")
        signoutBtn.textContent = "Sign Out"

        signoutBtn.addEventListener("click", () => {
            window.location.href = "/signout"
        })

        login_sec.innerHTML = ""
        login_sec.appendChild(signoutBtn)
    }
    else {
        console.log("no jwt")
    }
}

async function loadBookshelf() {
    // check if bookshelf is not cached
    if (localStorage.getItem("bookshelf") === null && localStorage.getItem("jwt") !== null) {
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

// update signout navbar if user is signed in and update bookshelf
checkLogin()
loadBookshelf()



