/**
 * Created by Omnius on 6/26/16.
 */
'use strict';

const Async = require('async');

module.exports.cleanUp = function (server, callback) {

    server.app.redis.keys('userCredential:*', (err, keys) => {
        if (err) {
            server.log(err);

            return callback();
        }

        Async.each(keys, (key, next) => {
            server.app.redis.del(key, (err) => {
                if (err) {
                    return next(err);
                }

                return next();
            });
        }, (err) => {
            if (err) {
                server.log(err);
            }

            return callback();
        });
    });
};
