'use strict';

// Keeps track of the user that the admin is searching for and whether the admin user has made the respective change
const changes = {
    user: "",
    banUser: false,
    unbanUser: false,
    removeUserIcon: false,
    changeStats: false,
}

/*
* Handles the user search form submission
*/
$("form#user-search-form").submit(function() {
    // Get the username from the input
    const username = $(this).children("#user-search").val();

    // Reset all of the user search result elements back to their default, hidden state
    $(".admin-module-main-container").addClass("active");
    $("#user-icon").removeClass("loaded");
    $("#user-icon").children("img").attr("data-original", '../images/visitor_icon.png');
    $("#user-icon").children("img").attr("src", '../images/visitor_icon.png');
    $("#remove-user-icon").removeClass("active");
    $("#revert-changes").removeClass("active");
    $("#user-info").removeClass("active");
    $("#user-stats").removeClass("active");
    $(this).children("span").removeClass("active");
    $("#ban-user").removeClass("active");
    $("#save-changes").removeClass("active");
    $("#no-changes").removeClass("active");

    // Make a GET request to get the user's icon
    $.get(`/api/user/user_icon/${username}`, (user_icon, textStatus, xhr) => {
        if (xhr.status === 200) {
            // If the user has uploaded an icon, set the img element accordingly
            $("#user-icon").children("img").attr("data-original", $(user_icon.medium).attr("src"));
            $("#user-icon").children("img").attr("src", $(user_icon.medium).attr("src"));

            // Mark the user icon as loaded
            $("#user-icon").addClass("loaded");
            $("#remove-user-icon").addClass("active");
        } else {
            // Otherwise, the user has the default user icon
            $("#user-icon").children("img").attr("data-original", '../images/visitor_icon.png');
        }
    });

    // Make a GET request to get the user's ban status
    $.get(`/api/admin/ban_status/${username}`, is_banned => {
        // Check the checkbox if the user is banned
        $("#ban-user-checkbox").attr("data-original", is_banned);
        $("#ban-user-checkbox").attr("checked", is_banned);

        // Unhide the relevant elements
        $("#ban-user").addClass("active");
        $("#save-changes").addClass("active");
        $("#revert-changes").addClass("active");
    }).fail(() => {
        $(this).children("span").addClass("active");
        return;
    });

    // Make a GET request to get the user's user info
    $.get(`/api/admin/user_info/${username}`, data => {
        // Set the username and email accordingly
        $("#username").attr("data-original", data.username);
        $("#username").text(data.username);
        $("#email").attr("data-original", data.email);
        $("#email").text(data.email);

        // Unhide the relevant elements
        $("#user-info").addClass("active");
        $("#save-changes").addClass("active");
        $("#revert-changes").addClass("active");
    }).fail(() => {
        $(this).children("span").addClass("active");
        return;
    });

    // Make a GET request to get the user's gameplay statistics
    $.get(`/api/admin/gameplay_stat/${username}`, data => {
        const stats = ["economy", "order", "health", "diplomacy"];
        
        // Set the four statistics accordingly
        for (let i = 0; i < 4; i++) {
            $(".stat").eq(i).attr("data-original", data[stats[i]]);
            $(".stat").eq(i).text(data[stats[i]]);
        }

        // Unhide the relevant elements
        $("#user-stats").addClass("active");
        $("#save-changes").addClass("active");
        $("#revert-changes").addClass("active");
    }).fail(() => {
        $(this).children("span").addClass("active");
        return;
    });

    return false;
});

/*
 * Removes a user's icon and replaces it with the default icon 
 */
$("#remove-user-icon").on("click", function() {
    $(this).prev("#user-icon").children("img").attr("src", "../images/visitor_icon.png")
});

/*
 * Allows the admin user to increase or decrease a user's stats while limiting a stat's value to a min of 0 and a max of 100
 */
$(".change-stat").on("click", function() {
    $(this).prevAll(".stat:first").text(Math.max(0, Math.min(100, parseInt($(this).prevAll(".stat:first").text()) + ($(this).hasClass("decrease-stat") ? -1 : 1))));
});

/*
 * Checks what changes to a user's info has been made by the admin user (which will display the relevant bullet points in the confirm changes popup)
 */
