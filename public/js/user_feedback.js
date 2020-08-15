'use strict';

$(window).on("load", function() {
    fetch('/api/admin/feedback').then(res => {
        if (res) {
            return res.json();
        }
    }).then(json => {
        json.forEach(feedback => {
            $(".user-feedback-container").append(`
                <div class="feedback-box" id="${feedback._id}">
                    <input id="checkbox" type="checkbox" />
                    <div class="textbox">
                        <p class="from">
                            <b>From:</b> ${feedback.sender}
                        </p>
                        <p class="message">
                            <b>Message:</b> ${feedback.content}
                        </p>
                    </div>
                </div>
            `)
        });
    }).catch(err => {
        log(err);
    });
});

/*
 * Check all of the checkboxes
 */
$("#select-all").on("click", function() {
    if (!$(this).hasClass('deselect')) {
        $(this).addClass("deselect");

        $('input[type="checkbox"]').each(function() {
            $(this).prop("checked", true);
        });
    } else {
        $(this).removeClass("deselect");
        
        $('input[type="checkbox"]').each(function() {
            $(this).prop("checked", false);
        });
    }
});

/*
 * Deletes feedback from page
 */
$("#delete").on("click", function() {
    $('input[type="checkbox"]:checked').each(function() {
        const feedback_box = $(this).closest(".feedback-box");
        const id = `/api/admin/feedback/${feedback_box.attr("id")}`;

        $.ajax({
            url: id,
            method: 'DELETE',
            success: function(res) {
                feedback_box.remove();
            }
        });
    });
});
