/**
 * Created by Omnius on 6/18/16.
 */
'use strict';

module.exports.createUserProfile = (db, userId, userProfile, cb) => {

    db.hmset('userProfile:' + userId, userProfile, (err, result) => {

        if (err) {
            return cb(err);
        }

        return cb(null, result);
    });
};

module.exports.readUserProfile = (db, userId, cb) => {

    db.hgetall('userProfile:' + userId, (err, userProfile) => {

        if (err) {
            return cb(err);
        }

        return cb(null, userProfile);
    });
};
