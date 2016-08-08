/**
 * Created by Omnius on 6/3/16.
 */
'use strict';

module.exports = () => {

    return (request, reply) => {

        const authCredentials = request.auth.credentials;
        const userId = authCredentials.userId;

        const credentials = {
            hawkSessionToken: authCredentials.hawkSessionToken,
            algorithm: authCredentials.algorithm,
            userId: userId
        };

        return reply('successful login')
            .state('Hawk-Session-Token', credentials);
    };
};
