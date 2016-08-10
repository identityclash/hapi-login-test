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

    retrieveFromToken(ikm, info, salt, length, function (id, key) {

        const hawkCredentials = {
            id: id,
            key: key,
            algorithm: algorithm
        };

        // workaround
        const httpProtocol = 'http://';
        const hawkUrl = httpProtocol + location.host + '/user/' + userId + '/profile';

        console.log('hawkUrl: ' + hawkUrl);

        const header = HawkBrowser.client.header(hawkUrl,
            'GET',
            {credentials: hawkCredentials, ext: 'some-app-data'});

        const requestProtocol = location.protocol + '//';
        const requestUrl = requestProtocol + location.host + '/user/' + userId + '/profile';

        console.log('requestUrl: ' + requestUrl);

        $.ajax({
            type: 'GET',
            url: requestUrl,
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
