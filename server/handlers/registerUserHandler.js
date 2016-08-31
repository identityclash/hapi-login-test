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

        Async.mapSeries([username, email], (item, cb) => {

            userDao.readUserId(redis, item, (err, userId) => {

                if (err || userId) {
                    server.log(['error', 'database', 'read'], err);
                    return cb(err || 'user_already_exists');
                }

                return cb();
            });
        }, (err) => {

            if (err) {
                return reply(err === 'user_already_exists' ? Boom.badRequest(err) : Boom.internal());
            }

            Async.autoInject({
                addSalt: (cb) => {

                    Bcrypt.genSalt(10, (err, salt) => {
                        if (err) {
                            server.log(['error', 'hash'], err);
                            return cb(err);
                        }

                        return cb(null, salt);
                    });
                },
                computeHash: (addSalt, cb) => {

                    const salt = addSalt;

                    Bcrypt.hash(password, salt, (err, hashedPw) => {
                        if (err) {
                            server.log(['error', 'hash'], err);
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
                            server.log(['error', 'database', 'create'], err);
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
                            server.log(['error', 'database', 'create'], err);
                            return cb(err);
                        }

                        return cb();
                    });
                }
            }, (err) => {

                if (err) {
                    return reply(Boom.internal());
                }

                return reply('registered');
            });
        });
    };
};
