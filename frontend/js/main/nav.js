// Navigation behavior
const nav_btns = document.getElementsByClassName("nav-btn")

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
