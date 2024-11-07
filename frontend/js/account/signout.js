const signOut = document.getElementById("sign-out")
const signOutAll = document.getElementById("sign-out-all")
const back = document.getElementById("back")

signOut.addEventListener("click", () => {
    localStorage.removeItem("jwt")
    window.location.href = "/login"
})

signOutAll.addEventListener("click", async () => {
    // reset jwt code in backend
    const response = await fetch(`${window.env.BACKEND_URL}/login/signout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("jwt")
        },
    })

    // remove jwt from localstorage
    localStorage.removeItem("jwt")

    const data = await response.json()

    if (data.response.startsWith("Signout successful")) {
        window.alert("Successful signout.")
    }
    else {
        window.alert("Unsuccessful signout. Local credentials have been cleared anyways.")
    }

    window.location.href = "/login"
})