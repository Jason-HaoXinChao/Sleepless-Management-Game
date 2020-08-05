'use strict';

/*
 * Deletes feedback from page
 */

$("#delete-button").on("click", function() {
    // removes user feedback #1
    if ($("input#checkbox1").is(":checked")){
        $('#feedback1').remove();
    }
    // removes user feedback #2
    if ($("input#checkbox2").is(":checked")){
        $('#feedback2').remove();
    }
    // removes user feedback #2
    if ($("input#checkbox3").is(":checked")){
        $('#feedback3').remove();
    }
    // removes user feedback #2
    if ($("input#checkbox4").is(":checked")){
        $('#feedback4').remove();
    }
});
