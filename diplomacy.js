/*  userInfo class contains information to display on a diplomacy card */
class userInfo {
    constructor(icon, username, stats) {
        this.icon = icon;
        this.username = username;
        this.stats = stats;
    }
}

// onload event listener
window.addEventListener("load", initializePage);

/*  This should obtain data of ally users from server
    for now we just make up some mock data
*/
function initializePage(e) {
    let user = [];
    user.push(new userInfo("piano_cat_icon.jpg", "piano cat", [12, 34, 56, 78]));
    user.push(new userInfo("yelledatcat_icon.png", "why you yelling", [98, 87, 65, 54]));
    user.push(new userInfo("grumpycat_icon.png", "alright", [59, 31, 47, 78]));
    user.push(new userInfo("tomandjerry_icon.png", "polish jerry", [20, 35, 68, 74]));
    user.forEach(element => {
        addCard(element);
    });
}

/* A function to add a diplomacy card given a user's information */
function addCard(user) {
    //Create DOM elemnts for each component
    const card = document.createElement("div");
    card.setAttribute("class", "card");
    const icon = document.createElement("img");
    icon.setAttribute("id", "icon");
    icon.src = user.icon;
    card.appendChild(icon);
    const username = document.createElement("p");
    username.setAttribute("id", "username");
    username.innerText = user.username;
    card.appendChild(username);
    // stat icons
    const econIcon = document.createElement("img");
    econIcon.setAttribute("id", "econIcon");
    econIcon.src = "econ.png";
    card.appendChild(econIcon);
    const orderIcon = document.createElement("img");
    orderIcon.setAttribute("id", "orderIcon");
    orderIcon.src = "order.png";
    card.appendChild(orderIcon);
    const healthIcon = document.createElement("img");
    healthIcon.setAttribute("id", "healthIcon");
    healthIcon.src = "health.png";
    card.appendChild(healthIcon);
    const diplomacyIcon = document.createElement("img");
    diplomacyIcon.setAttribute("id", "diplomacyIcon");
    diplomacyIcon.src = "diplomacy.png";
    card.appendChild(diplomacyIcon);
    // stats
    const econStat = document.createElement("p");
    econStat.setAttribute("id", "econStat");
    econStat.innerText = user.stats[0];
    card.appendChild(econStat);
    const orderStat = document.createElement("p");
    orderStat.setAttribute("id", "orderStat");
    orderStat.innerText = user.stats[1];
    card.appendChild(orderStat);
    const healthStat = document.createElement("p");
    healthStat.setAttribute("id", "healthStat");
    healthStat.innerText = user.stats[2];
    card.appendChild(healthStat);
    const diplomacyStat = document.createElement("p");
    diplomacyStat.setAttribute("id", "diplomacyStat");
    diplomacyStat.innerText = user.stats[3];
    card.appendChild(diplomacyStat);
    // buttons
    const profileButton = document.createElement("button");
    profileButton.setAttribute("class", "profile");
    profileButton.innerText = "View Profile";
    card.appendChild(profileButton);
    const sendButton = document.createElement("button");
    sendButton.setAttribute("class", "send");
    sendButton.innerText = "Send Resource";
    card.appendChild(sendButton);
    const askButton = document.createElement("button");
    askButton.setAttribute("class", "ask");
    askButton.innerText = "Ask for Resource";
    card.appendChild(askButton);
    const breakButton = document.createElement("button");
    breakButton.setAttribute("class", "break");
    breakButton.innerText = "Break Ties";
    card.appendChild(breakButton);

    // Append card to cardContainer
    const cardContainer = (document.getElementsByClassName("card_container"))[0];
    console.log(cardContainer);
    cardContainer.appendChild(card);

    // Set up eventlisteners for the buttons
    profileButton.addEventListener("click", viewProfile);
    sendButton.addEventListener("click", sendResource);
    askButton.addEventListener("click", askResource);
    breakButton.addEventListener("click", breakTies)
}

/*  obtain url from server to open the profile of said user
    But here we just alert the user to let them know this button does something
    Because we are obviously not going to hard code 50 different profile pages
    for phase 1 just to delete them all after.
 */
function viewProfile(e) {
    e.preventDefault();
    alert("Sorry we can't view this user's profile right now.\n(we don't want to hard code a different profile page for every fake user)");
}

/*  ask user for a amount of resource to send 
    it should then send this information to the server to validate
    whether the user has enough resource, and then it should obtain a
    response from the server to display to the user
 */
function sendResource(e) {
    e.preventDefault();
    const amount = prompt("How much resource do you want to send?", "0");
    if (amount != null) {
        alert("You've sent " + amount + " resource, your ally will see it once they login.");
    }
}

/*  ask user for a amount of resource to ask 
    it should then send this information to the server to validate,
    and then it should obtain a response from the server to display to the user
 */
function askResource(e) {
    e.preventDefault();
    const amount = prompt("How much resource do you want to ask for?", "0");
    if (amount != null) {
        alert("You've asked for " + amount + " resource, your ally will see it once they login.");
    }
}

/*  ask the user to confirm their decision, if the user confirms it, remove
    the user chosen from the diplomacy page.
*/
function breakTies(e) {
    e.preventDefault();
    if (confirm("Are you sure you want to break ties with this ally?")) {
        const card = e.target.parentNode;
        card.parentNode.removeChild(card);
    }
}