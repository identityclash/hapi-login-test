/**
 * Created by Omnius on 6/27/16.
 */
const retrieveUserInfo = function () {

    const requestProtocol = location.protocol + '//';

    const pathnameArray = location.pathname.split('/');

    let userId;
    if (pathnameArray[1] === 'user') {
        userId = pathnameArray[2];
    } else {
        // TODO: redirect to error page - 404 resource not found
    }

    const requestUrl = requestProtocol + location.host + '/user/' + userId + '/profile';

    $.ajax({
        type: 'GET',
        url: requestUrl,
        data: {},
        crossDomain: false,
        success: function (data, textStatus, xhr) {
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
};
