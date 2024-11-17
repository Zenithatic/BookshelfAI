
// Check if bookshelf exists in localStorage
let bookshelf = localStorage.getItem("bookshelf")

if (bookshelf === null) {
    window.alert("You need to login to access your bookshelf.")
    window.location.href = "/login"
}