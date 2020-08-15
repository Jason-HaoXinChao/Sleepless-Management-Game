const log = console.log;
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
    const breakButton = document.createElement("button");
    breakButton.setAttribute("class", "break");
    breakButton.innerText = "Break Ties";
    card.appendChild(breakButton);

    // Set up eventlisteners for the buttons
    profileButton.addEventListener("click", viewProfile);
    sendButton.addEventListener("click", sendResource);
    breakButton.addEventListener("click", breakTies)

    // wait for asynchronous calls to finish before appending to the container

    // Fetch gameplay statistic
    fetchRequest("GET", "/api/admin/gameplay_stat/" + username, {}, (statistic) => {
        try {
            // stats
            const econStat = document.createElement("p");
            econStat.setAttribute("id", "econStat");
            econStat.innerText = statistic.economy;
            card.appendChild(econStat);
            const orderStat = document.createElement("p");
            orderStat.setAttribute("id", "orderStat");
            orderStat.innerText = statistic.order;
            card.appendChild(orderStat);
            const healthStat = document.createElement("p");
            healthStat.setAttribute("id", "healthStat");
            healthStat.innerText = statistic.health;
            card.appendChild(healthStat);
            const diplomacyStat = document.createElement("p");
            diplomacyStat.setAttribute("id", "diplomacyStat");
            diplomacyStat.innerText = statistic.diplomacy;
            card.appendChild(diplomacyStat);
        } catch (error) {
            log(error)
        }

        // Fetch user icon
        fetchRequest("GET", "/api/admin/user_icon/" + username, {}, (iconImg) => {
            try {
                const icon = document.createElement("img");
                icon.setAttribute("id", "icon");
                icon.src = iconImg.src;
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


/*  open the profile page of the specified ally
 */
function viewProfile(e) {
    e.preventDefault();
    const button = e.target;
    const parent = button.parentNode;
    const username = parent.getElementById("username").innerText;
    window.open(location.origin + "/user_profile?profile=" + username, "_self");
}

/*  ask user for a amount of medical supply to send 
    then send this information to the server to validate, 
    then obtain a response from the server to display to the user
    expected results
    not enough supply: health statistic lower than proposed amount
    not in list: target user is not in diplomacy database (reload)
    failed state: target user has already game over'ed
    success: successfully sent supply
 */
function sendResource(e) {
    e.preventDefault();
    const button = e.target;
    const parent = button.parentNode;
    const username = parent.getElementById("username").innerText;
    const amount = Parseint(prompt("How much medical supply do you want to send? (You can only send less than your current health statistic)", "0"));
    if (amount != null && amount >= 0) {
        fetchRequest("POST", "/api/user/diplomacy/send", { "username": username, "amount": Math.floor(amount) }, (output) => {
            if (!output.status) {
                log("didn't receive status update");
                alert("An error has occured. Your current session might be desynced with the server, try log back in later. Logging out...");
                document.getElementsByClassName("logout")[0].click(); // logout
                return;
            }
            switch (output.status) {
                case "not in list":
                    alert("An error has occured. Your current session might be desynced with the server, try log back in later. Logging out...");
                    document.getElementsByClassName("logout")[0].click(); // logout
                    break;
                case "not enough supply":
                    alert("You don't have enough supply to send!");
                    break;
                case "failed state":
                    alert("This ally's government has lost control of their country, you can't send them supply when there's a civil war going on.");
                    break;
                case "success":
                    alert("Your medical supply has been sent! Your ally will see it in their event log.");
                    break;
                default:
                    break;
            }
        });
    } else {
        alert("ILLEGAL AMOUNT!");
    }
}

/*  ask the user to confirm their decision, if the user confirms it, send
    a request to the server to remove the user chosen from the diplomacy collection.
*/
function breakTies(e) {
    e.preventDefault();
    if (confirm("Are you sure you want to break ties with this ally?")) {
        const card = e.target.parentNode;
        const username = card.getElementById("username").innerText;
        fetchRequest("POST", "/api/user/diplomacy/delete", { username: username }, (output) => {
            if (!output.status) {
                log("didn't receive status update");
                alert("An error has occured. Your current session might be desynced with the server, try log back in later. Logging out...");
                document.getElementsByClassName("logout")[0].click(); // logout
                return;
            }

            if (output.status == "not in list") {
                alert("An error has occured. Your current session might be desynced with the server, try log back in later. Logging out...");
                document.getElementsByClassName("logout")[0].click(); // logout
            } else if (output.status == "success") {
                alert("You have successfully destroyed your diplomatic connection with this user. Updating ally list...");
                location.reload(); // reinitialize the page
            }
        })

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