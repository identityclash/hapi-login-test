/**
 * Created by Omnius on 6/3/16.
 */
'use strict';

module.exports.createUser = (db, user, next) => {

    const multi = db.multi();
    multi.hmset('user:' + user.id, user);
    multi.set('userId:' + user.email, user.id);
    multi.set('userId:' + user.username, user.id);
    multi.exec((err, result) => {

        if (err) {
            return next(err);
        }

        return next(null, result);
    });
};

module.exports.readUserId = (db, usernameOrEmail, next) => {

    db.get('userId:' + usernameOrEmail, (err, dbUserId) => {

        if (err) {
            return next(err);
        }

        return next(null, dbUserId);
    });
};

module.exports.readUsername = (db, userId, next) => {

    db.hget('user:' + userId, 'username', (err, dbUsername) => {

        if (err) {
            return next(err);
        }

        return next(null, dbUsername);
    });
};

module.exports.readUserHashAndRealm = (db, userId, next) => {

    db.hmget(['user:' + userId, 'hashedPw', 'realm'], (err, dbHashAndRealm) => {

        if (err) {
            return next(err);
        }

        return next(null, dbHashAndRealm);
    });
};

module.exports.readUser = (db, username, next) => {

    db.hgetall('user:' + username, (err, user) => {

        if (err) {
            return next(err);
        }

        return next(null, user);
    });
};

module.exports.updateUser = (db, user, next) => {

    db.hmset('username:' + user.username, user, (err, result) => {

        if (err) {
            return next(err);
        }

        return next(null, result);
    });
};

module.exports.deleteUser = (db, username, next) => {

    db.del('username:' + username, (err, result) => {

        if (err) {
            return next(err);
        }

        return next(null, result);
    });
};
