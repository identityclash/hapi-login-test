/**
 * Created by Omnius on 6/18/16.
 */
'use strict';

module.exports.createUserCredential = (db, tokenId, credentials, cb) => {

    db.hmset('userCredential:' + tokenId, credentials, (err, results) => {

        if (err) {
            return cb(err);
        }

        return cb(null, results);
    });
};

module.exports.readUserCredential = (db, tokenId, cb) => {

    db.hgetall('userCredential:' + tokenId, (err, credentials) => {

        if (err) {
            return cb(err);
        }

        return cb(null, credentials);
    });
};

module.exports.updateUserCredential = module.exports.createUserCredential;

module.exports.deleteUserCredential = (db, tokenId, cb) => {

    db.del('userCredential:' + tokenId, (err, results) => {

        if (err) {
            return cb(err);
        }

        return cb(null, results);
    });
};

