/**
 * Created by Omnius on 18/08/2016.
 */
'use strict';

const submitForm = () => {

    $('#alertInvalid').addClass('hidden');
    $('#alertInvalidUsername').addClass('hidden');
    $('#alertInvalidEmail').addClass('hidden');
    $('#alertInvalidPassword').addClass('hidden');
    $('#alertInvalidFirstName').addClass('hidden');
    $('#alertInvalidSurname').addClass('hidden');
    $('#alertInvalidBirthDate').addClass('hidden');
    $('#alertUserExists').addClass('hidden');

    // TODO: Supposedly needs sanitation using ESAPI.encoder().encodeForJavascript() or some other sanitation
    // mechanism on input fields
    const username = $('#inputUsername').val();
    const email = $('#inputEmail').val();
    const password = $('#inputPassword').val();
    const firstName = $('#inputFirstName').val();
    const surname = $('#inputSurname').val();
    const birthDate = $('#inputBirthDate').val();
    const crumbz = $('#inputCrumbz').val();

    const payload = {
        username: username,
        email: email,
        password: password,
        firstname: firstName,
        surname: surname,
        birthdate: birthDate,
        Crumbz: crumbz
    };

    $.ajax({
        type: 'POST',
        url: '/user/registration',
        contentType: 'application/json; charset=utf-8',
        processData: false,
        beforeSend: (xhr) => {
            // const crumbz = MyUtils.getCookie('Crumbz');
            // xhr.setRequestHeader('X-CSRF-Token', crumbz);
        },
        data: JSON.stringify(payload),
        success: function (data, textStatus, xhr) {
            if (data === 'registered') {
                const protocol = location.protocol + '//';
                window.location = protocol + location.host + '/login?registered=true';
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            // const csrf = xhr.getResponseHeader('x-csrf-token');
            //
            // if (csrf) {
            //     document.cookie = 'Crumbz=' + csrf + '; path=/';
            // }

            if (xhr.status === 400 && textStatus === 'error') {
                $('#alertInvalid').removeClass('hidden');

                if (xhr.responseJSON.message.toLowerCase().indexOf('username') > -1) {
                    $('#alertInvalidUsername').removeClass('hidden');
                }
                if (xhr.responseJSON.message.toLowerCase().indexOf('email') > -1) {
                    $('#alertInvalidEmail').removeClass('hidden');
                }
                if (xhr.responseJSON.message.toLowerCase().indexOf('password') > -1) {
                    $('#alertInvalidPassword').removeClass('hidden');
                }
                if (xhr.responseJSON.message.toLowerCase().indexOf('firstname') > -1) {
                    $('#alertInvalidFirstName').removeClass('hidden');
                }
                if (xhr.responseJSON.message.toLowerCase().indexOf('surname') > -1) {
                    $('#alertInvalidSurname').removeClass('hidden');
                }
                if (xhr.responseJSON.message.toLowerCase().indexOf('birthdate') > -1) {
                    $('#alertInvalidBirthDate').removeClass('hidden');
                }
                if (xhr.responseJSON.message.toLowerCase().indexOf('user_already_exists') > -1) {
                    $('#alertUserExists').removeClass('hidden');
                }
            }
            if (xhr.status === 500) {
                const protocol = location.protocol + '//';
                window.location = protocol + location.host + '/html/500.html';
            }
        }
    });
};
