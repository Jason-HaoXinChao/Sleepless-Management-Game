// An eventLog object represents a log entry
class eventLog {
    constructor(time, content, statChange) {
        // time is the timestamp of the log
        this.time = time;
        // content is a string containing a description of event
        this.content = content;
        // statChange should be an array containing 4 strings
        // representing change in econ, order, health, and diplomacy
        this.statChange = statChange;
    }
}


/*  An establishment is a buff or debuff that the user obtained. 
    The server version of this class would contain information
    about its effect on change of statistics and its duration.
    But locally this class simply contains name and description.
*/
class establishment {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }
}
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
    // Here should be a server call to get the user's data
    loadUserData();
}

function loadUserData(e) {
    // This function should call the server to get data of the user
    // Then it should update the value in statistics, establishment, and log page
    // Here we make up some mock data
    const statisticsSample = [99, 42, 69, 78];
    let logSamples = [];
    let establishmentSample = [];
    const strategies = ["Hands off", "Weak Enforcement", "Reactive Response", "Neutral"];
    logSamples.push(new eventLog("04:20", "An anti-lockdown protest has started, it's mostly peaceful at the moment.", [0, -1, -5, 0]));
    logSamples.push(new eventLog("04:25", "Karens around the country has joined the protest, claiming face mask policy is a violation of their rights.", [0, -1, -1, 0]));
    establishmentSample.push(new establishment("Quarantine Enforcement", "Citizens of the country has been adviced to stay home and avoid human contact to reduce to chance of virus spreading."));
    establishmentSample.push(new establishment("Face Mask Policy", "Citizens are required to wear face masks when entering stores or public places, reducing the chance of contacting the virus during unavoidable human interactions."));
    establishmentSample.push(new establishment("Sample Short Establishment", "short description."));
    establishmentSample.push(new establishment("Sample Long Establishment with a very long title which will take up a lot of spaces and see if it breaks the code.", "description."));
    // Here we put the data into the webpage
    updateStatistics(statisticsSample);
    logSamples.forEach(log => {
        pushLog(log);
    });
}

// Adds a new log message to the eventlog window.
function pushLog(log) {
    const container = document.createElement("p");
    const timeStamp = document.createElement("span");
    const mainContent = document.createElement("span");
    container.setAttribute("class", "log");
    container.appendChild(timeStamp);
    timeStamp.setAttribute("id", "timestamp");
    timeStamp.innerText = "[" + log.time + "]";
    container.appendChild(mainContent);
    mainContent.setAttribute("id", "mainContent")
    mainContent.innerText = log.content;
    const econ = document.createElement("span");
    const order = document.createElement("span");
    const health = document.createElement("span");
    const diplomacy = document.createElement("span");
    if (log.statChange[0] != 0) {
        econ.setAttribute("id", "econ");
        econ.innerText = "(" + log.statChange[0] + ")";
        container.appendChild(econ);
    }
    if (log.statChange[1] != 0) {
        order.setAttribute("id", "order");
        order.innerText = "(" + log.statChange[1] + ")";
        container.appendChild(order);
    }
    if (log.statChange[2] != 0) {
        health.setAttribute("id", "health");
        health.innerText = "(" + log.statChange[2] + ")";
        container.appendChild(health);
    }
    if (log.statChange[3] != 0) {
        diplomacy.setAttribute("id", "diplomacy");
        diplomacy.innerText = "(" + log.statChange[3] + ")";
        container.appendChild(diplomacy);
    }
    const logScrollBox = document.getElementById("eventLogBox");
    logScrollBox.appendChild(container);
    // Scroll to bottom
    logScrollBox.scrollTop = logScrollBox.scrollHeight - logScrollBox.clientHeight;
}
// Reflect the change in statistic by updating it in the bar elements.
function updateStatistics(statistics) {
    const econBar = document.getElementById("econBar").getElementsByClassName("bar");
    const orderBar = document.getElementById("orderBar").getElementsByClassName("bar");
    const healthBar = document.getElementById("healthBar").getElementsByClassName("bar");
    const diplomacyBar = document.getElementById("diplomacyBar").getElementsByClassName("bar");

    econBar.innerText = statistics[0];
    orderBar.innerText = statistics[1];
    healthBar.innerText = statistics[2];
    diplomacyBar.innerText = statistics[3];
    matchStatBars();
}


// Changes the width of the statistic bars to match the value.item
function matchStatBars() {
    const statBars = document.getElementsByClassName("bar");
    let i;
    for (i = 0; i < statBars.length; i++) {
        statBars[i].style.width = statBars[i].innerText + "%";
        if (statBars[i].innerText < 50) {
            statBars[i].setAttribute("id", "red");
        } else {
            statBars[i].setAttribute("id", "green");
        }

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