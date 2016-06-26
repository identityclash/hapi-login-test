/**
 * Created by Omnius on 6/18/16.
 */
'use strict';

module.exports.createUserCredential = (db, tokenId, credentials, next) => {

    db.hmset('userCredential:' + tokenId, credentials, (err, results) => {

        if (err) {
            return next(err);
        }

        return next(null, results);
    });
};

module.exports.readUserCredential = (db, tokenId, next) => {

    db.hgetall('userCredential:' + tokenId, (err, credentials) => {

        if (err) {
            return next(err);
        }

        return next(null, credentials);
    });
};

module.exports.updateUserCredential = module.exports.createUserCredential;

module.exports.deleteUserCredential = (db, tokenId, next) => {

    db.del('userCredential:' + tokenId, (err, results) => {

        if (err) {
            return next(err);
        }

        return next(null, results);
    });
};

