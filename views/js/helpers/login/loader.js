/**
 * Created by Omnius on 6/27/16.
 */
$(document).ready(function() {
    const hawkSessionTokenCookie = MyUtils.getCookie('Hawk-Session-Token');

    $('#closeUnauthorized').click(function () {
        $('#formUnauthorized').addClass('hidden');
    });

    const query = document.URL.split('?');
    if (query.length === 2) {
        if (query[1].indexOf('registered') > -1) {
            $('#myModal').modal();
        }
    }

    if (hawkSessionTokenCookie) {
        window.location = 'http://' + location.host + '/user/welcome';
    } else {
        $('body').show();
    }
});
