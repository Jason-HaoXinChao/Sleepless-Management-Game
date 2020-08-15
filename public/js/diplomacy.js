// onload event listener
window.addEventListener("load", initializePage);

/*  obtain ally users from the server and display them on the page
 */
function initializePage(e) {
    const pagination = document.getElementsByClassName("pagination")[0];
    const container = document.getElementsByClassName("card_container")[0];
    fetchRequest("GET", "/api/user/diplomacy/1", {}, (output) => {
        // Add paginations
        if (output.totalPage <= 1) { // Hide pagination if there is 0 or 1 page
            pagination.style.display = "none";
        } else {
            const nextButton = document.getElementById("Next");
            for (let i = 1; index <= output.totalPage; i++) {
                const page = document.createElement("a");
                page.innerText = i;
                if (i == 1) {
                    page.setAttribute("id", "active");
                }
                // Add onclick eventlistener to the link
                page.addEventListener("click", switchPage);
                // Insert the new page button before the next page button
                nextButton.before(page);
            }
            // gray out the previous page button
            const previousButton = document.getElementById("Previous");
            previousButton.classList.toggle("grayedOut");
        }
        output.connection.forEach(connection => {
            addCard(connection);
        });
        if (output.totalPage == 0) {
            alert("You have no diplomatic connection with any other country.");
        }
    });
}

/**
 * changes the diplomatic connections displayed
 * @param {*} e onclick event
 */
function switchPage(e) {
    e.preventDefault();
    const pageButton = e.target;
    const pageNumber = pageButton.innerText;
    // Empty the card container to put in new cards
    const container = document.getElementsByClassName("card_container")[0];
    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }
    fetchRequest("GET", "/api/user/diplomacy/" + pageNumber, {}, (output) => {
        output.connection.forEach(connection => {
            addCard(connection);
        });
    });

    // gray out the previous page button if user is on first page, ungray if otherwise.
    const previousButton = document.getElementById("Previous");
    if (pageNumber > 1 && previousButton.classList.contains("grayedOut")) {
        previousButton.classList.toggle("grayedOut");
    } else if (pageNumber == 1 && !previousButton.classList.contains("grayedOut")) {
        previousButton.classList.toggle("grayedOut");
    }

    // gray out the next page button if user is on last page, ungray if otherwise.
    const nextButton = document.getElementById("Next");
    if (pageNumber < output.totalPage && nextButton.classList.contains("grayedOut")) {
        nextButton.classList.toggle("grayedOut");
    } else if (pageNumber == output.totalPage && !nextButton.classList.contains("grayedOut")) {
        nextButton.classList.toggle("grayedOut");
    }

    // Change the active button to the current page
    const currentPage = document.getElementById("active");
    currentPage.classList.toggle("active");
    pageButton.toggle("active");
}

/**
 * add a diplomacy card given a user's username
 * @param {String} username username of an ally user 
 */
function addCard(username) {
    // Create card container
    const card = document.createElement("div");
    card.setAttribute("class", "card");

    // Username
    const usernameDOM = document.createElement("p");
    usernameDOM.setAttribute("id", "username");
    usernameDOM.innerText = username;
    card.appendChild(usernameDOM);

    // statistic icons
    const econIcon = document.createElement("img");
    econIcon.setAttribute("id", "econIcon");
    econIcon.src = "./images/econ.png";
    card.appendChild(econIcon);
    const orderIcon = document.createElement("img");
    orderIcon.setAttribute("id", "orderIcon");
    orderIcon.src = "./images/order.png";
    card.appendChild(orderIcon);
    const healthIcon = document.createElement("img");
    healthIcon.setAttribute("id", "healthIcon");
    healthIcon.src = "./images/health.png";
    card.appendChild(healthIcon);
    const diplomacyIcon = document.createElement("img");
    diplomacyIcon.setAttribute("id", "diplomacyIcon");
    diplomacyIcon.src = "./images/diplomacy.png";
    card.appendChild(diplomacyIcon);

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

    // Set up eventlisteners for the buttons
    profileButton.addEventListener("click", viewProfile);
    sendButton.addEventListener("click", sendResource);
    askButton.addEventListener("click", askResource);
    breakButton.addEventListener("click", breakTies)

    // wait for asynchronous calls to finish before appending to the container

    // Fetch gameplay statistic
    fetchRequest("GET", "/api/admin/gameplay_stat/" + username, {}, (statistic) => {
        try {
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
        } catch (error) {
            log(error)
        }

        // Fetch user icon
        fetchRequest("GET", "/api/admin/user_icon/" + username, {}, (icon) => {
            try {
                const icon = document.createElement("img");
                icon.setAttribute("id", "icon");
                icon.src = icon;
                card.appendChild(icon);
            } catch (error) {
                log(error);
            }
            // Append card to cardContainer
            const cardContainer = (document.getElementsByClassName("card_container"))[0];
            cardContainer.appendChild(card);
        });
    });
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

// Helper function to send a request to the server using the fetch() api
function fetchRequest(requestType, URL, data, callback) {
    if (requestType == "GET") {
        fetch(URL, {
                method: requestType,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: "include",
                redirect: "follow"
            })
            .then(response => {
                if (!response.ok) { // server sending non-200 codes
                    log("Error status:", response.status);
                    log("Logging user out...");
                    document.getElementsByClassName("logout")[0].click();
                    return;
                } else {
                    return response.json();
                }
            })
            .then(data => {
                if (data) {
                    log("Request Successful");
                    callback(data);
                } else {
                    log("Request Failed");
                    document.getElementsByClassName("logout")[0].click();
                }
            })
            .catch((error) => {
                console.error('Encountered error:', error);
                console.error("Redirecting user to logout.");
                document.getElementsByClassName("logout")[0].click();
            });

    } else {
        fetch(URL, {
                method: requestType,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: "include",
                redirect: "follow",
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) { // server sending non-200 codes
                    log("Error status:", response.status);
                    log("Logging user out...");
                    document.getElementsByClassName("logout")[0].click();
                    return;
                } else {
                    return response.json();
                }
            })
            .then(data => {
                if (data) {
                    log("Request Successful");
                    callback(data);
                } else {
                    log("Request Failed");
                    document.getElementsByClassName("logout")[0].click();
                }
            })
            .catch((error) => {
                console.error('Encountered error:', error);
                console.error("Redirecting user to logout.");
                document.getElementsByClassName("logout")[0].click();
            });
    }
}