/**
 * Created by Omnius on 6/27/16.
 */
const submitForm = () => {

    // TODO: Supposedly needs sanitation using ESAPI.encoder().encodeForJavascript() or some other sanitation
    // mechanism on inputUsername and inputPassword
    const username = $('#inputUsername').val();
    const password = $('#inputPassword').val();

    $.ajax({
        type: 'GET',
        beforeSend: function (request) {
            request.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + password));
        },
        url: '/auth/basic',
        processData: false,
        success: function(data, textStatus, jQxhr){
            $('#formLogin').attr('action', '/user/welcome');
            $('#formLogin').submit();
        },
        error: function (xhr, textStatus, errorThrown) {
            if (xhr.status === 401) {
                $('#formUnauthorized').removeClass('hidden');
            }
        }
    });
};
