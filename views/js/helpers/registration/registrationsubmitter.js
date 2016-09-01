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
        data: JSON.stringify(payload),
        success: function (data, textStatus, xhr) {
            if (data === 'registered') {
                const protocol = location.protocol + '//';
                window.location = protocol + location.host + '/login?registered=true';
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            if (xhr.status === 400 && textStatus === 'error') {
                $('#alertInvalid').removeClass('hidden');

                const items = [
                    {
                        issue: 'username',
                        id: 'alertInvalidUsername'
                    },
                    {
                        issue: 'email',
                        id: 'alertInvalidEmail'
                    },
                    {
                        issue: 'password',
                        id: 'alertInvalidPassword'
                    },
                    {
                        issue: 'firstname',
                        id: 'alertInvalidFirstName'
                    },
                    {
                        issue: 'surname',
                        id: 'alertInvalidSurname'
                    },
                    {
                        issue: 'birthdate',
                        id: 'alertInvalidBirthDate'
                    },
                    {
                        issue: 'user_already_exists',
                        id: 'alertUserExists'
                    }
                ];

                for (let i = 0; i < items.length; i++) {
                    if (xhr.responseJSON.message.toLowerCase().indexOf(items[i].issue) > -1) {
                        $(`#${items[i].id}`).removeClass('hidden');
                    }
                }
            }
            if (xhr.status === 500) {
                const protocol = location.protocol + '//';
                window.location = protocol + location.host + '/html/500.html';
            }
        }
    });
};
