/**
 * Created by Omnius on 6/27/16.
 */
$(document).ready(function() {
    const hawkSessionTokenCookie = MyUtils.getCookie('Hawk-Session-Token');

    $('#btnRetrieve').click(function () {
        retrieveUserInfo();
    });
});
