/**
 * Created by Omnius on 6/26/16.
 */
'use strict';

const Async = require('async');

module.exports.cleanUp = (db, callback) => {

    db.keys('userCredential:*', (err, keys) => {

        if (err) {
            return callback(err);
        }

        Async.each(keys, (key, next) => {

            db.del(key, (err) => {

                return next(err);
            });
        }, (err) => {

            return callback(err);
        });
    });
};
