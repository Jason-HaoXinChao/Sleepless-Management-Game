document.getElementById("signin-form").addEventListener("submit", checkCredentials);


// A function to check the credential of the user
// Should've sent credentials to user then obtain what to do from server
function checkCredentials(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    const username = document.getElementById("username-1").value;
    const password = document.getElementById("password-1").value;
    if (username == "user" && password == "user") {
        window.open("../gameplay.html", "_self");
    } else if (username == "admin" && password == "admin") {
        // open admin panel
        console.log("open admin panel");
    } else {
        alert("Incorrect username or password!");
    }
}

// toggles between signin and login form
$(function() {
    $(".form-toggle").on("click", function(e) {
        e.stopImmediatePropagation();

        $(this).closest("#form-module-container").toggleClass("sign-in");
    });
});