$("#save-changes").on("click", function() {
    $("#no-changes").removeClass("active");
    changes.user = $("#user-search").val();

    // Check to see if the admin user intends to ban the user. If so, the bullet point corresponding to that will be displayed in the comfirm changes popup
    if ($("#ban-user-checkbox").is(":checked") && $("#ban-user-checkbox").attr("data-original") === 'false') {
        changes.banUser = true;
        $("#ban-user-confirm").addClass("active");
    }

    // Check to see if the admin user intends to unban the user. If so, the bullet point corresponding to that will be displayed in the comfirm changes popup
    if (!$("#ban-user-checkbox").is(":checked") && $("#ban-user-checkbox").attr("data-original") === 'true') {
        changes.unbanUser = true;
        $("#unban-user-confirm").addClass("active");
    }

    // Check to see if the admin user intends on removing the user's user icon. If so, the bullet point corresponding to that will be displayed in the comfirm changes popup
    if ($("#user-icon > img").attr("src") !== $("#user-icon > img").attr("data-original")) {
        changes.removeUserIcon = true;
        $("#remove-user-icon-confirm").addClass("active");
    }

    // Check to see if the admin user intends on changing one or more of the user's stats. If so, the bullet point corresponding to that will be displayed in the comfirm changes popup
    $(".stat").each(function() {
        if ($(this).text() !== $(this).attr("data-original")) {
            $("#change-stats-confirm").addClass("active");
            changes.changeStats = true;
        }
    });

    // Display the confirm changes popup if changes has been made. Otherwise, display a text indicator indicating that no changes have been made.
    if (Object.values(changes).filter(change => typeof(change) !== "string" && change).length) {
        $("#popup-module-blackout").addClass("active");
    } else {
        $("#no-changes").addClass("active");
    }
});

/*
 * Handles the change of the user data when the admin confirms the changes  
 */
$("#confirm-changes").on("click", function() {
    // The admin has banned the user, make a POST request to ban the user
    if (changes.banUser) {
        $.post(`/api/admin/change_ban/${changes.user}/ban`);
        $("#ban-user-checkbox").attr("data-original", true);
    } else if (changes.unbanUser) { // The user has unbanned the user, make a POST request to unban the user
        $.post(`/api/admin/change_ban/${changes.user}/unban`);
        $("#ban-user-checkbox").attr("data-original", false);
    }

    // The user has removed the user's user icon, make a POST request to delete the user's user icon
    if (changes.removeUserIcon) {
        $.ajax({
            url: `/api/admin/delete_icon/${changes.user}`,
            method: 'DELETE',
            success: function(res) {
                $("#user-icon").children("img").attr("data-original", '../images/visitor_icon.png');
            }
        });
    }

    // The user has changed the user's statistic(s), make a POST request to modify the user's gameplay statistics
    if (changes.changeStats) {
        $.post(`/api/admin/change_stats/${changes.user}`, {
            economy: parseInt($(".stat").eq(0).text()),
            order: parseInt($(".stat").eq(1).text()),
            health: parseInt($(".stat").eq(2).text()),
            diplomacy: parseInt($(".stat").eq(3).text()),
        });

        $(".stat").eq(0).attr("data-original", $(".stat").eq(0).text());
        $(".stat").eq(1).attr("data-original", $(".stat").eq(1).text());
        $(".stat").eq(2).attr("data-original", $(".stat").eq(2).text());
        $(".stat").eq(3).attr("data-original", $(".stat").eq(3).text());
    }

    // Close the confirm changes popup
    $(this).closest("#popup-module-blackout").removeClass("active");

    // Reset the bullet points that summarizes what changes have been made 
    $("li").each(function() {
        $(this).removeClass("active");
    });

    // Reset the object values that keep track of whether a change has been made
    changes.banUser = false;
    changes.unbanUser = false;
    changes.removeUserIcon = false;
    changes.changeStats = false;
});

/*
 * Allows the admin user to revert changes to a user's info to its original values (stored in the data-original attribute) given that they haven't saved the changes
 */
$("#revert-changes").on("click", function() {
    $("*[data-original]").each(function() {
        if ($(this).is("img")) {
            $(this).attr("src", $(this).data("original"));
        } else {
            $(this).text($(this).data("original"));
        }
    });
});

/* 
 * Updates the value indicator for the stat effect range input
 */
$("input[type='range']").on("change", function() {
    // Adds a '+' before the value for consistency if the value is positive
    if ($(this).val() > 0) {
        $(this).next(".stat-effect-value").text("+" + $(this).val());
    } else {
        $(this).next(".stat-effect-value").text($(this).val());
    }
});

