"use strict";

const log = console.log;

document.getElementById("submitButton").addEventListener("click", submitMessage);


function submitMessage(e) {
    e.preventDefault();
    const textbox = document.getElementById("inputTextBox");
    // Send the message to the server
    fetch("/api/user/feedback", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        redirect: "follow",
        body: JSON.stringify({ "content": textbox.value })
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