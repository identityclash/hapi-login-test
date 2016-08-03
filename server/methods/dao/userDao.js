/**
 * Created by Omnius on 6/3/16.
 */
'use strict';

module.exports.createUser = (db, user, cb) => {

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

    db.get('userId:' + usernameOrEmail, (err, dbUserId) => {

        if (err) {
            return cb(err);
        }

        return cb(null, dbUserId);
    });
};

module.exports.readUsername = (db, userId, cb) => {

    db.hget('user:' + userId, 'username', (err, dbUsername) => {

        if (err) {
            return cb(err);
        }

        return cb(null, dbUsername);
    });
};

module.exports.readUserHashAndRealm = (db, userId, cb) => {

    db.hmget(['user:' + userId, 'hashedPw', 'realm'], (err, dbHashAndRealm) => {

        if (err) {
            return cb(err);
        }

        return cb(null, dbHashAndRealm);
    });
};

module.exports.readUser = (db, username, cb) => {

    db.hgetall('user:' + username, (err, user) => {

        if (err) {
            return cb(err);
        }

        return cb(null, user);
    });
};

module.exports.updateUser = (db, user, cb) => {

    db.hmset('username:' + user.username, user, (err, result) => {

        if (err) {
            return cb(err);
        }

        return cb(null, result);
    });
};

module.exports.deleteUser = (db, username, cb) => {

    db.del('username:' + username, (err, result) => {

        if (err) {
            return cb(err);
        }

        return cb(null, result);
    });
};
