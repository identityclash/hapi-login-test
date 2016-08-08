/**
 * Created by Omnius on 6/26/16.
 */
'use strict';

const retrieveFromToken = require(process.cwd() + '/server/helpers/hkdfTokenGenerator').retrieveFromToken;

module.exports = () => {

    return (request, reply) => {

        const server = request.server;
        const redis = request.redis;
        const dao = server.methods.dao;
        const userCredentialDao = dao.userCredentialDao;
        const cookieSession = request.state['Hawk-Session-Token'];


        const ikm = cookieSession.hawkSessionToken;
        const info = request.info.host + '/hawkSessionToken';
        const salt = '';
        const length = 2 * 32;

        server.log('ikm: ' + ikm + ' info: ' + info + ' salt: ' + salt + ' length: ' + length);

        retrieveFromToken(ikm, info, salt, length, (sessionId) => {

            userCredentialDao.deleteUserCredential(redis, sessionId, (err) => {
                if (err) {
                    server.log(err);

                    return reply.redirect('/')
                        .unstate('Hawk-Session-Token');
                }

                return reply.redirect('/')
                    .unstate('Hawk-Session-Token');
            });
        });
    };
};
