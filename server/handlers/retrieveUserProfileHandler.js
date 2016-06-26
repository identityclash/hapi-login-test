/**
 * Created by Omnius on 6/18/16.
 */
'use strict';

const generateToken = require(process.cwd() + '/server/helpers/hkdfTokenGenerator').generateToken;

module.exports = () => {

    return (request, reply) => {

        const server = request.server;
        const redis = request.redis;
        const dao = server.methods.dao;
        const userProfileDao = dao.userProfileDao;
        const userCredentialDao = dao.userCredentialDao;
        const credentials = request.auth.credentials;
        const userId = credentials.user;
        const oldSessionId = credentials.id;

        generateToken(request.info.host + '/hawkSessionToken', null, (newSessionId, newAuthKey, newToken) => {

            const newCredentials = {
                hawkSessionToken: newToken,
                algorithm: 'sha256'
            };

            newCredentials.userId = userId;

            userCredentialDao.deleteUserCredential(redis, oldSessionId, (err) => {
                if (err) {
                    server.log(err);
                }
            });

            userCredentialDao.updateUserCredential(redis, newSessionId, {
                user: userId,
                id: newSessionId,
                key: newAuthKey,
                algorithm: 'sha256'
            }, (err) => {
                if (err) {
                    return reply(err);
                }

                let strCredential = '';

                for (const credential in newCredentials) {
                    if (newCredentials.hasOwnProperty(credential)) {
                        strCredential += (credential + '=' + newCredentials[credential] + ';');
                    }
                }

                strCredential = strCredential.slice(0, -1);

                server.log('credentials: ' + JSON.stringify(newCredentials));

                userProfileDao.readUserProfile(redis, userId, (err, userProfile) => {
                    if (err) {
                        return reply(err);
                    }

                    return reply(userProfile)
                        .state('Hawk-Session-Token', newCredentials)
                        .header('Hawk-Session-Token', strCredential)
                        .header('Access-Control-Expose-Headers', 'Hawk-Session-Token');
                });
            });
        });
    };
};
