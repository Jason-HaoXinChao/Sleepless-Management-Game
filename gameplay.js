class user {
    constructor(username, icon, stat, establishment, log, strategy) {
        this.username = username;
        this.icon = icon;
        this.stat = stat;
        this.establishment = establishment;
        this.log = log;
        this.strategy = strategy;
    }
}
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
// A randomEvent object records the content and the result of an event
class randomEvent {
    constructor(title, description, choices, logs, establishments) {
        this.title = title;
        this.description = description;
        this.choices = choices;
        this.logs = logs;
        this.establishments = establishments;
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

// Add event listener for modal window
document.getElementById("choice1").addEventListener("click", selectChoiceOne);
document.getElementById("choice2").addEventListener("click", selectChoiceTwo);
document.getElementById("close").addEventListener("click", hideModal);

// Global variables
let dropdownVisible = false;
//This should've been stored and manipulated on server side, we are keeping it here so the functions
//can pass values without having to call the server. Realistically, to avoid cheating, none of these would be 
//stored on the client end.
let userProfile;
let randomEvents = [];

function initializePage(e) {
    // Add event listeners to the dropdown menu items
    const strategies = document.getElementsByClassName("item");
    let i;
    for (i = 0; i < strategies.length; i++) {
        strategies[i].addEventListener("click", changeStrategy, false);
    }
    // Here should be a server call to get the user's data
    loadUserData();
    showRandomEvent();
}

function loadUserData(e) {
    // This function should call the server to get data of the user
    // Then it should update the value in statistics, establishment, and log page
    // Here we make up some mock data
    const statisticsSample = [86, 42, 69, 78];
    let logSamples = [];
    let establishmentSample = [];
    let strategies = ["Hands off", "Weak Enforcement", "Reactive Response", "Neutral"];
    logSamples.push(new eventLog("04:20", "An anti-lockdown protest has started, it's mostly peaceful at the moment.", [0, -1, -5, 0]));
    logSamples.push(new eventLog("04:25", "Karens around the country has joined the protest, claiming face mask policy is a violation of their rights.", [0, -1, -1, 0]));
    establishmentSample.push(new establishment("Quarantine Enforcement", "Citizens of the country has been adviced to stay home and avoid human contact to reduce to chance of virus spreading."));
    establishmentSample.push(new establishment("Face Mask Policy", "Citizens are required to wear face masks when entering stores or public places, reducing the chance of contacting the virus during unavoidable human interactions."));
    establishmentSample.push(new establishment("Sample Short Establishment", "short description."));
    establishmentSample.push(new establishment("Sample Long Establishment with a very long title which will take up a lot of spaces and see if it breaks the code.", "description."));
    establishmentSample.push(new establishment("Medical Bills", "Lack of affordable healthcare causes citizens to be unwilling or unable to get treatments."));

    userProfile = new user("user", "logged_in_user_icon.jpg", statisticsSample, establishmentSample, logSamples, strategies);
    // Here we put the data into the webpage
    updateStatistics(statisticsSample);
    logSamples.forEach(log => {
        pushLog(log);
    });
    establishmentSample.forEach(establishment => {
        pushEstablishment(establishment);
    });
    setupStrategyButton(strategies);


    makeNewEvents();
}

// The data stored in randomEvents should've been obtained from server
// This function is only for making mock events, it shouldn't exist in the actual game
function makeNewEvents() {
    let title;
    let description;
    let choices = [];
    let logs = [];
    let establishments = [];

    // First event: toilet paper shortage
    title = "Toilet Paper Shortage";
    description = "People are buying out all toilet paper rolls from all stores. The shortage of toilet paper is causing panic and outrage.";
    choices.push("Rationalize toilet paper sales");
    choices.push("Import toilet paper to satisfy demand");
    logs.push(new eventLog("", "Toilet paper panic was resolved after government rationalize toilet paper sales.", [-1, 1, -1, 0]));
    logs.push(new eventLog("", "Grocery store chains made banks thanks to toilet paper craze.", [5, -3, -2, 0]));
    establishments.push(new establishment("Rational Toilet Paper", "Toilet paper sales has been rationalized, preventing the possibility of another public panic buyout."));
    establishments.push(null);
    randomEvents.push(new randomEvent(title, description, choices, logs, establishments));
}

// Change the current text of the strategy buttons to the strategy chosen by the user previously.
function setupStrategyButton(strategies) {
    const econButton = document.getElementById("econButton");
    const orderButton = document.getElementById("orderButton");
    const healthButton = document.getElementById("healthButton");
    const diplomacyButton = document.getElementById("diplomacyButton");
    econButton.innerText = strategies[0];
    orderButton.innerText = strategies[1];
    healthButton.innerText = strategies[2];
    diplomacyButton.innerText = strategies[3];
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
    userProfile.establishment.push(establishment);
    // Add onclick eventlistener to show modal window containing description
    content.addEventListener("click", showDescription, false);
}

function showDescription(e) {
    e.preventDefault();
    let i = 0;
    const title = document.getElementById("titlediv").querySelector("#title");
    const content = document.getElementsByClassName("modalContent")[0].querySelector("p");
    // The title and ontent shuold've been obtained from the server.
    while (i < userProfile.establishment.length) {
        if (userProfile.establishment[i].name == e.target.innerText) {
            title.innerText = userProfile.establishment[i].name;
            content.innerText = userProfile.establishment[i].description;
            break;
        }
        i++;
    }
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
    userProfile.log.push(log);
    // Scroll to bottom
    logScrollBox.scrollTop = logScrollBox.scrollHeight - logScrollBox.clientHeight;
}
// Reflect the change in statistic by updating it in the bar elements.
function updateStatistics(statistics) {
    const econBar = document.getElementById("econBar").getElementsByClassName("bar")[0];
    const orderBar = document.getElementById("orderBar").getElementsByClassName("bar")[0];
    const healthBar = document.getElementById("healthBar").getElementsByClassName("bar")[0];
    const diplomacyBar = document.getElementById("diplomacyBar").getElementsByClassName("bar")[0];

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
}

function hideModal(e) {
    e.preventDefault();
    const modalWindow = document.getElementById("modalBackground");
    modalWindow.style.display = "none";
}