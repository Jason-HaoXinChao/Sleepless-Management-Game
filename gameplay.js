// onload event listener
window.addEventListener("load", initializePage);

// Add event listener for strategy buttons
window.addEventListener("click", closeDropdown);
document.getElementById("econButton").addEventListener("click", showEconMenu);
document.getElementById("orderButton").addEventListener("click", showOrderMenu);
document.getElementById("healthButton").addEventListener("click", showHealthMenu);
document.getElementById("diplomacyButton").addEventListener("click", showDiplomacyMenu);

let dropdownVisible = false;

function initializePage(e) {
    // Add event listeners to the dropdown menu items
    const strategies = document.getElementsByClassName("item");
    let i;
    for (i = 0; i < strategies.length; i++) {
        strategies[i].addEventListener("click", changeStrategy, false);
    }
    // Here should be a server call to get user stats
    matchStatBars();
}

function matchStatBars(e) {
    const statBars = document.getElementsByClassName("bar");
    let i;
    for (i = 0; i < statBars.length; i++) {
        statBars[i].style.width = statBars[i].innerText + "%";
    }
}

// Display dropdown menus for each button
function showEconMenu(e) {
    e.preventDefault();
    document.getElementById("econMenu").style.display = "block";
    document.getElementById("orderMenu").style.display = "none";
    document.getElementById("healthMenu").style.display = "none";
    document.getElementById("diplomacyMenu").style.display = "none";
    dropdownVisible = true;
}

function showOrderMenu(e) {
    e.preventDefault();
    document.getElementById("orderMenu").style.display = "block";
    document.getElementById("econMenu").style.display = "none";
    document.getElementById("healthMenu").style.display = "none";
    document.getElementById("diplomacyMenu").style.display = "none";
    dropdownVisible = true;
}

function showHealthMenu(e) {
    e.preventDefault();
    document.getElementById("healthMenu").style.display = "block";
    document.getElementById("econMenu").style.display = "none";
    document.getElementById("orderMenu").style.display = "none";
    document.getElementById("diplomacyMenu").style.display = "none";
    dropdownVisible = true;
}

function showDiplomacyMenu(e) {
    e.preventDefault();
    document.getElementById("diplomacyMenu").style.display = "block";
    document.getElementById("econMenu").style.display = "none";
    document.getElementById("orderMenu").style.display = "none";
    document.getElementById("healthMenu").style.display = "none";
    dropdownVisible = true;
}

function changeStrategy(e) {
    e.preventDefault();
    const strategyChosen = e.target;
    const mainButton = (strategyChosen.parentNode.parentNode).querySelector("button");
    // Change the text of the button to the item selected in the dropdown button
    mainButton.innerText = strategyChosen.innerText;
    // Here should include sending data to server to indicate change of strategy
}

// Hide dropdown menu when user clicks somewhere else
function closeDropdown(e) {
    e.preventDefault();
    const target = e.target;
    if (!target.classList.contains("dropdownButton")) {
        if (!target.classList.contains("item")) {
            if (dropdownVisible) {
                console.log("closed menu");
                document.getElementById("econMenu").style.display = "none";
                document.getElementById("orderMenu").style.display = "none";
                document.getElementById("healthMenu").style.display = "none";
                document.getElementById("diplomacyMenu").style.display = "none";
                dropdownVisible = !dropdownVisible;
            }

        }
    }

}