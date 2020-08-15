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

        fetch(`/api/user/user_flag/${profile}`).then(res => {
            if (res) {
                return res.json();
            }
        }).then(json => {
            $(".country-flag").attr("src", json.url);
        }).catch(err => {
            console.log(err);
        }).finally(() => {
            $(".country-flag").addClass("loaded");
        });

        fetch(`/api/user/gameplay/stat/all/${profile}`).then(res => {
            if (res) {
                return res.json();
            }
        }).then(json => {
            const econ = json.statistic.economy;
            const order = json.statistic.order;
            const health = json.statistic.health;
            const diplomacy = json.statistic.diplomacy;

            $("#econBar").children().width(`${econ}%`).text(econ).attr("id", econ >= 50 ? "green" : "red");
            $("#orderBar").children().width(`${order}%`).text(order).attr("id", order >= 50 ? "green" : "red");
            $("#healthBar").children().width(`${health}%`).text(health).attr("id", health >= 50 ? "green" : "red");
            $("#diplomacyBar").children().width(`${diplomacy}%`).text(diplomacy).attr("id", diplomacy >= 50 ? "green" : "red");
        });

        fetch(`/api/user/user_profile_info/${profile}`).then(res => {
            if (res) {
                return res.json();
            }
        }).then(json => {
            $("#username").text(json.username);
            $("#country-name").val(json.profile.countryname);
            $("#email").val(json.profile.email);

            const optional_user_info = ["age", "country", "gender", "socialMedia"];
            
            optional_user_info.forEach(field => {
                if (!json.profile[field]) return;

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

                        if (!json.profile.socialMedia || !json.profile.socialMedia.length) {
                            $("#social-media").append(`<li><input class="social-media-account" type="text" placeholder="Not Set" disabled="" /></li>`);
                            break;
                        }
                        
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
        $("#popup-module-blackout").addClass("active user-icon");
    });

    /*
    * Change country flag
    */
    $("#edit-flag").on("click", function() {
        $("#popup-module-blackout").addClass("active user-flag");
    });

    /*
    * Change country flag
    */
    $("#edit-country-name").on("click", function() {
        if (!$(this).hasClass("save-country-name")) {
            $(this).addClass("save-country-name");
            $("#country-name").removeAttr("disabled");
        }  else if ($("#country-name").val() !== '') {            
            $(this).removeClass("save-country-name");
            $("#country-name").attr("disabled", true);

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
        if ($(this).val() !== ''  && !$(this).parent().next().length) {
            $(this).closest("#social-media").append('<li><input class="social-media-account" type="text" placeholder="Not Set"></input></li>');
        }
    });

    /*
    * Closes pop up window
    * NOTE: some functionality is not yet present until we access to a server in phase 2 
    */
    $("#confirm-changes, #close-popup-module").on("click", function() {
        // In phase 2, once the user will be able to uplaod a new image
        // Close the confirm changes popup
        $(this).closest("#popup-module-blackout").removeClass("active user-icon user-flag");
    });
}