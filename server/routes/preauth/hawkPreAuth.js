/**
 * Created by Omnius on 18/07/2016.
 *
 * These codes were done to address the inability of the client web pages (non-framework-based) to set its own headers
 * on a form GET request (NOT XHR requests), i.e. web page content instead of JSON. Eran Hammer's Hawk server codes
 * (and hapi-auth-hawk) checks the client-sent headers for a MAC and a hash that was retrieved from the
 * ID, key, and algorithm processing using the Hawk client.  This file acts as a middleware/adapter to convert the
 * session cookie information into Hawk-readable header data for hapi-auth-hawk.
 *
 */
'use strict';


const Hawk = require('hawk');
const isHexString = require(process.cwd() + '/server/helpers/util').isHexString;
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

    if (!isHexString(ikm)) {
        return reply.continue();
    }

    retrieveFromToken(ikm, info, salt, length, (id, key) => {

        const algorithm = clientToken.algorithm;

        const hawkCredentials = {
            id: id,
            key: key,
            algorithm: algorithm
        };

        const protocol = request.connection.info.protocol;
        const url = protocol
            + '://'
            + request.info.host + request.path;
        const method = request.method;

        server.log('hawkPreAuth url: ' + url);

        request.raw.req.url = url;

        const header = Hawk.client.header(url,
            method,
            {credentials: hawkCredentials, ext: 'some-app-data'});

        request.raw.req.headers.authorization = header.field;

        return reply.continue();
    });
};
