// Get DOM elements
const signOut = document.getElementById("sign-out")
const signOutAll = document.getElementById("sign-out-all")
const back = document.getElementById("back")

// Event listener for signing out from the current device
signOut.addEventListener("click", () => {
    // Clear all data from local storage
    localStorage.clear()
    // Redirect to login page
    window.location.href = "/login"
})

// Event listener for signing out from all devices
signOutAll.addEventListener("click", async () => {
    try {
        // Send request to backend to reset JWT
        const response = await fetch(`${window.env.BACKEND_URL}/login/signout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
        })

        // Clear all data from local storage
        localStorage.clear()

        // Parse response data
        const data = await response.json()

        // Check response message and alert user
        if (data.response.startsWith("Signout successful")) {
            window.alert("Successful signout.")
        } else {
            window.alert("Unsuccessful signout. Local credentials have been cleared anyways.")
        }

    } catch (error) {
        // Handle any errors that occur during the fetch
        console.error("Error during signout:", error)
        window.alert("An error occurred during signout. Please try again.")
    }

    // Redirect to login page
    window.location.href = "/login"
})