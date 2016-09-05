/**
 * Created by Omnius on 6/3/16.
 */
'use strict';

module.exports = () => {

    return function (request, reply) {

        const authCredentials = request.auth.credentials;
        const credentials = {
            hawkSessionToken: authCredentials.hawkSessionToken,
            algorithm: authCredentials.algorithm,
            userId: authCredentials.userId
        };

        return reply({userId: authCredentials.userId})
            .state('Hawk-Session-Token', credentials)
            .header('Cache-Control', 'no-cache, no-store, must-revalidate')
            .header('X-Permitted-Cross-Domain-Policies', 'master-only');
    };
};
