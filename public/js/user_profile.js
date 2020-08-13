'use strict';

$(window).on('load', function() {
    fetch('/api/user/user_icon').then(res => {
        return res.json();
    }).then(json => {
        $(".user-icon").attr("src", $(json.large).attr("src"));
    }).catch(err => {
        console.log(err);
    }).finally(() => {
        $(".user-icon").addClass("loaded");
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
    $("#popup-module-blackout").addClass("active");
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
