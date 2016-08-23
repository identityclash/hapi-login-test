/**
 * Created by Omnius on 6/18/16.
 */
'use strict';

module.exports.createUserProfile = (db, userId, userProfile, cb) => {

    if (!(userId && (typeof userId === 'string'))) {
        return cb('invalid user id');
    }
    if (!(userProfile && (typeof userProfile === 'object')) || Object.keys(userProfile).length === 0) {
        return cb('invalid profile');
    }

    db.hmset('userProfile:' + userId, userProfile, (err, result) => {

        if (err) {
            return cb(err);
        }

        return cb(null, result);
    });
};

module.exports.readUserProfile = (db, userId, cb) => {

    if (!(userId && (typeof userId === 'string'))) {
        return cb('invalid user id');
    }

    db.hgetall('userProfile:' + userId, (err, userProfile) => {

        if (err) {
            return cb(err);
        }

        return cb(null, userProfile);
    });
};
