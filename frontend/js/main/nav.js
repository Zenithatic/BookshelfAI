// Navigation behavior
const nav_btns = document.getElementsByClassName("nav-btn")
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


