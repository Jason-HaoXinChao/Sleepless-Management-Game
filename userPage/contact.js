document.getElementById("submitButton").addEventListener("click", submitMessage);

function submitMessage(e) {
    e.preventDefault();
    alert("Your message has been sent to our admin, thank you for supporting the game.");
    document.getElementById("inputTextBox").value = "";
}