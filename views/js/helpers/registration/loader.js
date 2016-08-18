/**
 * Created by Omnius on 08/08/2016.
 */
'use strict';

$(document).ready(function() {
    $('#inputBirthDate').datepicker();

    $('#closeInvalid').click(function () {
        $('#alertInvalid').addClass('hidden');
        $('#alertInvalidUsername').addClass('hidden')
        $('#alertInvalidEmail').addClass('hidden');
        $('#alertInvalidPassword').addClass('hidden');
        $('#alertInvalidFirstName').addClass('hidden');
        $('#alertInvalidSurname').addClass('hidden');
        $('#alertInvalidBirthDate').addClass('hidden');
        $('#alertUserExists').addClass('hidden');
    });

    $('#btnSubmit').click(function () {
        submitForm();
    });
});
