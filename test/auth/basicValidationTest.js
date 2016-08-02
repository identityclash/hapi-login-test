/**
 * Created by Omnius on 01/08/2016.
 */
'use strict';

const Boom = require('boom');
const Code = require('code');
const Lab = require('lab');
const Sinon = require('sinon');

const BasicValidation = require(process.cwd() + '/server/auth/basic/basicValidation');
const TestServer = require('../testServer');
const UserDao = require(process.cwd() + '/server/methods/dao/userDao');
const UserCredentialDao = require(process.cwd() + '/server/methods/dao/userCredentialDao');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const after = lab.after;
const describe = lab.describe;
const it = lab.it;

const internals = {};

internals.header = function (username, password) {

    return 'Basic ' + (new Buffer((username || '') + ':' + password, 'utf8')).toString('base64');
};

const testServer = new TestServer();
const USER_DAO_KEY = 'dao.userDao.';
const USER_CREDENTIAL_DAO_KEY = 'dao.userCredentialDao.';

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

testServer.method(USER_DAO_KEY + 'readUserId', UserDao.readUserId);
testServer.method(USER_DAO_KEY + 'readUserHashAndRealm', UserDao.readUserHashAndRealm);
testServer.method(USER_CREDENTIAL_DAO_KEY + 'createUserCredential', UserCredentialDao.createUserCredential);

const testPersons = [
    // happy path
    {
        username: 'johndoe',
        userId: 'af7fa48f-acf5-4af7-ace5-12c78804b650',
        hashedPw: '$2a$10$9Z5Ow7Q3XE8K6foPUEk/AOjXULHsvLNiF0j9fsMEHJRhJd.fj7bo6',
        realm: 'My Realm'
    },
    // Behave as DB failure during retrieval of user
    {
        username: 'jackydoe',
        failUserDb: true
    },
    // Behave as hash/pw does not match
    {
        username: 'jennydoe',
        userId: '89109fc9-30ec-47e2-89b6-0b6d586f7ab5',
        hashedPw: 'fakeHashedPw',
        realm: 'My Realm'
    },
    // Behave as DB failure during hashed password retrieval
    {
        username: 'janedoe',
        userId: '116b6d33-bfb4-4c28-9981-ba01e945fe4f',
        hashedPw: '$2a$10$AqsPaLai1OmiieNLc3zT0.l.BTEIZhISnilqMMWDf3mKu25lkCdsW',
        realm: 'My Realm',
        failHashDb: true
    },
    // Behave as DB failure during generation of Hawk session token
    {
        username: 'jerrydoe',
        userId: 'c27e6784-5aa6-452c-b3aa-b7f577671820',
        hashedPw: '$2a$10$lPTzVC1mob5nwyO5aPf2jehD12/AinEodmMLI7cdQvMSYPMncLeI.',
        realm: 'My Realm',
        failSessionDb: true
    }
];

const readUserIdStub = Sinon.stub(testServer.methods.dao.userDao, 'readUserId', (db, username, cb) => {

    for (const idx in testPersons) {
        if (testPersons[idx].username === username) {
            if (testPersons[idx].failUserDb) {
                return cb('readuserid_db_failure');
            }

            return cb(null, testPersons[idx].userId);
        }
    }

    return cb();
});

const readUserHashAndRealmStub = Sinon.stub(testServer.methods.dao.userDao, 'readUserHashAndRealm',
    (db, userId, cb) => {

        for (const idx in testPersons) {
            if (testPersons[idx].userId === userId) {
                if (testPersons[idx].failHashDb) {
                    return cb('readuserhashandrealm_db_failure');
                }

                return cb(null, [
                    testPersons[idx].hashedPw,
                    testPersons[idx].realm
                ]);
            }
        }

        return cb();
    });

const createUserCredentialStub = Sinon.stub(testServer.methods.dao.userCredentialDao, 'createUserCredential',
    (db, sessionId, userCredentials, cb) => {

        if (userCredentials.userId === 'c27e6784-5aa6-452c-b3aa-b7f577671820') {
            return cb('createusercredential_db_failure');
        }
        if (sessionId) {
            return cb(null, {credentials: 'good credentials'});
        }

        return cb('bad credentials');
    });

describe('server/routes/basicValidation', () => {

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
                authorization: internals.header('unknown', 'password')
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
                authorization: internals.header('jennydoe', 'password')
            }
        }, (res) => {

            expect(res.headers['content-type']).to.include('application/json');
            expect(res.statusCode).to.equal(401);
            expect(res.result.error).to.equal(Boom.unauthorized().message);

            return done();
        });
    });

    it('denies authorization having incomplete basic authentication header', (done) => {

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

    it('returns server error when DB fails during retrieval of user ID', (done) => {

        testServer.inject({
            method: 'POST',
            url: '/basic',
            headers: {
                authorization: internals.header('jackydoe', 'password')
            }
        }, (res) => {

            expect(res.headers['content-type']).to.include('application/json');
            expect(res.statusCode).to.equal(500);
            expect(res.result.error).to.equal(Boom.internal().message);

            return done();
        });
    });

    it('returns server error when DB fails during retrieval of user\'s hashed password', (done) => {

        testServer.inject({
            method: 'POST',
            url: '/basic',
            headers: {
                authorization: internals.header('janedoe', 'password')
            }
        }, (res) => {

            expect(res.headers['content-type']).to.include('application/json');
            expect(res.statusCode).to.equal(500);
            expect(res.result.error).to.equal(Boom.internal().message);

            return done();
        });
    });

    it('returns server error when DB fails during generation of Hawk session token', (done) => {

        testServer.inject({
            method: 'POST',
            url: '/basic',
            headers: {
                authorization: internals.header('jerrydoe', 'password')
            }
        }, (res) => {

            expect(res.headers['content-type']).to.include('application/json');
            expect(res.statusCode).to.equal(500);
            expect(res.result.error).to.equal(Boom.internal().message);

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
