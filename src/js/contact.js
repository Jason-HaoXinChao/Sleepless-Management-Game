document.getElementById("submitButton").addEventListener("click", submitMessage);



function submitMessage(e) {
    e.preventDefault();
    // Here it should send the message to the server instead.
    alert("Your message has been sent to our admin, thank you for supporting the game.");
    document.getElementById("inputTextBox").value = "";
}