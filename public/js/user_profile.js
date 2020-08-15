'use strict';

if ($(".maincontent").children(".container").length) {
    $(window).on('load', function() {
        const profile_username = new URLSearchParams(window.location.search).get("profile");
        const profile = (profile_username) ? `${profile_username}` : "";

        fetch(`/api/user/user_icon/${profile}`).then(res => {
            if (res) {
                return res.json();
            }
        }).then(json => {
            $(".user-icon").attr("src", $(json.large).attr("src"));
        }).catch(err => {
            console.log(err);
        }).finally(() => {
            $(".user-icon").addClass("loaded");
        });

        fetch(`/api/user/user_profile_info/${profile}`).then(res => {
            if (res) {
                return res.json();
            }
        }).then(json => {
            $("#username").text(json.username);
            $("#country-name").text(json.profile.countryname);
            $("#email").val(json.profile.email);

            const optional_user_info = ["age", "country", "gender", "social_media"];
            
            optional_user_info.forEach(field => {
                if (!json.profile.field) return;

                switch (field) {
                    case 'countrypic':
                        break;
                    case 'socialMedia':
                        break;
                    default:
                        break;
                }
            })
        });
    });

    /*
    * Change profile pic
    */
    $("#edit-profile-pic").on("click", function() {
        $("#popup-module-blackout").addClass("active");
    });

    /*
    * Change country flag
    */
    $("#edit-flag").on("click", function() {
    $("#popup-module-blackout").addClass("active");
    });

    /*
    * Update profile info
    */
    $("#edit-profile-info").on("click", function() {
        if (!$(this).hasClass("save-profile")) {
            $(this).addClass("save-profile");

            $(this).prev().find("input").each(function() {
                $(this).removeAttr("disabled");
            });
        } else {
            $(this).removeClass("save-profile");

            $(this).prev().find("input").each(function() {
                $(this).attr("disabled", true);
            });
            
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

    $("#social-media").on("keyup", ".social-media-account", function() {
        if ($(this).val() === '' && !$(this).parent().is(":last-child")) {
            $(this).parent().remove();
        }
    });

    $("#social-media").on("keyup", ".social-media-account", function() {
        console.log($(this).val());
        if ($(this).val() !== ''  && !$(this).parent().next().length) {
            $(this).closest("#social-media").append('<li><input class="social-media-account" type="text" placeholder="Not Set"></input></li>');
        }
    });

    /*
    * Closes pop up window
    * NOTE: some functionality is not yet present until we access to a server in phase 2 
    */
    $("#confirm-changes").on("click", function() {
        // In phase 2, once the user will be able to uplaod a new image
        // Close the confirm changes popup
        $(this).closest("#popup-module-blackout").removeClass("active");
    });
}