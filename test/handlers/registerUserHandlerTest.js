/**
 * Created by Omnius on 23/08/2016.
 */
'use strict';

const Bcrypt = require('bcryptjs');
const Boom = require('boom');
const Code = require('code');
const Crumb = require('crumb');
const Hoek = require('hoek');
const Lab = require('lab');
const Sinon = require('sinon');

const RegisterUserHandler = require(process.cwd() + '/server/handlers/registerUserHandler');
const WebHandler = require(process.cwd() + '/server/handlers/webHandler');
const TestServer = require(process.cwd() + '/test/testServer');
const UserDao = require(process.cwd() + '/server/methods/dao/userDao');
const UserProfileDao = require(process.cwd() + '/server/methods/dao/userProfileDao');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const beforeEach = lab.beforeEach;
const afterEach = lab.afterEach;
const describe = lab.describe;
const it = lab.it;

const testServer = new TestServer();

testServer.register([
    {
        register: Crumb,
        options: {
            key: 'Crumbz',
            size: 43,
            autoGenerate: true,
            addToViewContext: true,
            restful: false,
            cookieOptions: {
                ttl: 24 * 60 * 60 * 1000,
                isSecure: true,
                isHttpOnly: true,
                path: '/',
                encoding: 'none',
                ignoreErrors: true,
                clearInvalid: true,
                strictHeader: true
            }
        }
    }
], (err) => {

    if (err) {
        throw err;
    }
});

testServer.handler('webHandler', WebHandler);
testServer.handler('registerUserHandler', RegisterUserHandler);

testServer.route([
    {
        path: '/registration',
        method: 'GET',
        config: {
            handler: {
                webHandler: {
                    type: 'registration'
                }
            }
        }
    },
    {
        path: '/user/registration',
        method: 'POST',
        config: {
            handler: {
                registerUserHandler: {}
            }
        }
    }
]);

testServer.method('dao.userDao.readUserId', UserDao.readUserId);
testServer.method('dao.userDao.createUser', UserDao.createUser);
testServer.method('dao.userProfileDao.createUserProfile', UserProfileDao.createUserProfile);

const testPerson = {
    user: {
        username: 'johndoe',
        email: 'johndoe@gmail.com',
        password: 'password',
        realm: 'My Realm'
    },
    userProfile: {
        firstname: 'John',
        surname: 'Doe',
        birthdate: '1961-7-10'
    }
};

let readUserIdStub;
let createUserStub;
let createUserProfileStub;
let bcryptStub;

