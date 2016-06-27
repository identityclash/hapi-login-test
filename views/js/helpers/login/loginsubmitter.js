/**
 * Created by Omnius on 6/27/16.
 */
const submitForm = function () {

    // TODO: Supposedly needs sanitation using ESAPI.encoder().encodeForJavascript() or some other sanitation
    // mechanism on inputUsername and inputPassword
    const username = $('#inputUsername').val();
    const password = $('#inputPassword').val();

    // // Not the best way to send the username and password, but it will suffice for demo purposes for now.
    $('#formLogin').attr('action', 'http://' + username + ':' + password + '@' + location.host + '/user/welcomeb');

    $('#formLogin').submit();
};
