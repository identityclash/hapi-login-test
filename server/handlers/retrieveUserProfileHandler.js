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
        const userId = credentials.userId;
        const oldSessionId = credentials.id;

        generateToken(request.info.host + '/hawkSessionToken', null, (newSessionId, newAuthKey, newToken) => {

            userCredentialDao.deleteUserCredential(redis, oldSessionId, (err) => {
                if (err) {
                    server.log(err);
                }
            });

            userCredentialDao.updateUserCredential(redis, newSessionId, {
                hawkSessionToken: newToken,
                userId: userId,
                id: newSessionId,
                key: newAuthKey,
                algorithm: 'sha256'
            }, (err) => {
                if (err) {
                    return reply.view('error', {
                        title: '500 - Server Error',
                        h1: '500 - Server Error',
                        message: 'Sorry, but the server has encountered an error.'
                    }).code(500).state('Hawk-Session-Token')
                        .header('X-Permitted-Cross-Domain-Policies', 'master-only');
                }

                const newCredentials = {
                    hawkSessionToken: newToken,
                    algorithm: 'sha256',
                    userId: userId
                };

                if (request.params.userId !== credentials.userId) {
                    return reply.view('error', {
                        title: '403 - Forbidden',
                        h1: '403 - Forbidden',
                        message: 'You are forbidden from accessing the resources.'
                    }).code(403).state('Hawk-Session-Token', newCredentials)
                        .header('X-Permitted-Cross-Domain-Policies', 'master-only');
                }

                userProfileDao.readUserProfile(redis, userId, (err, userProfile) => {
                    if (err) {
                        return reply(err);
                    }

                    return reply(userProfile)
                        .state('Hawk-Session-Token', newCredentials)
                        .header('X-Permitted-Cross-Domain-Policies', 'master-only');
                });
            });
        });
    };
};
