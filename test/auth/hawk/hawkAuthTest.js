/**
 * Created by Omnius on 01/08/2016.
 */
'use strict';

const Boom = require('boom');
const Code = require('code');
const Hawk = require('hawk');
const Lab = require('lab');
const Sinon = require('sinon');

const HawkAuth = require(process.cwd() + '/server/auth/hawk/hawkAuth');
const UserCredentialDao = require(process.cwd() + '/server/methods/dao/userCredentialDao');
const TestServer = require(process.cwd() + '/test/testServer');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const before = lab.before;
const after = lab.after;
const describe = lab.describe;
const it = lab.it;

const testServer = new TestServer();

testServer.register(HawkAuth);

testServer.route({
    path: '/',
    method: 'GET',
    config: {
        auth: 'hawk-login-auth-strategy',
        handler: (request, reply) => {

            const credentials = request.auth.credentials;
            return reply(credentials);
        }
    }
});

testServer.method('dao.userCredentialDao.readUserCredential', UserCredentialDao.readUserCredential);

const testPersons = [
    {
        credentials: {
            id: 'dh37fgj492je',
            key: 'werxhqb98rpaxn39848xrunpaw3489ruxnpa98w4rxn',
            algorithm: 'sha256'
        }
    }
];

let readUserCredentialStub;

describe('server/auth/hawk/hawkAuth', () => {

    describe('functional database with user\'s credentials', () => {

        before((done) => {

            readUserCredentialStub = Sinon.stub(testServer.methods.dao.userCredentialDao, 'readUserCredential',
                (db, sessionId, cb) => {

                    return cb(null, testPersons[0].credentials);
                });

            return done();
        });

        after((done) => {

            readUserCredentialStub.restore();

            return done();
        });

        it('allows entry with valid credentials', (done) => {

            /* URL in testServer */
            const url = 'https://127.0.0.1:443/';
            const header = Hawk.client.header(url, 'GET', {
                credentials: testPersons[0].credentials,
                ext: 'some-app-data'
            });

            testServer.inject({
                method: 'GET',
                url: '/',
                headers: {
                    authorization: header.field
                }
            }, (res) => {

                expect(res.headers['content-type']).to.include('application/json');
                expect(res.statusCode).to.equal(200);
                expect(res.result).to.be.an.object();
                expect(res.result.algorithm).to.equal(testPersons[0].credentials.algorithm);
                expect(res.result.key).to.equal(testPersons[0].credentials.key);
                expect(res.result.id).to.equal(testPersons[0].credentials.id);

                return done();
            });
        });

        it('denies entry with invalid credentials', (done) => {

            const url = 'https://127.0.0.1:443/';
            const header = Hawk.client.header(url, 'GET', {
                credentials: {
                    id: 'id1',
                    key: 'blabla',
                    algorithm: 'sha1'
                },
                ext: 'some-app-data'
            });

            testServer.inject({
                method: 'GET',
                url: '/',
                headers: {
                    authorization: header.field
                }
            }, (res) => {

                expect(res.headers['content-type']).to.include('application/json');
                expect(res.statusCode).to.equal(401);
                expect(res.result.error).to.equal(Boom.unauthorized().message);

                return done();
            });
        });

        it('denies entry with empty credentials', (done) => {

            const url = 'https://127.0.0.1:443/';
            const header = Hawk.client.header(url, 'GET', {
                credentials: {},
                ext: 'some-app-data'
            });

            testServer.inject({
                method: 'GET',
                url: '/',
                headers: {
                    authorization: header.field
                }
            }, (res) => {

                expect(res.headers['content-type']).to.include('application/json');
                expect(res.statusCode).to.equal(401);
                expect(res.result.error).to.equal(Boom.unauthorized().message);

                return done();
            });
        });
    });

    describe('functional database without user\'s credentials', () => {

        before((done) => {

            readUserCredentialStub = Sinon.stub(testServer.methods.dao.userCredentialDao, 'readUserCredential',
                (db, sessionId, cb) => {

                    return cb(null, {});
                });

            return done();
        });

        after((done) => {

            readUserCredentialStub.restore();

            return done();
        });

        it('denies entry when no credentials are retrieved from the database', (done) => {

            const url = 'https://127.0.0.1:443/';
            const header = Hawk.client.header(url, 'GET', {
                credentials: testPersons[0].credentials,
                ext: 'some-app-data'
            });

            testServer.inject({
                method: 'GET',
                url: '/',
                headers: {
                    authorization: header.field
                }
            }, (res) => {

                expect(res.headers['content-type']).to.include('application/json');
                expect(res.statusCode).to.equal(403);
                expect(res.result.error).to.equal(Boom.forbidden().message);

                return done();
            });
        });
    });

    describe('database error', () => {

        before((done) => {

            readUserCredentialStub = Sinon.stub(testServer.methods.dao.userCredentialDao, 'readUserCredential',
                (db, sessionId, cb) => {

                    return cb('some error');
                });

            return done();
        });

        after((done) => {

            readUserCredentialStub.restore();

            return done();
        });

        it('returns server error when DB fails during retrieval of credentials', (done) => {

            const url = 'https://127.0.0.1:443/';
            const header = Hawk.client.header(url, 'GET', {
                credentials: testPersons[0].credentials,
                ext: 'some-app-data'
            });

            testServer.inject({
                method: 'GET',
                url: '/',
                headers: {
                    authorization: header.field
                }
            }, (res) => {

                expect(res.headers['content-type']).to.include('application/json');
                expect(res.statusCode).to.equal(503);
                expect(res.result.error).to.equal(Boom.serverUnavailable().message);

                return done();
            });
        });
    });
});