/*
 * Makes the establishment input fields required if their respective checkbox has been checked
 */
$("input[type='checkbox']").change(function() {
    $(this).next().children("input[type='text'], textarea").each(function() {
        if ($(this).attr("required")) {
            $(this).removeAttr('required');
        } else {
            $(this).attr('required', true);
        }
    });
});

/*
 * Handles when the user submits the event creation form
 */
$("form#event-search-form").submit(function(e) {
    // Prevent the form from reloading the page since this operation is an in-place search
    e.preventDefault();

    // Reset the form by hiding the establishments section (since they are optional)
    $("#choice-one-establishment").removeClass("active");
    $("#choice-two-establishment").removeClass("active");

    // Get the event name from the input
    const event_name = $(this).children("#event-search").val();

    // Make a GET request to fetch the relevant event
    $.get(`/api/admin/search_event/${event_name}`, data => {
        // Hide the event creation form and show the event search results
        if ($(this).hasClass("active")) {
            $(this).next().removeClass("active event-search");
        } else {
            $(this).children("#new-event").removeClass("active");
            $(this).next().removeClass("event-form").addClass("active event-search");
        }

        // Set the respective fields accordingly based on the data received from the GET request
        $("#event-search-name").text(data.event.name);
        $("#event-search-description").text(data.event.description);

        // Set the respective choice one fields accordingly based on the data received from the GET request
        $("#event-search-choice-one-description").text(data.event.choiceOne.description);
        $("#event-search-choice-one-econ").text(data.event.choiceOne.statChange.economy);
        $("#event-search-choice-one-order").text(data.event.choiceOne.statChange.order);
        $("#event-search-choice-one-health").text(data.event.choiceOne.statChange.health);
        $("#event-search-choice-one-diplomacy").text(data.event.choiceOne.statChange.diplomacy);

        // Check if the event has an establishment for choice one
        if (data.choice_one_establishment) {
            // Set the respective establisment fields accordingly based on the data received from the GET request
            $("#choice-one-establishment").addClass("active");

            $("#event-search-choice-one-establishment-name").text(data.choice_one_establishment.name);
            $("#event-search-choice-one-establishment-description").text(data.choice_one_establishment.description);
            $("#event-search-choice-one-establishment-econ").text(data.choice_one_establishment.statChange.economy);
            $("#event-search-choice-one-establishment-order").text(data.choice_one_establishment.statChange.order);
            $("#event-search-choice-one-establishment-health").text(data.choice_one_establishment.statChange.health);
            $("#event-search-choice-one-establishment-diplomacy").text(data.choice_one_establishment.statChange.diplomacy);
            
        }

        // Set the respective choice two fields accordingly based on the data received from the GET request
        $("#event-search-choice-two-description").text(data.event.choiceTwo.description);
        $("#event-search-choice-two-econ").text(data.event.choiceTwo.statChange.economy);
        $("#event-search-choice-two-order").text(data.event.choiceTwo.statChange.order);
        $("#event-search-choice-two-health").text(data.event.choiceTwo.statChange.health);
        $("#event-search-choice-two-diplomacy").text(data.event.choiceTwo.statChange.diplomacy);

        // Check if the event has an establishment for choice two
        if (data.choice_two_establishment) {
            // Set the respective establisment fields accordingly based on the data received from the GET request
            $("#choice-two-establishment").addClass("active");

            $("#event-search-choice-two-establishment-name").text(data.choice_two_establishment.name);
            $("#event-search-choice-two-establishment-description").text(data.choice_two_establishment.description);
            $("#event-search-choice-two-establishment-econ").text(data.choice_two_establishment.statChange.economy);
            $("#event-search-choice-two-establishment-order").text(data.choice_two_establishment.statChange.order);
            $("#event-search-choice-two-establishment-health").text(data.choice_two_establishment.statChange.health);
            $("#event-search-choice-two-establishment-diplomacy").text(data.choice_two_establishment.statChange.diplomacy);
            
        }
    }).fail(() => {
        $(this).children("span").addClass("active");
    });
});

/*
 * Displays the new event creation module when the user clicks on the "New Event" button
 */
$("#new-event").on("click", function(e) {
    e.preventDefault();

    // Show the event creation form while also hiding the event search results
    if ($(this).hasClass("active")) {
        $(this).parent().next().removeClass("active event-form");
    } else {
        $(this).parent().next().removeClass("event-search").addClass("active event-form");
    }

    $(this).toggleClass("active");
});