// onload event listener
window.addEventListener("load", initializePage);

const log = console.log;

// Global variables
let dropdownVisible = false; // toggle to indicate if dropdown menu is visible or not
let interval; // global timer variable

function sendRequest(requestType, URL, data, callback) {
    const xml = new XMLHttpRequest();

    xml.open(requestType, URL, true);
    xml.setRequestHeader("Content-Type", "application/json");
    xml.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            try {
                callback(JSON.parse(this.responseText));
            } catch (error) {
                log(error);
                //window.open("/api/logout");
            }
        }
    };
    xml.send(JSON.stringify(data));
}

function initializePage(e) {
    // Add event listener for strategy buttons
    window.addEventListener("click", closeDropdown);
    document.getElementById("econButton").addEventListener("click", showEconMenu);
    document.getElementById("orderButton").addEventListener("click", showOrderMenu);
    document.getElementById("healthButton").addEventListener("click", showHealthMenu);
    document.getElementById("diplomacyButton").addEventListener("click", showDiplomacyMenu);

    // Add event listener for modal window
    document.getElementById("choice1").addEventListener("click", selectChoiceOne);
    document.getElementById("choice2").addEventListener("click", selectChoiceTwo);
    document.getElementById("close").addEventListener("click", hideModal);

    // Add event listeners to the dropdown menu items
    const strategies = document.getElementsByClassName("item");
    let i;
    for (i = 0; i < strategies.length; i++) {
        strategies[i].addEventListener("click", changeStrategy, false);
    }

    // Call server to get user data
    loadUserData();

    interval = setInterval(() => {
        requestUpdate();
    }, 15000);
}

function loadUserData(e) {
    // This function should call the server to get data of the user
    // Then it should display the value in DOM elements

    sendRequest("GET", "/api/user/gameplay/stat/all", {}, (userData) => {
        updateStatistics(userData.statistic);
        setupStrategyButton(userData.strategy);

        (userData.establishment).forEach(est => {
            pushEstablishment(est);
        });

        (userData.log).forEach(log => {
            pushLog(log);
        });
    });

}


// Change the current text of the strategy buttons to the strategy chosen by the user previously.
function setupStrategyButton(strategies) {
    const econButton = document.getElementById("econButton");
    const orderButton = document.getElementById("orderButton");
    const healthButton = document.getElementById("healthButton");
    const diplomacyButton = document.getElementById("diplomacyButton");
    econButton.innerText = strategies.economy;
    orderButton.innerText = strategies.order;
    healthButton.innerText = strategies.health;
    diplomacyButton.innerText = strategies.diplomacy;
}

// Adds a new establishment to the establishment window
function pushEstablishment(establishment) {
    const wrapper = document.createElement("div");
    wrapper.setAttribute("class", "blockWrapper");
    const content = document.createElement("p");
    content.innerText = establishment.name;
    content.setAttribute("class", "boxedItem");
    wrapper.appendChild(content);
    const box = document.getElementById("establishmentBox");
    box.appendChild(wrapper);
    // Scroll to bottom
    box.scrollTop = box.scrollHeight - box.clientHeight;
    // Add onclick eventlistener to show modal window containing description
    content.addEventListener("click", showDescription, false);
}

function showDescription(e) {
    e.preventDefault();
    let i = 0;
    const title = document.getElementById("titlediv").querySelector("#title");
    const content = document.getElementsByClassName("modalContent")[0].querySelector("p");

    // obtain the title, description, and effect on statistics of the establishment from server.
    sendRequest("POST", "/api/user/gameplay/EstInfo", { "name": e.target.innerText }, (establishment) => {
        title.innerText = establishment.name;
        content.innerHTML = "";
        content.appendChild(document.createTextNode(establishment.description));
        content.appendChild(document.createElement("br"));
        const stat = formulateStatChange(establishment.statChange);
        for (let index = 0; index < 5; index++) {
            const element = stat[index];
            content.appendChild(document.createElement("br"));
            content.appendChild(document.createTextNode(element));
        }
    });
    document.getElementById("choice1").style.display = "none";
    document.getElementById("choice2").style.display = "none";
    document.getElementById("close").style.display = "block";
    document.getElementById("modalBackground").style.display = "flex";
}

function hideModal(e) {
    e.preventDefault();
    document.getElementById("modalBackground").style.display = "none";
}

function formulateStatChange(statChange) {
    const statText = [];
    statText.push("Impact on statistics")
    statText.push("economy: " + statChange[0]);
    statText.push("order: " + statChange[1]);
    statText.push("health: " + statChange[2]);
    statText.push("diplomacy: " + statChange[3]);
    return statText;
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

    if (log.statChange.economy != 0) {
        const econ = document.createElement("span");
        econ.setAttribute("id", "econ");
        econ.innerText = "(" + log.statChange.economy + ")";
        container.appendChild(econ);
    }
    if (log.statChange.order != 0) {
        const order = document.createElement("span");
        order.setAttribute("id", "order");
        order.innerText = "(" + log.statChange.order + ")";
        container.appendChild(order);
    }
    if (log.statChange.health != 0) {
        const health = document.createElement("span");
        health.setAttribute("id", "health");
        health.innerText = "(" + log.statChange.health + ")";
        container.appendChild(health);
    }
    if (log.statChange.diplomacy != 0) {
        const diplomacy = document.createElement("span");
        diplomacy.setAttribute("id", "diplomacy");
        diplomacy.innerText = "(" + log.statChange.diplomacy + ")";
        container.appendChild(diplomacy);
    }
    const logScrollBox = document.getElementById("eventLogBox");
    logScrollBox.appendChild(container);
    // Scroll to bottom
    logScrollBox.scrollTop = logScrollBox.scrollHeight - logScrollBox.clientHeight;
}

