'use strict';

/*
 * Removes a user's icon and replaces it with a temporary icon 
 */
$("#remove-user-icon").on("click", function() {
    $(this).prev("#user-icon").children("img").attr("src", "../images/visitor_icon.png")
});

/*
 * When the "Edit Username" button is clicked, make the username text editable via the contenteditable attr 
 */
$("#edit-username").on("click", function() {
    $("#username").attr("contenteditable", $(this).prev("span").attr("contenteditable") == 'false');
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
    // Check to see if the admin user intends to ban the user. If so, the bullet point corresponding to that will be displayed in the comfirm changes popup
    if ($("input#ban-user-checkbox").is(":checked")) {
        $("li#ban-user-confirm").addClass("active");
    }

    // Check to see if the admin user intends on removing the user's avatar. If so, the bullet point corresponding to that will be displayed in the comfirm changes popup
    if ($("#user-icon > img").attr("src") != $("#user-icon > img").attr("data-original")) {
        $("li#remove-user-icon-confirm").addClass("active");
    }

    // Check to see if the admin user intends on changing the user's username. If so, the bullet point corresponding to that will be displayed in the comfirm changes popup
    if ($("#username").text() != $("#username").attr("data-original")) {
        $("li#change-username-confirm").addClass("active");
    }

    // Check to see if the admin user intends on changing one or more of the user's stats. If so, the bullet point corresponding to that will be displayed in the comfirm changes popup
    $(".stat").each(function() {
        if ($(this).text() != $(this).attr("data-original")) {
            $("li#change-stats-confirm").addClass("active");
        }
    });

    // Display the confirm changes popup if changes has been made. Otherwise, display a text indicator indicating that no changes have been made.
    if ($("li.active").length) {
        $("#popup-module-blackout").addClass("active");
    } else {
        $("#no-changes").addClass("active");

        setTimeout(function() {
            $("#no-changes").removeClass("active");
        }, 2000);
    }
});

/*
 * Displays a change confirmation to the admin user
 * NOTE: some functionality is not yet present until we access to a server in phase 2 
 */
$("#confirm-changes").on("click", function() {
    // In phase 2, once the admin user confirms the changes, the updated user info should be sent to the server and override the existing info of the user

    // Upon confirming the changes, update the data-original attribute values with the new user info values
    $("*[data-original]").each(function() {
        if ($(this).is("img")) {
            $(this).attr("data-original", $(this).attr("src"));
        } else {
            $(this).attr("data-original", $(this).text());
        }
    });

    // Close the confirm changes popup
    $(this).closest("#popup-module-blackout").removeClass("active");

    // Reset the bullet points that summarizes what changes have been made 
    $("li").each(function() {
        $(this).removeClass("active");
    });
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
 * Displays the new event creation module when the user clicks on the "New Event" button
 */
$("#new-event").on("click", function() {
    $(this).parent().next().addClass("active");
});

/*
 * Handles the submission for the new event form
 * NOTE: this functionality is not yet present until we access to a server in phase 2 
 */
$("#event-form").on("submit", function() {
    // Currently, the new event creation form doesn't do anything when you submit it, but in phase 2, when the admin user submits the form, the new event's info will be sent to our server
});

/*
 * Displays the corresponding user/event data based on the admin user's search term
 * NOTE: this functionality is not yet present until we access to a server in phase 2 
 */
$(".admin-module-header button").on("click", function() {
    // Currently, a "______ not found..." text indicator is displayed to the admin user when they search for a user or an admin.
    // In phase 2, a request would be made to the server to attempt to retrieve the specified user/event's info

    const notFoundIndicator = $(this).next();

    // Displays the text indicator 
    notFoundIndicator.addClass("active");

    // Makes the text indicator dissapears on its own after 2 seconds
    setTimeout(function() {
        notFoundIndicator.removeClass("active");
    }, 2000);
});