// toggles between signin and login form
$(function() {
    $(".form-toggle").on("click", function(e) {
        e.stopImmediatePropagation();

        $(this).closest("#form-module-container").toggleClass("sign-up");
    });
});