/**
 * Created by Omnius on 6/26/16.
 */
'use strict';

const retrieveFromToken = require(process.cwd() + '/server/helpers/hkdfTokenGenerator').retrieveFromToken;

module.exports = () => {

    return function (request, reply) {

        const server = request.server;
        const redis = request.redis;
        const dao = server.methods.dao;
        const userCredentialDao = dao.userCredentialDao;
        const cookieSession = request.state['Hawk-Session-Token'];

        if (!(cookieSession && cookieSession.hawkSessionToken)) {
            server.log([], 'session cookie not found');
            return reply.redirect('/login');
        }

        const ikm = cookieSession.hawkSessionToken;
        const info = request.info.host + '/hawkSessionToken';
        const salt = '';
        const length = 2 * 32;

        server.log('ikm: ' + ikm + ' info: ' + info + ' salt: ' + salt + ' length: ' + length);

        retrieveFromToken(ikm, info, salt, length, (sessionId) => {

            userCredentialDao.deleteUserCredential(redis, sessionId, (err) => {

                if (err) {
                    server.log(['error', 'database', 'delete'], err);
                }

                return reply.redirect('/login')
                    .unstate('Hawk-Session-Token');
            });
        });
    };
};
