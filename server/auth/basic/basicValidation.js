/**
 * Created by Omnius on 6/18/16.
 */
'use strict';

const Async = require('async');
const Bcrypt = require('bcryptjs');
const Boom = require('boom');
const generateToken = require(process.cwd() + '/server/helpers/hkdfTokenGenerator').generateToken;

const internals = {};

exports.validate = (request, usernameOrEmail, password, callback) => {

    const redis = request.redis;
    const server = request.server;
    const methods = server.methods;
    const userDao = methods.dao.userDao;

    Async.autoInject({
        readUserId: (cb) => {

            userDao.readUserId(redis, usernameOrEmail, (err, userId) => {
                if (err || !userId) {
                    return cb(err || 'invalid');
                }

                return cb(null, userId);
            });
        },
        compareHashAndRealm: (readUserId, cb) => {

            const userId = readUserId;

            internals.compareHashAndRealm(request, userId, password, (err, isSame) => {
                if (err || !isSame) {
                    return cb(err || 'invalid');
                }

                return cb(null, userId);
            });
        },
        generateCredentials: (compareHashAndRealm, cb) => {

            const userId = compareHashAndRealm;

            internals.generateCredentials(request, userId, (err, credentials) => {

                if (err) {
                    return cb(err);
                }

                credentials.userId = userId;

                return cb(null, credentials);
            });
        }
    }, (err, results) => {

        if (err) {
            server.log(err);
            return callback(err === 'invalid' ? null : Boom.internal(), false, null);
        }

        return callback(null, true, results.generateCredentials);
    });
};

internals.compareHashAndRealm = (request, userId, password, cb) => {

    const redis = request.redis;
    const server = request.server;
    const methods = server.methods;
    const userDao = methods.dao.userDao;

    userDao.readUserHashAndRealm(redis, userId, (err, dbHashAndRealm) => {

        if (err || !dbHashAndRealm) {
            return cb(err, false);
        }

        const clientRealm = request.headers.realm || 'My Realm';
        const dbHashedPw = dbHashAndRealm[0];
        const dbRealm = dbHashAndRealm[1];

        if (clientRealm !== dbRealm) {
            return cb(null, false);
        }

        Bcrypt.compare(password, dbHashedPw, (err, isSame) => {

            return cb(err, isSame);
        });
    });
};

internals.generateCredentials = (request, userId, cb) => {

    const server = request.server;
    const redis = request.redis;
    const methods = server.methods;
    const userCredentialDao = methods.dao.userCredentialDao;

    generateToken(request.info.host + '/hawkSessionToken', null, (sessionId, authKey, token) => {

        userCredentialDao.createUserCredential(redis, sessionId, {
            hawkSessionToken: token,
            userId: userId,
            id: sessionId,
            key: authKey,
            algorithm: 'sha256'
        }, (err) => {

            if (err) {
                return cb(err);
            }

            const credentials = {
                hawkSessionToken: token,
                algorithm: 'sha256',
                id: sessionId
            };

            return cb(null, credentials);
        });
    });
};