// Reflect the change in statistic by updating it in the bar elements.
function updateStatistics(statistics) {
    const econBar = document.getElementById("econBar").getElementsByClassName("bar")[0];
    const orderBar = document.getElementById("orderBar").getElementsByClassName("bar")[0];
    const healthBar = document.getElementById("healthBar").getElementsByClassName("bar")[0];
    const diplomacyBar = document.getElementById("diplomacyBar").getElementsByClassName("bar")[0];

    econBar.innerText = statistics.economy;
    orderBar.innerText = statistics.order;
    healthBar.innerText = statistics.health;
    diplomacyBar.innerText = statistics.diplomacy;
    matchStatBars();
}


// Changes the width of the statistic bars to match the value.
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

// Send a request to server to change the request
function changeStrategy(e) {
    e.preventDefault();
    const strategyChosen = e.target;
    const mainButton = (strategyChosen.parentNode.parentNode).querySelector("button");

    // Get the selected strategy
    const newStrat = strategyChosen.innerText;


    // Identify which strategy is being changed
    let type;
    switch (mainButton.id) {
        case "econButton":
            type = "economy";
            break;
        case "orderButton":
            type = "order";
            break;
        case "healthButton":
            type = "health";
            break;
        case "diplomacyButton":
            type = "diplomacy";
            break;
        default:
            break;
    }
    // send post request to server
    sendRequest("POST", "/api/user/gameplay/strategy/" + type + "/" + newStrat, {}, (log) => {
        // Change the text of the button to the item selected in the dropdown button
        mainButton.innerText = newStrat;
        // publish log
        pushLog(log.log);
    })
}

// Hide dropdown menu when user clicks somewhere else
function closeDropdown(e) {
    // e.preventDefault();
    const target = e.target;
    if (!target.classList.contains("dropdownButton")) {
        if (!target.classList.contains("item")) {
            if (dropdownVisible) {
                document.getElementById("econMenu").style.display = "none";
                document.getElementById("orderMenu").style.display = "none";
                document.getElementById("healthMenu").style.display = "none";
                document.getElementById("diplomacyMenu").style.display = "none";
                dropdownVisible = !dropdownVisible;
            }
        }
    }
}

// Modal Window related manipulations

/**
 * Display the random event
 * expected parameter format:
 * {
 *  name:String,
 *  description: String,
 *  choiceOne: String,
 *  choiceTwo: String
 * }
 */
function showRandomEvent(eventToShow) {
    const modalWindow = document.getElementById("modalBackground");
    const modalTitle = document.getElementById("titlediv").querySelector("#title");
    const content = document.getElementsByClassName("modalContent")[0].querySelector("p");
    const button1 = document.getElementById("choice1");
    const button2 = document.getElementById("choice2");
    document.getElementById("close").style.display = "none";
    button1.style.display = "block";
    button2.style.display = "block";

    // The following should've been using the eventToShow parameter which should've
    // been obtained from the server
    modalTitle.innerText = eventToShow.name;
    content.innerText = eventToShow.description;
    button1.innerText = eventToShow.choiceOne;
    button2.innerText = eventToShow.choiceTwo;
    modalWindow.style.display = "flex";

    // pause updating during a random event
    clearInterval(interval);
}

function selectChoiceOne(e) {
    e.preventDefault();
    // Post a request to the server
    const eventName = document.getElementById("titlediv").querySelector("#title").innerText;
    const choice = document.getElementById("choice1").innerText;
    const input = {
        "eventName": eventName,
        "choice": choice
    };

    sendRequest("POST", "/api/user/gameplay/event", input, (data) => {
        if (data.establishment) {
            pushEstablishment(data.establishment);
        }
        pushLog(data.log);
        updateStatistics(data.newStatistics);
    });

    document.getElementById("modalBackground").style.display = "none";

    interval = setInterval(function() {
        requestUpdate();
    }, 15000);
}

function selectChoiceTwo(e) {
    e.preventDefault();
    // Post a request to the server
    const eventName = document.getElementById("titlediv").querySelector("#title").innerText;
    const choice = document.getElementById("choice2").innerText;
    const input = {
        "eventName": eventName,
        "choice": choice
    };

    sendRequest("POST", "/api/user/gameplay/event", input, (data) => {
        if (data.establishment) {
            pushEstablishment(data.establishment);
        }
        pushLog(data.log);
        updateStatistics(data.newStatistics);
    });

    document.getElementById("modalBackground").style.display = "none";

    interval = setInterval(function() {
        requestUpdate();
    }, 15000);
}

// Request for an update from the server
function requestUpdate() {
    sendRequest("GET", "/api/user/gameplay/update", {}, (data) => {
        updateStatistics(data.newStat);
        pushLog(data.log);
        // display randomEvent if there is one
        if (data.randomEvent) {
            showRandomEvent(data.randomEvent);
        }
    });
}