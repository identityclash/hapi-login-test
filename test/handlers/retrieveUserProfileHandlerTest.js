/**
 * Created by Omnius on 31/08/2016.
 */
'use strict';

const Boom = require('boom');
const Code = require('code');
const Hoek = require('hoek');
const Lab = require('lab');
const Sinon = require('sinon');

const RetrieveUserProfileHandler = require(process.cwd() + '/server/handlers/retrieveUserProfileHandler');
const TestServer = require(process.cwd() + '/test/testServer');
const UserCredentialDao = require(process.cwd() + '/server/methods/dao/userCredentialDao');
const UserProfileDao = require(process.cwd() + '/server/methods/dao/userProfileDao');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const beforeEach = lab.beforeEach;
const afterEach = lab.afterEach;
const describe = lab.describe;
const it = lab.it;

const testServer = new TestServer();

const testPerson = {
    'userCredential:4745418325d782929193e5636bba34ebe728114171b72cb62b74dbcee0bff0b4': {
        id: '4745418325d782929193e5636bba34ebe728114171b72cb62b74dbcee0bff0b4',
        key: 'a8980eccd6533e688f147dc9f836eac6c8648559d4f028dd6de45142a7ae7017',
        algorithm: 'sha256',
        hawkSessionToken: '3aa5383345daf71fe5b3418ff3b5f24622237136bc5f576a7d91bace0005a284',
        userId: 'edb78804-0059-460c-8363-460efc0d05fe'
    },
    'userProfile:edb78804-0059-460c-8363-460efc0d05fe': {
        firstname: 'John',
        surname: 'Doe',
        birthdate: '1961-7-10'
    }
};

const testScheme = () => {

    return {
        authenticate: (request, reply) => {

            return reply.continue({
                credentials: testPerson['userCredential:4745418325d782929193e5636bba34ebe728114171b72cb62b74dbcee0bff0b4']
            });
        }
    };
};

testServer.auth.scheme('testScheme', testScheme);
testServer.auth.strategy('testStrategy', 'testScheme');

testServer.handler('retrieveUserProfileHandler', RetrieveUserProfileHandler);

testServer.route([
    {
        path: '/user/{userId}/profile',
        method: 'GET',
        config: {
            auth: 'testStrategy',
            handler: {
                retrieveUserProfileHandler: {
                    type: 'profile'
                }
            }
        }
    }
]);

testServer.method('dao.userCredentialDao.deleteUserCredential', UserCredentialDao.deleteUserCredential);
testServer.method('dao.userCredentialDao.updateUserCredential', UserCredentialDao.updateUserCredential);
testServer.method('dao.userProfileDao.readUserProfile', UserProfileDao.readUserProfile);

let deleteUserCredentialStub;
let updateUserCredentialStub;
let readUserProfileStub;

