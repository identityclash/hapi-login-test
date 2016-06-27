/**
 * Created by Omnius on 6/27/16.
 */
$(document).ready(function() {
    const hawkSessionTokenCookie = MyUtils.getCookie('Hawk-Session-Token');

    console.log(hawkSessionTokenCookie);

    if (hawkSessionTokenCookie) {
        window.location = 'http://' + location.host + '/user/welcomeh';
    } else {
        $('body').css('visibility', 'visible');
    }
});
