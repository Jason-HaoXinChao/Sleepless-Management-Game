//const { json, request } = require("express");

// onload event listener
window.addEventListener("load", initializePage);

const log = console.log;

// Global variables
let dropdownVisible = false; // toggle to indicate if dropdown menu is visible or not

function sendRequest(requestType, URL, data, callback) {
    const xml = new XMLHttpRequest();

    xml.open(requestType, URL, true);
    xml.setRequestHeader("Content-Type", "application/json");
    xml.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            callback(JSON.parse(this.responseText));
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
    log(e.target);
    log(e.target.innerText);
    let i = 0;
    const title = document.getElementById("titlediv").querySelector("#title");
    const content = document.getElementsByClassName("modalContent")[0].querySelector("p");
    // obtain the title and description of the establishment from server.
    sendRequest("POST", "/api/user/gameplay/EstInfo", { "name": e.target.innerText }, (establishment) => {
        title.innerText = establishment.name;
        content.innerText = establishment.description;
    });
    document.getElementById("choice1").style.display = "none";
    document.getElementById("choice2").style.display = "none";
    document.getElementById("close").style.display = "block";
    document.getElementById("modalBackground").style.display = "flex";
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

function changeStrategy(e) {
    e.preventDefault();
    const strategyChosen = e.target;
    const mainButton = (strategyChosen.parentNode.parentNode).querySelector("button");
    // Change the text of the button to the item selected in the dropdown button
    mainButton.innerText = strategyChosen.innerText;

    // Here should include sending data to server to indicate change of strategy

    // Write an event log to indicate the strategy change.
    // This log message should've been obtained from the server(so time stamp matches server time)
    // but here we are just making a mock version
    const curTime = new Date;
    let time;
    const hour = curTime.getHours();
    if (hour < 10) {
        time = "0" + hour;
    } else {
        time = hour.toString();
    }
    time = time + ":" + curTime.getMinutes().toString();
    let type;
    switch (mainButton.id) {
        case "econButton":
            type = "[Economy]";
            userProfile.strategy[0] = mainButton.innerText; //This should've been server manipulation
            break;
        case "orderButton":
            type = "[Law and Order]";
            userProfile.strategy[1] = mainButton.innerText; //This should've been server manipulation
            break;
        case "healthButton":
            type = "[Public Health]";
            userProfile.strategy[2] = mainButton.innerText; //This should've been server manipulation
            break;
        case "diplomacyButton":
            type = "[Diplomacy]";
            userProfile.strategy[3] = mainButton.innerText; //This should've been server manipulation
            break;
        default:
            break;
    }
    const mainContent = type + " strategy has been changed to [" + mainButton.innerText + "].";
    pushLog(new eventLog(time, mainContent, [0, 0, 0, 0]))
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
    modalTitle.innerText = randomEvents[0].title;
    content.innerText = randomEvents[0].description;
    button1.innerText = randomEvents[0].choices[0];
    button2.innerText = randomEvents[0].choices[1];
    modalWindow.style.display = "flex";

    // pause updating during a random event
    clearInterval(interval);
}

function selectChoiceOne(e) {
    e.preventDefault();
    // The information being displayed should've been obtained from server.
    const curTime = new Date;
    let time;
    const hour = curTime.getHours();
    if (hour < 10) {
        time = "0" + hour;
    } else {
        time = hour.toString();
    }
    time = time + ":" + curTime.getMinutes().toString();
    randomEvents[0].logs[0].time = time;
    pushLog(randomEvents[0].logs[0]);
    userProfile.stat[0] += randomEvents[0].logs[0].statChange[0];
    userProfile.stat[1] += randomEvents[0].logs[0].statChange[1];
    userProfile.stat[2] += randomEvents[0].logs[0].statChange[2];
    userProfile.stat[3] += randomEvents[0].logs[0].statChange[3];
    updateStatistics(userProfile.stat);
    if (randomEvents[0].establishments[0] != null) {
        pushEstablishment(randomEvents[0].establishments[0])
    }
    document.getElementById("modalBackground").style.display = "none";

    interval = setInterval(function() {
        calculateStatChange();
    }, 5000);
}

function selectChoiceTwo(e) {
    e.preventDefault();
    // The information being displayed should've been obtained from server.
    const curTime = new Date;
    let time;
    const hour = curTime.getHours();
    if (hour < 10) {
        time = "0" + hour;
    } else {
        time = hour.toString();
    }
    time = time + ":" + curTime.getMinutes().toString();
    randomEvents[0].logs[1].time = time;
    pushLog(randomEvents[0].logs[1]);
    userProfile.stat[0] += randomEvents[0].logs[1].statChange[0];
    userProfile.stat[1] += randomEvents[0].logs[1].statChange[1];
    userProfile.stat[2] += randomEvents[0].logs[1].statChange[2];
    userProfile.stat[3] += randomEvents[0].logs[1].statChange[3];
    updateStatistics(userProfile.stat);
    if (randomEvents[0].establishments[1] != null) {
        pushEstablishment(randomEvents[0].establishments[1])
    }
    document.getElementById("modalBackground").style.display = "none";
    interval = setInterval(function() {
        calculateStatChange();
    }, 5000);
}

function hideModal(e) {
    e.preventDefault();
    const modalWindow = document.getElementById("modalBackground");
    modalWindow.style.display = "none";
}

/*  A function to calculate the change in stats for each server tick.'
    this function should've been entirely server manipulation, the client
    shouldn't know or care about what the change in stat is. The proper
    way this works should be: server ticks->server calculate change in stat->
    server changes stat at server end-> server sends updated stat as well as log
    to front end-> front end displays stat and pushes log 
 */
function calculateStatChange() {
    let statChange = [0, 0, 0, 0];

    // Note that these stat changes are randomly made up to simulate actual gameplay
    // it's obviously unbalanced and probably doesn't even make much sense

    // Economy change
    switch (userProfile.strategy[0]) {
        case "Revitalize":
            statChange[0] += 4;
            statChange[1] -= 3;
            break;
        case "Stablize":
            statChange[0] += 1
            break;
        case "Hands off":
            statChange[0] += Math.floor(Math.random() * (5 - (-5))) + (-5);
        default:
            break;
    }

    // order change
    switch (userProfile.strategy[1]) {
        case "Iron Fist":
            statChange[0] -= 8;
            statChange[1] += 6;
            statChange[2] += 2;
            break;
        case "Strict Ruling":
            statChange[0] -= 3;
            statChange[1] += 2;
            statChange[2] += 1;
            break;
        case "Weak Enforcement":
            statChange[0] += Math.floor(Math.random() * (3));
            statChange[1] -= 2;
            statChange[2] -= 1;
            break;
        default:
            break;
    }

    // health change

    switch (userProfile.strategy[2]) {
        case "Active Prevention":
            statChange[2] += 5;
            statChange[0] -= 4;
            break;
        case "Reactive Response":
            statChange[2] = 0;
            break;

        case "No Testing":
            statChange[2] -= 5;
            break;

        default:
            break;
    }

    switch (userProfile.strategy[3]) {
        case "Hawk":
            statChange[3] -= 4;
            statChange[1] += 3;
            break;

        case "Neutral":
            statChange[3] += Math.floor(Math.random() * (4 - (-3))) + (-3);
            break;

        case "Dove":
            statChange[3] += 1;
            break;
        default:
            break;
    }
    let i;
    for (i = 0; i < 4; i++) {
        if ((userProfile.stat[i] + statChange[i]) > 100) {
            statChange[i] = 100 - userProfile.stat[i];
        } else if ((userProfile.stat[i] + statChange[i]) < 0) {
            statChange[i] = 0 - userProfile.stat[i];
        }
        userProfile.stat[i] += statChange[i];
    }

    updateStatistics(userProfile.stat);

    // Make a log message to indicate the Change
    const curTime = new Date;
    let time;
    const hour = curTime.getHours();
    if (hour < 10) {
        time = "0" + hour;
    } else {
        time = hour.toString();
    }
    time = time + ":" + curTime.getMinutes().toString();
    userProfile.log.push(new eventLog(time, "A week has passed.", statChange));
    pushLog(userProfile.log[userProfile.log.length - 1]);

    userProfile.log.push(new eventLog(time, "A week has passed.", statChange));
    pushLog(userProfile.log[userProfile.log.length - 1]);
}