describe('server/handlers/retrieveUserProfileHandler', () => {

    let clonedTestCredentials = null;

    describe('functional database and hkdf token generation', () => {

        beforeEach((done) => {

            clonedTestCredentials = Hoek.clone(testPerson);

            deleteUserCredentialStub = Sinon.stub(testServer.methods.dao.userCredentialDao, 'deleteUserCredential',
                (db, tokenId, cb) => {

                    delete clonedTestCredentials['userCredential:' + tokenId];

                    return cb();
                });

            updateUserCredentialStub = Sinon.stub(testServer.methods.dao.userCredentialDao, 'updateUserCredential',
                (db, tokenId, credentials, cb) => {

                    clonedTestCredentials['userCredential:' + tokenId] = credentials;

                    return cb();
                });

            readUserProfileStub = Sinon.stub(testServer.methods.dao.userProfileDao, 'readUserProfile',
                (db, userId, cb) => {

                    return cb(null, testPerson['userProfile:' + userId]);
                });

            return done();
        });

        afterEach((done) => {

            clonedTestCredentials = null;

            deleteUserCredentialStub.restore();
            updateUserCredentialStub.restore();
            readUserProfileStub.restore();

            return done();
        });

        it('returns the profile of the user', (done) => {

            testServer.inject({
                method: 'GET',
                url: '/user/edb78804-0059-460c-8363-460efc0d05fe/profile'
            }, (res) => {

                expect(res.statusCode).to.equal(200);
                expect(res.result).to.be.object();
                expect(res.result).to.equal(testPerson['userProfile:edb78804-0059-460c-8363-460efc0d05fe']);
                expect(clonedTestCredentials['userCredential:4745418325d782929193e5636bba34ebe728114171b72cb62b74dbcee0bff0b4']).to.not.exist();

                let cookie;

                for (let i = 0; i < res.headers['set-cookie'].length; i++) {
                    if (res.headers['set-cookie'][i].indexOf('Hawk-Session-Token') > -1) {
                        cookie = res.headers['set-cookie'][i];
                        break;
                    }
                }

                expect(cookie).to.contain('Hawk-Session-Token');
                expect(res.headers['x-permitted-cross-domain-policies']).to.equal('master-only');

                return done();
            });
        });

        it('returns error when user id in cookie does not match user id in url path', (done) => {

            testServer.inject({
                method: 'GET',
                url: '/user/fakeId1234/profile'
            }, (res) => {

                expect(res.statusCode).to.equal(Boom.forbidden().output.statusCode);
                expect(res.result).to.be.object();
                expect(res.result.error).to.equal(Boom.forbidden().message);
                expect(clonedTestCredentials['userCredential:4745418325d782929193e5636bba34ebe728114171b72cb62b74dbcee0bff0b4']).to.exist();
                expect(res.headers['x-permitted-cross-domain-policies']).to.equal('master-only');

                return done();
            });
        });
    });

    describe('database failures', () => {

        beforeEach((done) => {

            clonedTestCredentials = Hoek.clone(testPerson);

            return done();
        });

        afterEach((done) => {

            clonedTestCredentials = null;

            deleteUserCredentialStub.restore();
            updateUserCredentialStub.restore();
            readUserProfileStub.restore();

            return done();
        });

        it('does not return an error page even if deletion of old user credentials fails in db', (done) => {

            deleteUserCredentialStub = Sinon.stub(testServer.methods.dao.userCredentialDao, 'deleteUserCredential',
                (db, tokenId, cb) => {

                    return cb('db_failure');
                });

            updateUserCredentialStub = Sinon.stub(testServer.methods.dao.userCredentialDao, 'updateUserCredential',
                (db, tokenId, credentials, cb) => {

                    clonedTestCredentials['userCredential:' + tokenId] = credentials;

                    return cb();
                });

            readUserProfileStub = Sinon.stub(testServer.methods.dao.userProfileDao, 'readUserProfile',
                (db, userId, cb) => {

                    return cb(null, testPerson['userProfile:' + userId]);
                });

            testServer.inject({
                method: 'GET',
                url: '/user/edb78804-0059-460c-8363-460efc0d05fe/profile'
            }, (res) => {

                expect(res.statusCode).to.equal(200);
                expect(res.result).to.be.object();
                expect(res.result).to.equal(testPerson['userProfile:edb78804-0059-460c-8363-460efc0d05fe']);
                expect(clonedTestCredentials['userCredential:4745418325d782929193e5636bba34ebe728114171b72cb62b74dbcee0bff0b4']).to.exist();

                let cookie;

                for (let i = 0; i < res.headers['set-cookie'].length; i++) {
                    if (res.headers['set-cookie'][i].indexOf('Hawk-Session-Token') > -1) {
                        cookie = res.headers['set-cookie'][i];
                        break;
                    }
                }

                expect(cookie).to.contain('Hawk-Session-Token');
                expect(res.headers['x-permitted-cross-domain-policies']).to.equal('master-only');

                return done();
            });
        });

        it('returns an error if creation of new credentials fails in db', (done) => {

            deleteUserCredentialStub = Sinon.stub(testServer.methods.dao.userCredentialDao, 'deleteUserCredential',
                (db, tokenId, cb) => {

                    delete clonedTestCredentials['userCredential:' + tokenId];

                    return cb();
                });

            updateUserCredentialStub = Sinon.stub(testServer.methods.dao.userCredentialDao, 'updateUserCredential',
                (db, tokenId, credentials, cb) => {

                    return cb('db_failure');
                });

            readUserProfileStub = Sinon.stub(testServer.methods.dao.userProfileDao, 'readUserProfile',
                (db, userId, cb) => {

                    return cb(null, testPerson['userProfile:' + userId]);
                });

            testServer.inject({
                method: 'GET',
                url: '/user/edb78804-0059-460c-8363-460efc0d05fe/profile'
            }, (res) => {

                expect(res.statusCode).to.equal(Boom.internal().output.statusCode);
                expect(res.result).to.be.object();
                expect(res.result.error).to.equal(Boom.internal().message);
                expect(clonedTestCredentials['userCredential:4745418325d782929193e5636bba34ebe728114171b72cb62b74dbcee0bff0b4']).to.not.exist();

                let cookie;

                for (let i = 0; i < res.headers['set-cookie'].length; i++) {
                    if (res.headers['set-cookie'][i].indexOf('Hawk-Session-Token') > -1) {
                        cookie = res.headers['set-cookie'][i];
                        break;
                    }
                }

                const cookieFields = cookie.split(';');

                let hawkSessionValue;

                for (const idx in cookieFields) {
                    if (cookieFields[idx].indexOf('Hawk-Session-Token') > -1) {
                        /* Get token value for testing */
                        hawkSessionValue = cookieFields[idx].split('=')[1];
                        break;
                    }
                }

                expect(hawkSessionValue).to.be.empty();
                expect(res.headers['x-permitted-cross-domain-policies']).to.equal('master-only');

                return done();
            });
        });

        it('returns an error if reading of user\'s profile fails in db', (done) => {

            deleteUserCredentialStub = Sinon.stub(testServer.methods.dao.userCredentialDao, 'deleteUserCredential',
                (db, tokenId, cb) => {

                    delete clonedTestCredentials['userCredential:' + tokenId];

                    return cb();
                });

            updateUserCredentialStub = Sinon.stub(testServer.methods.dao.userCredentialDao, 'updateUserCredential',
                (db, tokenId, credentials, cb) => {

                    clonedTestCredentials['userCredential:' + tokenId] = credentials;

                    return cb();
                });

            readUserProfileStub = Sinon.stub(testServer.methods.dao.userProfileDao, 'readUserProfile',
                (db, userId, cb) => {

                    return cb('db_failure');
                });

            testServer.inject({
                method: 'GET',
                url: '/user/edb78804-0059-460c-8363-460efc0d05fe/profile'
            }, (res) => {

                expect(res.statusCode).to.equal(Boom.internal().output.statusCode);
                expect(res.result).to.be.object();
                expect(res.result.error).to.equal(Boom.internal().message);
                expect(clonedTestCredentials['userCredential:4745418325d782929193e5636bba34ebe728114171b72cb62b74dbcee0bff0b4']).to.not.exist();

                let cookie;

                for (let i = 0; i < res.headers['set-cookie'].length; i++) {
                    if (res.headers['set-cookie'][i].indexOf('Hawk-Session-Token') > -1) {
                        cookie = res.headers['set-cookie'][i];
                        break;
                    }
                }

                const cookieFields = cookie.split(';');

                let hawkSessionValue;

                for (const idx in cookieFields) {
                    if (cookieFields[idx].indexOf('Hawk-Session-Token') > -1) {
                        /* Get token value for testing */
                        hawkSessionValue = cookieFields[idx].split('=')[1];
                        break;
                    }
                }

                expect(hawkSessionValue).to.be.empty();
                expect(res.headers['x-permitted-cross-domain-policies']).to.equal('master-only');

                return done();
            });
        });
    });
});
