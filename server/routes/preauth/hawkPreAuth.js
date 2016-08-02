/**
 * Created by Omnius on 18/07/2016.
 */
'use strict';

const Hawk = require('hawk');
const retrieveFromToken = require(process.cwd() + '/server/helpers/hkdfTokenGenerator').retrieveFromToken;

module.exports = (request, reply) => {

    const clientToken = request.state['Hawk-Session-Token'];

    if (!(clientToken && clientToken.hawkSessionToken)) {
        return reply.continue();
    }

    const server = request.server;

    const ikm = clientToken.hawkSessionToken;
    const info = request.info.host + '/hawkSessionToken';
    const salt = '';
    const length = 2 * 32;

    server.log(ikm + ' ' + info + ' ' + salt + ' ' + length);

    retrieveFromToken(ikm, info, salt, length, (id, key) => {
        if (!(id && key)) {
            return reply.continue();
        }

        const algorithm = clientToken.algorithm;

        const hawkCredentials = {
            id: id,
            key: key,
            algorithm: algorithm
        };

        const url = request.connection.info.protocol
            + '://'
            + request.info.host + '/user/welcomeh';

        request.raw.req.url = url;

        const header = Hawk.client.header(url,
            'GET',
            {credentials: hawkCredentials, ext: 'some-app-data'});

        request.raw.req.headers.authorization = header.field;

        return reply.continue();
    });
};
