/**
 * Created by Omnius on 6/3/16.
 */
'use strict';

const Async = require('async');
const Bcrypt = require('bcryptjs');
const Boom = require('boom');
const Uuid = require('uuid');

module.exports = () => {

    return (request, reply) => {

        const payload = request.payload;
        const username = payload.username;
        const email = payload.email;
        const password = payload.password;
        const firstname = payload.firstname;
        const surname = payload.surname;
        const birthdate = payload.birthdate;

        const date = new Date(birthdate);
        const fmtBirthDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

        // for basic authentication scheme only
        const realm = payload.realm;

        const server = request.server;
        const redis = request.redis;
        const dao = server.methods.dao;
        const userDao = dao.userDao;
        const userProfileDao = dao.userProfileDao;

        Async.autoInject({
            readUserId: (cb) => {

                userDao.readUserId(redis, username, (err, userId) => {

                    if (err || userId) {
                        return cb(err || Boom.badRequest('user_already_exists'));
                    }

                    userDao.readUserId(redis, email, (err, userId) => {

                        if (err || userId) {
                            return cb(err || Boom.badRequest('user_already_exists'));
                        }

                        return cb();
                    });
                });
            },
            addSalt: (cb) => {

                Bcrypt.genSalt(10, (err, salt) => {
                    if (err) {
                        return cb(err);
                    }

                    return cb(null, salt);
                });
            },
            computeHash: (addSalt, cb) => {

                const salt = addSalt;

                Bcrypt.hash(password, salt, (err, hashedPw) => {
                    if (err) {
                        return cb(err);
                    }

                    return cb(null, hashedPw);
                });
            },
            createUser: (addSalt, computeHash, cb) => {

                const salt = addSalt;
                const hashedPw = computeHash;

                const user = {
                    id: Uuid.v4(),
                    username: username,
                    email: email,
                    salt: salt,
                    hashedPw: hashedPw,
                    realm: (realm || 'My Realm')
                };

                userDao.createUser(redis, user, (err) => {
                    if (err) {
                        return cb(err);
                    }

                    return cb(null, user.id);
                });
            },
            createUserProfile: (createUser, cb) => {

                const userId = createUser;

                const profile = {
                    firstname: firstname,
                    surname: surname,
                    birthdate: fmtBirthDate
                };

                userProfileDao.createUserProfile(redis, userId, profile, (err) => {
                    if (err) {
                        return cb(err);
                    }

                    return cb();
                });
            }
        }, (err) => {
            if (err) {
                return reply(err);
            }

            return reply.redirect('/login?registered=true');
        });
    };
};
