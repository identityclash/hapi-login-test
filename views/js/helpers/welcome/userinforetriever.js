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
        $('#alertForbidden').removeClass('hidden');
    }

    const requestUrl = requestProtocol + location.host + '/user/' + userId + '/profile';

    $.ajax({
        type: 'GET',
        url: requestUrl,
        crossDomain: false,
        success: function (data, textStatus, xhr) {

            $('.profile-info').css('visibility', 'visible');

            $('#profile-firstname').text(data.firstname);
            $('#profile-surname').text(data.surname);
            $('#profile-birthdate').text(data.birthdate);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log('error: ' + textStatus + ' ' + errorThrown);

            $('#alertForbidden').removeClass('hidden');
        }
    });
};
