// Here we should obtain data of the leaderboard from server to display on the webpage
$(window).on("load", function() {
    // Make a GET request to fetch the current leaderboard user ranking
    fetch("/api/user/leaderboard").then(res => {
        return res.json();
    }).then(json => {
        // Iterate through the array of users 10 times (sorted in descending order by user statistic sum)
        for (let i = 0; i < Math.min(10, json.length); i++) {
            // Generate the leaderboard ranking element
            const user = json[i];

            // Container
            const leaderboardProfile = document.createElement('div');
            leaderboardProfile.classList.add("leaderboard-profile");

            // Rank
            const rank = document.createElement('div');
            rank.classList.add("rank");
            leaderboardProfile.appendChild(rank);

            // User Icon
            const userIconContainer = document.createElement('div');
            userIconContainer.classList.add("user-icon-container");

            const userIcon = document.createElement('img');
            userIcon.src = './images/visitor_icon.png';
            fetch(`/api/user/user_icon/${user.username}`).then(res => {
                return res.json();
            }).then(json => {
                if (json) {
                    userIcon.src = $(json.medium).attr("src");
                }
            }).catch(err => {
                console.log(err);
            });
            userIconContainer.appendChild(userIcon);
            leaderboardProfile.appendChild(userIconContainer);

            // Username
            const username = document.createElement('div');
            username.appendChild(document.createTextNode(user.username));
            userIconContainer.appendChild(username);

            // Statistic - Economy
            const econStat = document.createElement('span');
            econStat.classList.add("stat", "economy");
            econStatHeading = document.createElement("b");
            econStatHeading.appendChild(document.createTextNode("Economy:"));
            econStat.appendChild(econStatHeading);
            econStat.appendChild(document.createElement("br"));
            econStat.appendChild(document.createTextNode(user.statistic.economy));
            leaderboardProfile.appendChild(econStat);

            // Statistic - Order
            const orderStat = document.createElement('span');
            orderStat.classList.add("stat", "order");
            orderStatHeading = document.createElement("b");
            orderStatHeading.appendChild(document.createTextNode("Order:"));
            orderStat.appendChild(orderStatHeading);
            orderStat.appendChild(document.createElement("br"));
            orderStat.appendChild(document.createTextNode(user.statistic.order));
            leaderboardProfile.appendChild(orderStat);

            // Statistic - Health
            const healthStat = document.createElement('span');
            healthStat.classList.add("stat", "health");
            healthHeading = document.createElement("b");
            healthHeading.appendChild(document.createTextNode("Health:"));
            healthStat.appendChild(healthHeading);
            healthStat.appendChild(document.createElement("br"));
            healthStat.appendChild(document.createTextNode(user.statistic.health));
            leaderboardProfile.appendChild(healthStat);

            // Statistic - Diplomacy
            const diplomacyStat = document.createElement('span');
            diplomacyStat.classList.add("stat", "diplomacy");
            diplomacyStatHeading = document.createElement("b");
            diplomacyStatHeading.appendChild(document.createTextNode("Diplomacy:"));
            diplomacyStat.appendChild(diplomacyStatHeading);
            diplomacyStat.appendChild(document.createElement("br"));
            diplomacyStat.appendChild(document.createTextNode(user.statistic.diplomacy));
            leaderboardProfile.appendChild(diplomacyStat);

            // User Profile Link
            const userProfileLink = document.createElement("a");
            userProfileLink.href = `/user_profile?profile=${user.username}`;
            userProfileLink.appendChild(document.createTextNode("View Profile"));
            leaderboardProfile.appendChild(userProfileLink);

            document.querySelector(".maincontent").appendChild(leaderboardProfile);
        }
    });
});