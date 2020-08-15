'use strict';

// Check if maincontent contain container elements (Note: container elements are only loaded if the user can be found)
if ($(".maincontent").children(".container").length) {
    // Run on page load
    $(window).on('load', function() {
        const profile_username = new URLSearchParams(window.location.search).get("profile");
        const profile = (profile_username) ? `${profile_username}` : "";

        // Make a GET request to get the user's user icon
        fetch(`/api/user/user_icon/${profile}`).then(res => {
            if (res) {
                return res.json();
            }
        }).then(json => {
            // Set the img src with the user icon's link
            $(".user-icon").attr("src", $(json.large).attr("src"));
        }).catch(err => {
            console.log(err);
        }).finally(() => {
            // Mark the user icon as loaded
            $(".user-icon").addClass("loaded");
        });

        // Make a GET request to get the user's flag
        fetch(`/api/user/user_flag/${profile}`).then(res => {
            if (res) {
                return res.json();
            }
        }).then(json => {
            // Set the img src with the flag's link
            $(".country-flag").attr("src", json.url);
        }).catch(err => {
            console.log(err);
        }).finally(() => {
            // Mark the flag as loaded
            $(".country-flag").addClass("loaded");
        });

        // Make a GET request to get the user's gameplay statistics
        fetch(`/api/user/gameplay/stat/all/${profile}`).then(res => {
            if (res) {
                return res.json();
            }
        }).then(json => {
            const econ = json.statistic.economy;
            const order = json.statistic.order;
            const health = json.statistic.health;
            const diplomacy = json.statistic.diplomacy;

            // Set the width, color, and text of the statistic bars accordingly
            $("#econBar").children().width(`${econ}%`).text(econ).attr("id", econ >= 50 ? "green" : "red");
            $("#orderBar").children().width(`${order}%`).text(order).attr("id", order >= 50 ? "green" : "red");
            $("#healthBar").children().width(`${health}%`).text(health).attr("id", health >= 50 ? "green" : "red");
            $("#diplomacyBar").children().width(`${diplomacy}%`).text(diplomacy).attr("id", diplomacy >= 50 ? "green" : "red");
        });

        // Make a GET request to get the user's profile info
        fetch(`/api/user/user_profile_info/${profile}`).then(res => {
            if (res) {
                return res.json();
            }
        }).then(json => {
            // Set the username, country name, and email field (since all users have these fields upon creating their account)
            $("#username").text(json.username);
            $("#country-name").val(json.profile.countryname);
            $("#email").val(json.profile.email);

            // However, the fields below are optional (requires the respective user to set them)
            const optional_user_info = ["age", "country", "gender", "socialMedia"];
            
            // Iterate through the optional fields
            optional_user_info.forEach(field => {
                // Check to see if the respective user has set the field
                if (!json.profile[field]) return;

                // Handle the field info accordingly
                switch (field) {
                    case 'age':
                        $("#age").val(json.profile.age);
                        break;
                    case 'country':
                        $("#country").val(json.profile.country);
                        break;
                    case 'gender':
                        $("#gender").val(json.profile.gender);
                        break;
                    case 'socialMedia':
                        $("#social-media").empty();

                        // If the user has not set any social media accounts, then just add a simple 'Not Set'
                        if (!json.profile.socialMedia || !json.profile.socialMedia.length) {
                            $("#social-media").append(`<li><input class="social-media-account" type="text" placeholder="Not Set" disabled="" /></li>`);
                            break;
                        }
                        
                        // Otherwise, iterate through the social media accounts and add them to the list
                        json.profile.socialMedia.forEach(account => {
                            if (profile !== "" && account == "") return;

                            $("#social-media").append(`<li><input class="social-media-account" type="text" placeholder="Not Set" value="${account}" disabled="" /></li>`);
                        });

                        break;
                }
            })
        });
    });

    /*
    * Change profile pic
    */
    $("#edit-profile-pic").on("click", function() {
        // Toggle the popup module and have it show the user icon upload form
        $("#popup-module-blackout").addClass("active user-icon");
    });

    /*
    * Change country flag
    */
    $("#edit-flag").on("click", function() {
        // Toggle the popup module and have it show the user icon upload form

        $("#popup-module-blackout").addClass("active user-flag");
    });

    /*
    * Change country name
    */
    $("#edit-country-name").on("click", function() {
        // Distinguish between whether the user is editting their country name and when they are saving their changes
        if (!$(this).hasClass("save-country-name")) {
            $(this).addClass("save-country-name");
            // Allow the user to input text into the input element
            $("#country-name").removeAttr("disabled");
        }  else if ($("#country-name").val() !== '') {            
            $(this).removeClass("save-country-name");
            // Lock the input elements from user input
            $("#country-name").attr("disabled", true);

            // Make a POST request to change the country name
            $.post('/api/user/change_country_name', {
                countryName: $("#country-name").val()
            }).fail(data => {
                window.location.replace(data.responseText);
            });
        }
    });

    /*
    * Update profile info
    */
    $("#edit-profile-info").on("click", function() {
        // Distinguish between whether the user is editting their profile info and when they are saving their changes
        if (!$(this).hasClass("save-profile")) {
            $(this).addClass("save-profile");

            // Allow the user to input text into the input elements
            $(this).prev().find("input").each(function() {
                $(this).removeAttr("disabled");
            });
        } else {
            $(this).removeClass("save-profile");

            // Lock the input elements from user input
            $(this).prev().find("input").each(function() {
                $(this).attr("disabled", true);
            });
            
            // Make a POST request to change the profile info
            $.post("/api/user/user_profile_info", {
                age: $("#age").val(),
                country: $("#country").val(),
                gender: $("#gender").val(),
                email: $("#email").val(),
                socialMedia: $(".social-media-account").map(function() {
                    return $(this).val();
                }).get()
            });
        }
    });

    /*
    * Handles the input fields of the social media account list 
    */
    $("#social-media").on("keyup", ".social-media-account", function() {
        if ($(this).val() === '' && !$(this).parent().is(":last-child")) {
            // Remove the input field if the user deletes all of the text in it (while ensuring that there is always at least one input left)
            $(this).parent().remove();
        } else if ($(this).val() !== '' && !$(this).parent().next().length) {
            // If the user has inputted something into the last input, add an additional input in case they need to add an additional social media account
            $(this).closest("#social-media").append('<li><input class="social-media-account" type="text" placeholder="Not Set"></input></li>');
        }
    });

    /*
    * Closes popup module
    */
    $("#confirm-changes, #close-popup-module").on("click", function() {
        // CLoses the popup module if the user confirms the changes or if they click the cancel button
        $(this).closest("#popup-module-blackout").removeClass("active user-icon user-flag");
    });
}