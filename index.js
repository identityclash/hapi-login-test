/* jshint -W064 */
'use strict';

const composer = require('./server/composer');
const cleanUp = require('./server/cleaner').cleanUp;

composer((err, server) => {

    if (err) {
        throw err;
    }

    server.state('Hawk-Session-Token', {
        ttl: 24 * 60 * 60 * 1000,
        path: '/',
        isSecure: false,
        isHttpOnly: false,
        encoding: 'base64json',
        clearInvalid: true
    });

    cleanUp(server.app.redis, (err) => {
        server.log(['error', 'database', 'delete'], err);
    });

    server.start((err) => {

        if (err) {
            throw err;
        }

        server.log([], 'Server started at ' + server.info.uri);
    });
});
