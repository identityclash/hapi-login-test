/**
 * Created by Omnius on 6/27/16.
 */
const retrieveUserInfo = function () {

    const hawkSessionTokenCookie = MyUtils.getCookie('Hawk-Session-Token');
    const decodedHawkSessionTokenCookie =  window.atob(hawkSessionTokenCookie);
    const tokenCredentials = JSON.parse(decodedHawkSessionTokenCookie);

    const algorithm = tokenCredentials.algorithm;
    const userId = tokenCredentials.userId;
    const ikm = tokenCredentials.hawkSessionToken;
    const info = location.host + '/hawkSessionToken';
    const salt = '';
    const length = 2 * 32;

    const protocol = 'http://' // location.protocol + '//';
    const url = protocol + location.host + '/user/' + userId + '/profile';

    console.log('url: ' + url);

    retrieveFromToken(ikm, info, salt, length, function (id, key) {

        const hawkCredentials = {
            id: id,
            key: key,
            algorithm: algorithm
        };

        const header = HawkBrowser.client.header(url,
            'GET',
            {credentials: hawkCredentials, ext: 'some-app-data'});

        $.ajax({
            type: 'GET',
            url: url,
            data: {},
            crossDomain: true,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', header.field);
            },
            success: function (data, textStatus, jQxhr) {
                console.log('status: ' + textStatus);

                $('.profile-info').css('visibility', 'visible');

                $('#profile-firstname').text(data.firstname);
                $('#profile-surname').text(data.surname);
                $('#profile-birthdate').text(data.birthdate);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('error: ' + textStatus + ' ' + errorThrown);
            }
        });
    });
};
