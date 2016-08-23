/**
 * Created by Omnius on 01/08/2016.
 */
'use strict';

const Bcrypt = require('bcryptjs');
const Boom = require('boom');
const Code = require('code');
const Lab = require('lab');
const Sinon = require('sinon');

const BasicValidation = require(process.cwd() + '/server/auth/basic/basicValidation');
const UserDao = require(process.cwd() + '/server/methods/dao/userDao');
const UserCredentialDao = require(process.cwd() + '/server/methods/dao/userCredentialDao');
const TestServer = require(process.cwd() + '/test/testServer');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const before = lab.before;
const after = lab.after;
const describe = lab.describe;
const it = lab.it;

const internals = {};

internals.header = function (username, password) {

    return 'Basic ' + (new Buffer((username || '') + ':' + password, 'utf8')).toString('base64');
};

const testServer = new TestServer();

testServer.auth.strategy('basic-login-auth-strategy', 'basic', 'required', {
    validateFunc: BasicValidation.validate
});

testServer.route({
    path: '/basic',
    method: 'POST',
    config: {
        auth: 'basic-login-auth-strategy',
        handler: (request, reply) => {

            const credentials = request.auth.credentials;

            return reply(credentials);
        }
    }
});

testServer.method('dao.userDao.readUserId', UserDao.readUserId);
testServer.method('dao.userDao.readUserHashAndRealm', UserDao.readUserHashAndRealm);
testServer.method('dao.userCredentialDao.createUserCredential', UserCredentialDao.createUserCredential);

const testPersons = [
    {
        username: 'johndoe',
        userId: 'af7fa48f-acf5-4af7-ace5-12c78804b650',
        hashedPw: '$2a$10$9Z5Ow7Q3XE8K6foPUEk/AOjXULHsvLNiF0j9fsMEHJRhJd.fj7bo6',
        realm: 'My Realm'
    }
];

let readUserIdStub;
let readUserHashAndRealmStub;
let createUserCredentialStub;
let bcryptStub;

