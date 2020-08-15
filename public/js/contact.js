"use strict";


document.getElementById("submitButton").addEventListener("click", submitMessage);


function submitMessage(e) {
    e.preventDefault();
    // Here it should send the message to the server instead.
    fetch("/api/user/feedback", {
        mode: "POST",
        redirect: "follow",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
    }).then(response => {
        if (response.ok) {
            alert("Your message has been sent to our admin, thank you for supporting the game.");
            document.getElementById("inputTextBox").value = "";
        } else {
            alert("Something went wrong on the server side, please try again later.");
        }
    }).catch(err => {
        log(err);
        alert("Something went wrong on the server side, please try again later.");
    });
}