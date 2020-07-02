$(".change-stat").on("click", function() {
    $(this).prevAll(".stat:first").text(Math.max(0, Math.min(100, parseInt($(this).prevAll(".stat:first").text()) + ($(this).hasClass("decrease-stat") ? -1 : 1))));
});

$(".edit-user-info").on("click", function() {
    $(this).prev("span").attr("contenteditable", $(this).prev("span").attr("contenteditable") == 'false');
});

$("#remove-user-icon").on("click", function() {
    $(this).prev("#user-icon").children("img").attr("src", "home_login/visitor_icon.png")
});