/**
 * Created by Omnius on 6/27/16.
 */

$(document).ready(function() {

    $('#closeUnauthorized').click(function () {
        $('#alertUnauthorized').addClass('hidden');
    });

    const query = document.URL.split('?');
    if (query.length === 2) {
        if (query[1].indexOf('registered') > -1) {
            $('#myModal').modal();
        }
    }

    $('#btnSubmit').click(function () {
        submitForm();
    });

    $('body').show();
});
