'use strict';

$(window).on('load', function() {
    fetch('/api/user/user_icon').then(res => {
        return res.json();
    }).then(json => {
        $(".user_icon").attr("src", $(json.avatar).attr("src"));
    }).catch(err => {
        console.log(err);
    }).finally(() => {
        $(".user_icon").addClass("loaded");
    });
});