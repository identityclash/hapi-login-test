/**
 * Created by Omnius on 6/18/16.
 */
'use strict';

module.exports.createUserProfile = (db, userId, userProfile, next) => {

    db.hmset('userProfile:' + userId, userProfile, (err, result) => {

        if (err) {
            return next(err);
        }

        return next(null, result);
    });
};

module.exports.readUserProfile = (db, userId, next) => {

    db.hgetall('userProfile:' + userId, (err, userProfile) => {

        if (err) {
            return next(err);
        }

        return next(null, userProfile);
    });
};
