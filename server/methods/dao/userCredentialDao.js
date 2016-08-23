/**
 * Created by Omnius on 6/18/16.
 */
'use strict';

module.exports.createUserCredential = (db, tokenId, credentials, cb) => {

    if (!(tokenId && (typeof tokenId === 'string'))) {
        return cb('invalid token');
    }
    if (!(credentials && (typeof credentials === 'object')) || Object.keys(credentials).length === 0) {
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

    if (!(tokenId && typeof tokenId === 'string')) {
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

    if (!(tokenId && typeof tokenId === 'string')) {
        return cb('invalid token');
    }

    db.del('userCredential:' + tokenId, (err, results) => {

        if (err) {
            return cb(err);
        }

        return cb(null, results);
    });
};

