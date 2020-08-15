/*
* Toggles between signin and login form
*/
$(".form-toggle").on("click", function(e) {
    e.stopImmediatePropagation();

    $(this).closest("#form-module-container").toggleClass("sign-up");
});