'use strict';

$("#remove-user-icon").on("click", function() {
    $(this).prev("#user-icon").children("img").attr("src", "home_login/visitor_icon.png")
});

$("#edit-username").on("click", function() {
    $("#username").attr("contenteditable", $(this).prev("span").attr("contenteditable") == 'false');
});

$(".change-stat").on("click", function() {
    $(this).prevAll(".stat:first").text(Math.max(0, Math.min(100, parseInt($(this).prevAll(".stat:first").text()) + ($(this).hasClass("decrease-stat") ? -1 : 1))));
});

$("#save-changes").on("click", function() {
    if ($("input#ban-user-checkbox").is(":checked")) {
        $("li#ban-user-confirm").addClass("active");
    }

    if ($("#user-icon > img").attr("src") != $("#user-icon > img").attr("data-original")) {
        $("li#remove-user-icon-confirm").addClass("active");
    }

    if ($("#username").text() != $("#username").attr("data-original")) {
        $("li#change-username-confirm").addClass("active");
    }

    $(".stat").each(function() {
        if ($(this).text() != $(this).attr("data-original")) {
            $("li#change-stats-confirm").addClass("active");
        }
    });

    if ($("li.active").length) {
        $("#popup-module-blackout").addClass("active");
    } else {
        $("#no-changes").addClass("active");

        setTimeout(function() {
            $("#no-changes").removeClass("active");
        }, 2000);
    }
});

$("#confirm-changes").on("click", function() {
    $("*[data-original]").each(function() {
        if ($(this).is("img")) {
            $(this).attr("data-original", $(this).attr("src"));
        } else {
            $(this).attr("data-original", $(this).text());
        }
    });

    $(this).closest("#popup-module-blackout").removeClass("active");

    $("li").each(function() {
        $(this).removeClass("active");
    });
});

$("#revert-changes").on("click", function() {
    $("*[data-original]").each(function() {
        if ($(this).is("img")) {
            $(this).attr("src", $(this).data("original"));
        } else {
            $(this).text($(this).data("original"));
        }
    });
});