describe('server/handlers/registerUserHandler', () => {

    let createdUser = {};
    let createdUserProfile = {};
    let createdUserId = null;

    describe('functional database and Bcrypt library', () => {

        beforeEach((done) => {

            readUserIdStub = Sinon.stub(testServer.methods.dao.userDao, 'readUserId', (db, username, cb) => {

                // simulate username/email already exists in DB
                if (['janedoe', 'jackdoe@gmail.com'].indexOf(username) > -1) {
                    return cb(null, username);
                }

                return cb();
            });

            createUserStub = Sinon.stub(testServer.methods.dao.userDao, 'createUser', (db, user, cb) => {

                createdUserId = user.id;

                createdUser['user:' + user.id] = user;
                createdUser['userId:' + user.email] = user.id;
                createdUser['userId:' + user.username] = user.id;

                return cb();
            });

            createUserProfileStub = Sinon.stub(testServer.methods.dao.userProfileDao, 'createUserProfile',
                (db, userId, userProfile, cb) => {

                    createdUserProfile['userProfile:' + userId] = Hoek.clone(userProfile);

                    return cb();
                });

            return done();
        });

        afterEach((done) => {

            createdUser = {};
            createdUserProfile = {};
            createdUserId = null;

            readUserIdStub.restore();
            createUserStub.restore();
            createUserProfileStub.restore();

            return done();
        });

        it('can register valid information assuming that crumb option for restful state is false', (done) => {

            testServer.inject({
                method: 'GET',
                url: '/registration'
            }, (res) => {

                expect(res.statusCode).to.equal(200);
                expect(res.headers['set-cookie'].length).to.equal(1);
                expect(res.headers['set-cookie'][0]).to.contain('Crumbz');
                expect(res.headers['set-cookie'][0]).to.contain('Secure');
                expect(res.result.toLowerCase()).to.contain('<!doctype html>');

                const crumb = res.headers['set-cookie'][0].split('=')[1].split(';')[0];

                testServer.inject({
                    method: 'POST',
                    url: '/user/registration',
                    headers: {
                        cookie: `Crumbz=${crumb}`
                    },
                    payload: {
                        username: testPerson.user.username,
                        email: testPerson.user.email,
                        password: testPerson.user.password,
                        firstname: testPerson.userProfile.firstname,
                        surname: testPerson.userProfile.surname,
                        birthdate: testPerson.userProfile.birthdate,
                        realm: 'Another realm',
                        Crumbz: crumb
                    }
                }, (res) => {

                    expect(res.statusCode).to.equal(200);
                    expect(res.result).to.contain('registered');
                    expect(createdUser['user:' + createdUserId].username).to.equal(testPerson.user.username);
                    expect(createdUser['user:' + createdUserId].email).to.equal(testPerson.user.email);
                    expect(createdUser['user:' + createdUserId].realm).to.equal('Another realm');
                    expect(createdUser['user:' + createdUserId].salt).to.exist();
                    expect(createdUser['user:' + createdUserId].id).to.exist();
                    expect(createdUser['user:' + createdUserId].hashedPw).to.exist();
                    expect(createdUser['userId:' + testPerson.user.email]).to.equal(createdUserId);
                    expect(createdUser['userId:' + testPerson.user.username]).to.equal(createdUserId);
                    expect(createdUserProfile['userProfile:' + createdUserId]).to.equal(testPerson.userProfile);

                    return done();
                });
            });
        });

        it('returns error when crumb payload does not exist assuming that crumb option for restful state is false',
            (done) => {

                testServer.inject({
                    method: 'GET',
                    url: '/registration'
                }, (res) => {

                    expect(res.statusCode).to.equal(200);
                    expect(res.headers['set-cookie'].length).to.equal(1);
                    expect(res.headers['set-cookie'][0]).to.contain('Crumbz');
                    expect(res.headers['set-cookie'][0]).to.contain('Secure');
                    expect(res.result.toLowerCase()).to.contain('<!doctype html>');

                    const crumb = res.headers['set-cookie'][0].split('=')[1].split(';')[0];

                    testServer.inject({
                        method: 'POST',
                        url: '/user/registration',
                        headers: {
                            cookie: `Crumbz=${crumb}`
                        },
                        payload: {
                            username: testPerson.user.username,
                            email: testPerson.user.email,
                            password: testPerson.user.password,
                            firstname: testPerson.userProfile.firstname,
                            surname: testPerson.userProfile.surname,
                            birthdate: testPerson.userProfile.birthdate
                        }
                    }, (res) => {

                        expect(res.statusCode).to.equal(403);
                        expect(res.result.error).to.equal(Boom.forbidden().message);

                        return done();
                    });
                });
            });

        it('returns error when crumb payload does not exist even if X-CSRF-Token headers exist assuming that '
            + 'crumb option for restful state is false', (done) => {

            testServer.inject({
                method: 'GET',
                url: '/registration'
            }, (res) => {

                expect(res.statusCode).to.equal(200);
                expect(res.headers['set-cookie'].length).to.equal(1);
                expect(res.headers['set-cookie'][0]).to.contain('Crumbz');
                expect(res.headers['set-cookie'][0]).to.contain('Secure');
                expect(res.result.toLowerCase()).to.contain('<!doctype html>');

                const crumb = res.headers['set-cookie'][0].split('=')[1].split(';')[0];

                testServer.inject({
                    method: 'POST',
                    url: '/user/registration',
                    headers: {
                        cookie: `Crumbz=${crumb}`,
                        'X-CSRF-Token': crumb
                    },
                    payload: {
                        username: testPerson.user.username,
                        email: testPerson.user.email,
                        password: testPerson.user.password,
                        firstname: testPerson.userProfile.firstname,
                        surname: testPerson.userProfile.surname,
                        birthdate: testPerson.userProfile.birthdate
                    }
                }, (res) => {

                    expect(res.statusCode).to.equal(403);
                    expect(res.result.error).to.equal(Boom.forbidden().message);

                    return done();
                });
            });
        });

        it('returns error when crumb payload is incorrect assuming that crumb option for restful state is false',
            (done) => {

                testServer.inject({
                    method: 'GET',
                    url: '/registration'
                }, (res) => {

                    expect(res.statusCode).to.equal(200);
                    expect(res.headers['set-cookie'].length).to.equal(1);
                    expect(res.headers['set-cookie'][0]).to.contain('Crumbz');
                    expect(res.headers['set-cookie'][0]).to.contain('Secure');
                    expect(res.result.toLowerCase()).to.contain('<!doctype html>');

                    const crumb = res.headers['set-cookie'][0].split('=')[1].split(';')[0];

                    testServer.inject({
                        method: 'POST',
                        url: '/user/registration',
                        headers: {
                            cookie: `Crumbz=${crumb}`
                        },
                        payload: {
                            username: testPerson.user.username,
                            email: testPerson.user.email,
                            password: testPerson.user.password,
                            firstname: testPerson.userProfile.firstname,
                            surname: testPerson.userProfile.surname,
                            birthdate: testPerson.userProfile.birthdate,
                            Crumbz: 'wrongcrumb'
                        }
                    }, (res) => {

                        expect(res.statusCode).to.equal(403);
                        expect(res.result.error).to.equal(Boom.forbidden().message);

                        return done();
                    });
                });
            });

        it('returns error if username already exists',
            (done) => {

                testServer.inject({
                    method: 'GET',
                    url: '/registration'
                }, (res) => {

                    expect(res.statusCode).to.equal(200);
                    expect(res.headers['set-cookie'].length).to.equal(1);
                    expect(res.headers['set-cookie'][0]).to.contain('Crumbz');
                    expect(res.headers['set-cookie'][0]).to.contain('Secure');
                    expect(res.result.toLowerCase()).to.contain('<!doctype html>');

                    const crumb = res.headers['set-cookie'][0].split('=')[1].split(';')[0];

                    testServer.inject({
                        method: 'POST',
                        url: '/user/registration',
                        headers: {
                            cookie: `Crumbz=${crumb}`
                        },
                        payload: {
                            username: 'janedoe',
                            email: 'jd@gmail.com',
                            password: '1234',
                            firstname: 'Jane',
                            surname: 'Doe',
                            birthdate: '1990-10-31',
                            Crumbz: crumb
                        }
                    }, (res) => {

                        expect(res.statusCode).to.equal(400);
                        expect(res.result.error).to.equal(Boom.badRequest().message);

                        return done();
                    });
                });
            });

        it('returns error if email already exists',
            (done) => {

                testServer.inject({
                    method: 'GET',
                    url: '/registration'
                }, (res) => {

                    expect(res.statusCode).to.equal(200);
                    expect(res.headers['set-cookie'].length).to.equal(1);
                    expect(res.headers['set-cookie'][0]).to.contain('Crumbz');
                    expect(res.headers['set-cookie'][0]).to.contain('Secure');
                    expect(res.result.toLowerCase()).to.contain('<!doctype html>');

                    const crumb = res.headers['set-cookie'][0].split('=')[1].split(';')[0];

                    testServer.inject({
                        method: 'POST',
                        url: '/user/registration',
                        headers: {
                            cookie: `Crumbz=${crumb}`
                        },
                        payload: {
                            username: 'jackdoe',
                            email: 'jackdoe@gmail.com',
                            password: '1234',
                            firstname: 'Jack',
                            surname: 'Doe',
                            birthdate: '1990-4-31',
                            Crumbz: crumb
                        }
                    }, (res) => {

                        expect(res.statusCode).to.equal(400);
                        expect(res.result.error).to.equal(Boom.badRequest().message);

                        return done();
                    });
                });
            });
    });

    describe('database failures but functional Bcrypt library', () => {

        afterEach((done) => {

            createdUser = {};
            createdUserProfile = {};
            createdUserId = null;

            readUserIdStub.restore();
            createUserStub.restore();
            createUserProfileStub.restore();

            return done();
        });

        it('returns error when database fails during retrieval and check of existing username/email',
            (done) => {

                readUserIdStub = Sinon.stub(testServer.methods.dao.userDao, 'readUserId', (db, username, cb) => {

                    // simulate db failure
                    return cb('db_failure');
                });

                createUserStub = Sinon.stub(testServer.methods.dao.userDao, 'createUser', (db, user, cb) => {

                    createdUserId = user.id;

                    createdUser['user:' + user.id] = user;
                    createdUser['userId:' + user.email] = user.id;
                    createdUser['userId:' + user.username] = user.id;

                    return cb();
                });

                createUserProfileStub = Sinon.stub(testServer.methods.dao.userProfileDao, 'createUserProfile',
                    (db, userId, userProfile, cb) => {

                        createdUserProfile['userProfile:' + userId] = Hoek.clone(userProfile);

                        return cb();
                    });

                testServer.inject({
                    method: 'GET',
                    url: '/registration'
                }, (res) => {

                    expect(res.statusCode).to.equal(200);
                    expect(res.headers['set-cookie'].length).to.equal(1);
                    expect(res.headers['set-cookie'][0]).to.contain('Crumbz');
                    expect(res.headers['set-cookie'][0]).to.contain('Secure');
                    expect(res.result.toLowerCase()).to.contain('<!doctype html>');

                    const crumb = res.headers['set-cookie'][0].split('=')[1].split(';')[0];

                    testServer.inject({
                        method: 'POST',
                        url: '/user/registration',
                        headers: {
                            cookie: `Crumbz=${crumb}`
                        },
                        payload: {
                            username: testPerson.user.username,
                            email: testPerson.user.email,
                            password: testPerson.user.password,
                            firstname: testPerson.userProfile.firstname,
                            surname: testPerson.userProfile.surname,
                            birthdate: testPerson.userProfile.birthdate,
                            Crumbz: crumb
                        }
                    }, (res) => {

                        expect(res.statusCode).to.equal(500);
                        expect(res.result.error).to.equal(Boom.internal().message);

                        return done();
                    });
                });
            });

        it('returns error when database fails during saving of username and email information',
            (done) => {

                readUserIdStub = Sinon.stub(testServer.methods.dao.userDao, 'readUserId', (db, username, cb) => {

                    // simulate username/email already exists in DB
                    if (['janedoe', 'jackdoe@gmail.com'].indexOf(username) > -1) {
                        return cb(null, username);
                    }

                    return cb();
                });

                createUserStub = Sinon.stub(testServer.methods.dao.userDao, 'createUser', (db, user, cb) => {

                    // simulate db failure
                    return cb('db_failure');
                });

                createUserProfileStub = Sinon.stub(testServer.methods.dao.userProfileDao, 'createUserProfile',
                    (db, userId, userProfile, cb) => {

                        createdUserProfile['userProfile:' + userId] = Hoek.clone(userProfile);

                        return cb();
                    });

                testServer.inject({
                    method: 'GET',
                    url: '/registration'
                }, (res) => {

                    expect(res.statusCode).to.equal(200);
                    expect(res.headers['set-cookie'].length).to.equal(1);
                    expect(res.headers['set-cookie'][0]).to.contain('Crumbz');
                    expect(res.headers['set-cookie'][0]).to.contain('Secure');
                    expect(res.result.toLowerCase()).to.contain('<!doctype html>');

                    const crumb = res.headers['set-cookie'][0].split('=')[1].split(';')[0];

                    testServer.inject({
                        method: 'POST',
                        url: '/user/registration',
                        headers: {
                            cookie: `Crumbz=${crumb}`
                        },
                        payload: {
                            username: testPerson.user.username,
                            email: testPerson.user.email,
                            password: testPerson.user.password,
                            firstname: testPerson.userProfile.firstname,
                            surname: testPerson.userProfile.surname,
                            birthdate: testPerson.userProfile.birthdate,
                            Crumbz: crumb
                        }
                    }, (res) => {

                        expect(res.statusCode).to.equal(500);
                        expect(res.result.error).to.equal(Boom.internal().message);

                        return done();
                    });
                });
            });

        it('returns error when database fails during saving of user profile information',
            (done) => {

                readUserIdStub = Sinon.stub(testServer.methods.dao.userDao, 'readUserId', (db, username, cb) => {

                    // simulate username/email already exists in DB
                    if (['janedoe', 'jackdoe@gmail.com'].indexOf(username) > -1) {
                        return cb(null, username);
                    }

                    return cb();
                });

                createUserStub = Sinon.stub(testServer.methods.dao.userDao, 'createUser', (db, user, cb) => {

                    createdUserId = user.id;

                    createdUser['user:' + user.id] = user;
                    createdUser['userId:' + user.email] = user.id;
                    createdUser['userId:' + user.username] = user.id;

                    return cb();
                });

                createUserProfileStub = Sinon.stub(testServer.methods.dao.userProfileDao, 'createUserProfile',
                    (db, userId, userProfile, cb) => {

                        // simulate db failure
                        return cb('db_failure');
                    });

                testServer.inject({
                    method: 'GET',
                    url: '/registration'
                }, (res) => {

                    expect(res.statusCode).to.equal(200);
                    expect(res.headers['set-cookie'].length).to.equal(1);
                    expect(res.headers['set-cookie'][0]).to.contain('Crumbz');
                    expect(res.headers['set-cookie'][0]).to.contain('Secure');
                    expect(res.result.toLowerCase()).to.contain('<!doctype html>');

                    const crumb = res.headers['set-cookie'][0].split('=')[1].split(';')[0];

                    testServer.inject({
                        method: 'POST',
                        url: '/user/registration',
                        headers: {
                            cookie: `Crumbz=${crumb}`
                        },
                        payload: {
                            username: testPerson.user.username,
                            email: testPerson.user.email,
                            password: testPerson.user.password,
                            firstname: testPerson.userProfile.firstname,
                            surname: testPerson.userProfile.surname,
                            birthdate: testPerson.userProfile.birthdate,
                            Crumbz: crumb
                        }
                    }, (res) => {

                        expect(res.statusCode).to.equal(500);
                        expect(res.result.error).to.equal(Boom.internal().message);

                        return done();
                    });
                });
            });
    });

    describe('Bcrypt library errors', () => {

        beforeEach((done) => {

            readUserIdStub = Sinon.stub(testServer.methods.dao.userDao, 'readUserId', (db, username, cb) => {

                // simulate username/email already exists in DB
                if (['janedoe', 'jackdoe@gmail.com'].indexOf(username) > -1) {
                    return cb(null, username);
                }

                return cb();
            });

            createUserStub = Sinon.stub(testServer.methods.dao.userDao, 'createUser', (db, user, cb) => {

                createdUserId = user.id;

                createdUser['user:' + user.id] = user;
                createdUser['userId:' + user.email] = user.id;
                createdUser['userId:' + user.username] = user.id;

                return cb();
            });

            createUserProfileStub = Sinon.stub(testServer.methods.dao.userProfileDao, 'createUserProfile',
                (db, userId, userProfile, cb) => {

                    createdUserProfile['userProfile:' + userId] = Hoek.clone(userProfile);

                    return cb();
                });

            return done();
        });

        afterEach((done) => {

            createdUser = {};
            createdUserProfile = {};
            createdUserId = null;

            bcryptStub.restore();
            readUserIdStub.restore();
            createUserStub.restore();
            createUserProfileStub.restore();

            return done();
        });

        it('returns error when salting produces errors',
            (done) => {

                bcryptStub = Sinon.stub(Bcrypt, 'genSalt', (rounds, callback) => {

                    return callback('error');
                });

                testServer.inject({
                    method: 'GET',
                    url: '/registration'
                }, (res) => {

                    expect(res.statusCode).to.equal(200);
                    expect(res.headers['set-cookie'].length).to.equal(1);
                    expect(res.headers['set-cookie'][0]).to.contain('Crumbz');
                    expect(res.headers['set-cookie'][0]).to.contain('Secure');
                    expect(res.result.toLowerCase()).to.contain('<!doctype html>');

                    const crumb = res.headers['set-cookie'][0].split('=')[1].split(';')[0];

                    testServer.inject({
                        method: 'POST',
                        url: '/user/registration',
                        headers: {
                            cookie: `Crumbz=${crumb}`
                        },
                        payload: {
                            username: testPerson.user.username,
                            email: testPerson.user.email,
                            password: testPerson.user.password,
                            firstname: testPerson.userProfile.firstname,
                            surname: testPerson.userProfile.surname,
                            birthdate: testPerson.userProfile.birthdate,
                            Crumbz: crumb
                        }
                    }, (res) => {

                        expect(res.statusCode).to.equal(500);
                        expect(res.result.error).to.equal(Boom.internal().message);

                        return done();
                    });
                });
            });

        it('returns error when hashing password produces errors',
            (done) => {

                bcryptStub = Sinon.stub(Bcrypt, 'hash', (s, salt, callback) => {

                    return callback('error');
                });

                testServer.inject({
                    method: 'GET',
                    url: '/registration'
                }, (res) => {

                    expect(res.statusCode).to.equal(200);
                    expect(res.headers['set-cookie'].length).to.equal(1);
                    expect(res.headers['set-cookie'][0]).to.contain('Crumbz');
                    expect(res.headers['set-cookie'][0]).to.contain('Secure');
                    expect(res.result.toLowerCase()).to.contain('<!doctype html>');

                    const crumb = res.headers['set-cookie'][0].split('=')[1].split(';')[0];

                    testServer.inject({
                        method: 'POST',
                        url: '/user/registration',
                        headers: {
                            cookie: `Crumbz=${crumb}`
                        },
                        payload: {
                            username: testPerson.user.username,
                            email: testPerson.user.email,
                            password: testPerson.user.password,
                            firstname: testPerson.userProfile.firstname,
                            surname: testPerson.userProfile.surname,
                            birthdate: testPerson.userProfile.birthdate,
                            Crumbz: crumb
                        }
                    }, (res) => {

                        expect(res.statusCode).to.equal(500);
                        expect(res.result.error).to.equal(Boom.internal().message);

                        return done();
                    });
                });
            });
    });
});