describe('server/auth/basic/basicValidation', () => {

    describe('functional database', () => {

        before((done) => {

            readUserIdStub = Sinon.stub(testServer.methods.dao.userDao, 'readUserId', (db, username, cb) => {

                for (let i = 0; i < testPersons.length; i++) {
                    if (testPersons[i].username === username) {
                        return cb(null, testPersons[i].userId);
                    }
                }

                // source code must throw invalid
                return cb();
            });

            readUserHashAndRealmStub = Sinon.stub(testServer.methods.dao.userDao, 'readUserHashAndRealm',
                (db, userId, cb) => {

                    for (let i = 0; i < testPersons.length; i++) {
                        if (testPersons[i].userId === userId) {

                            return cb(null, [
                                testPersons[i].hashedPw,
                                testPersons[i].realm
                            ]);
                        }
                    }

                    // source code must throw invalid
                    return cb();
                });

            createUserCredentialStub = Sinon.stub(testServer.methods.dao.userCredentialDao, 'createUserCredential',
                (db, sessionId, userCredentials, cb) => {

                    if (sessionId) {
                        return cb(null, {credentials: 'good credentials'});
                    }

                    return cb('bad credentials');
                });

            return done();
        });

        after((done) => {

            readUserIdStub.restore();
            readUserHashAndRealmStub.restore();
            createUserCredentialStub.restore();

            return done();
        });

        it('authorizes with valid credentials', (done) => {

            testServer.inject({
                method: 'POST',
                url: '/basic',
                headers: {
                    authorization: internals.header('johndoe', 'password')
                }
            }, (res) => {

                expect(res.headers['content-type']).to.include('application/json');
                expect(res.statusCode).to.equal(200);
                expect(res.result).to.be.an.object();
                expect(res.result.hawkSessionToken).to.exist();
                expect(res.result.algorithm).to.equal('sha256');
                expect(res.result.id).to.exist();
                expect(res.result.userId).to.exist();

                return done();
            });
        });

        it('denies authorization without basic authentication header', (done) => {

            testServer.inject({
                method: 'POST',
                url: '/basic'
            }, (res) => {

                expect(res.headers['content-type']).to.include('application/json');
                expect(res.statusCode).to.equal(401);
                expect(res.result.error).to.equal(Boom.unauthorized().message);

                return done();
            });
        });

        it('denies authorization to empty username', (done) => {

            testServer.inject({
                method: 'POST',
                url: '/basic',
                headers: {
                    authorization: internals.header('', 'password')
                }
            }, (res) => {

                expect(res.headers['content-type']).to.include('application/json');
                expect(res.statusCode).to.equal(401);
                expect(res.result.error).to.equal(Boom.unauthorized().message);

                return done();
            });
        });

        it('denies authorization to unknown username', (done) => {

            testServer.inject({
                method: 'POST',
                url: '/basic',
                headers: {
                    authorization: internals.header('jimmydoe', 'password')
                }
            }, (res) => {

                expect(res.headers['content-type']).to.include('application/json');
                expect(res.statusCode).to.equal(401);
                expect(res.result.error).to.equal(Boom.unauthorized().message);

                return done();
            });
        });

        it('denies authorization to password and hash mismatch', (done) => {

            testServer.inject({
                method: 'POST',
                url: '/basic',
                headers: {
                    authorization: internals.header('johndoe', 'wrongpassword')
                }
            }, (res) => {

                expect(res.headers['content-type']).to.include('application/json');
                expect(res.statusCode).to.equal(401);
                expect(res.result.error).to.equal(Boom.unauthorized().message);

                return done();
            });
        });

        it('denies authorization if the username and password are correct but does not match entry into the authorized '
            + 'realm', (done) => {

            testServer.inject({
                method: 'POST',
                url: '/basic',
                headers: {
                    authorization: internals.header('johndoe', 'password'),
                    realm: 'Different Realm'
                }
            }, (res) => {

                expect(res.headers['content-type']).to.include('application/json');
                expect(res.statusCode).to.equal(401);
                expect(res.result.error).to.equal(Boom.unauthorized().message);

                return done();
            });
        });
    });

    describe('database error', () => {

        describe('database error during retrieval of user ID', () => {

            before((done) => {

                readUserIdStub = Sinon.stub(testServer.methods.dao.userDao, 'readUserId', (db, username, cb) => {

                    return cb('db_failure');
                });

                return done();
            });

            after((done) => {

                readUserIdStub.restore();
                return done();
            });

            it('returns server error when DB fails during retrieval of user ID', (done) => {

                testServer.inject({
                    method: 'POST',
                    url: '/basic',
                    headers: {
                        authorization: internals.header('johndoe', 'password')
                    }
                }, (res) => {

                    expect(res.headers['content-type']).to.include('application/json');
                    expect(res.statusCode).to.equal(500);
                    expect(res.result.error).to.equal(Boom.internal().message);

                    return done();
                });
            });
        });

        describe('database error during retrieval of user\'s hashed password', () => {

            before((done) => {

                readUserIdStub = Sinon.stub(testServer.methods.dao.userDao, 'readUserId', (db, username, cb) => {

                    for (let i = 0; i < testPersons.length; i++) {
                        if (testPersons[i].username === username) {
                            return cb(null, testPersons[i].userId);
                        }
                    }

                    return cb('invalid');
                });

                readUserHashAndRealmStub = Sinon.stub(testServer.methods.dao.userDao, 'readUserHashAndRealm',
                    (db, userId, cb) => {

                        return cb('db_failure');
                    });

                return done();
            });

            after((done) => {

                readUserIdStub.restore();
                readUserHashAndRealmStub.restore();

                return done();
            });

            it('returns server error when DB fails during retrieval of user\'s hashed password', (done) => {

                testServer.inject({
                    method: 'POST',
                    url: '/basic',
                    headers: {
                        authorization: internals.header('johndoe', 'password')
                    }
                }, (res) => {

                    expect(res.headers['content-type']).to.include('application/json');
                    expect(res.statusCode).to.equal(500);
                    expect(res.result.error).to.equal(Boom.internal().message);

                    return done();
                });
            });
        });

        describe('database error during generation of Hawk session token', () => {

            before((done) => {

                readUserIdStub = Sinon.stub(testServer.methods.dao.userDao, 'readUserId', (db, username, cb) => {

                    for (let i = 0; i < testPersons.length; i++) {
                        if (testPersons[i].username === username) {
                            return cb(null, testPersons[i].userId);
                        }
                    }

                    return cb('invalid');
                });

                readUserHashAndRealmStub = Sinon.stub(testServer.methods.dao.userDao, 'readUserHashAndRealm',
                    (db, userId, cb) => {

                        for (let i = 0; i < testPersons.length; i++) {
                            if (testPersons[i].userId === userId) {

                                return cb(null, [
                                    testPersons[i].hashedPw,
                                    testPersons[i].realm
                                ]);
                            }
                        }

                        return cb('invalid');
                    });

                createUserCredentialStub = Sinon.stub(testServer.methods.dao.userCredentialDao, 'createUserCredential',
                    (db, sessionId, userCredentials, cb) => {

                        return cb('db_failure');
                    });

                return done();
            });

            after((done) => {

                readUserIdStub.restore();
                readUserHashAndRealmStub.restore();
                createUserCredentialStub.restore();

                return done();
            });

            it('returns server error when DB fails during generation of Hawk session token', (done) => {

                testServer.inject({
                    method: 'POST',
                    url: '/basic',
                    headers: {
                        authorization: internals.header('johndoe', 'password')
                    }
                }, (res) => {

                    expect(res.headers['content-type']).to.include('application/json');
                    expect(res.statusCode).to.equal(500);
                    expect(res.result.error).to.equal(Boom.internal().message);

                    return done();
                });
            });
        });
    });

    describe('Bcrypt library error', () => {

        before((done) => {

            readUserIdStub = Sinon.stub(testServer.methods.dao.userDao, 'readUserId', (db, username, cb) => {

                for (let i = 0; i < testPersons.length; i++) {
                    if (testPersons[i].username === username) {
                        return cb(null, testPersons[i].userId);
                    }
                }

                return cb();
            });

            readUserHashAndRealmStub = Sinon.stub(testServer.methods.dao.userDao, 'readUserHashAndRealm',
                (db, userId, cb) => {

                    for (let i = 0; i < testPersons.length; i++) {
                        if (testPersons[i].userId === userId) {

                            return cb(null, [
                                testPersons[i].hashedPw,
                                testPersons[i].realm
                            ]);
                        }
                    }

                    return cb();
                });

            createUserCredentialStub = Sinon.stub(testServer.methods.dao.userCredentialDao, 'createUserCredential',
                (db, sessionId, userCredentials, cb) => {

                    if (sessionId) {
                        return cb(null, {credentials: 'good credentials'});
                    }

                    return cb('bad credentials');
                });

            bcryptStub = Sinon.stub(Bcrypt, 'compare', (s, hash, callback) => {

                return callback('library_failure');
            });

            return done();
        });

        after((done) => {

            readUserIdStub.restore();
            readUserHashAndRealmStub.restore();
            createUserCredentialStub.restore();
            bcryptStub.restore();

            return done();
        });

        it('denies authorization if Bcrypt fails for whatever reason', (done) => {

            testServer.inject({
                method: 'POST',
                url: '/basic',
                headers: {
                    authorization: internals.header('johndoe', 'password')
                }
            }, (res) => {

                expect(res.headers['content-type']).to.include('application/json');
                expect(res.statusCode).to.equal(500);
                expect(res.result.error).to.equal(Boom.internal().message);

                return done();
            });
        });
    });
});
