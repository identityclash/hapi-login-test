/**
 * Created by Omnius on 6/3/16.
 */
'use strict';

const _ = require('lodash/core');

module.exports.createUser = (db, user, cb) => {

    if (!(_.isObject(user) && user.id && user.email && user.username)) {
        return cb('invalid or incomplete user information');
    }

    const multi = db.multi();
    multi.hmset('user:' + user.id, user);
    multi.set('userId:' + user.email, user.id);
    multi.set('userId:' + user.username, user.id);
    multi.exec((err, result) => {

        if (err) {
            return cb(err);
        }

        return cb(null, result);
    });
};

module.exports.readUserId = (db, usernameOrEmail, cb) => {

    if (!_.isString(usernameOrEmail)) {
        return cb('invalid username or email');
    }

    db.get('userId:' + usernameOrEmail, (err, dbUserId) => {

        if (err) {
            return cb(err);
        }

        return cb(null, dbUserId);
    });
};

module.exports.readUsername = (db, userId, cb) => {

    if (!_.isString(userId)) {
        return cb('invalid user id');
    }

    db.hget('user:' + userId, 'username', (err, dbUsername) => {

        if (err) {
            return cb(err);
        }

        return cb(null, dbUsername);
    });
};

module.exports.readUserHashAndRealm = (db, userId, cb) => {

    if (!_.isString(userId)) {
        return cb('invalid user id');
    }

    db.hmget(['user:' + userId, 'hashedPw', 'realm'], (err, dbHashAndRealm) => {

        if (err) {
            return cb(err);
        }

        return cb(null, dbHashAndRealm);
    });
};
