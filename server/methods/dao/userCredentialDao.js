/**
 * Created by Omnius on 6/18/16.
 */
'use strict';

const _ = require('lodash/core');

module.exports.createUserCredential = (db, tokenId, credentials, cb) => {

    if (!_.isString(tokenId)) {
        return cb('invalid token');
    }
    if (!_.isObject(credentials) || _.isEmpty(credentials)) {
        return cb('invalid credentials');
    }

    db.hmset('userCredential:' + tokenId, credentials, (err, results) => {

        if (err) {
            return cb(err);
        }

        return cb(null, results);
    });
};

module.exports.readUserCredential = (db, tokenId, cb) => {

    if (!_.isString(tokenId)) {
        return cb('invalid token');
    }

    db.hgetall('userCredential:' + tokenId, (err, credentials) => {

        if (err) {
            return cb(err);
        }

        return cb(null, credentials);
    });
};

module.exports.updateUserCredential = module.exports.createUserCredential;

module.exports.deleteUserCredential = (db, tokenId, cb) => {

    if (!_.isString(tokenId)) {
        return cb('invalid token');
    }

    db.del('userCredential:' + tokenId, (err, results) => {

        if (err) {
            return cb(err);
        }

        return cb(null, results);
    });
};
