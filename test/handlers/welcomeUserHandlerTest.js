/**
 * Created by Omnius on 31/08/2016.
 */
'use strict';

const Boom = require('boom');
const Code = require('code');
const Lab = require('lab');
const Sinon = require('sinon');

const WelcomeUserHandler = require(process.cwd() + '/server/handlers/welcomeUserHandler');
const TestServer = require(process.cwd() + '/test/testServer');
const UserDao = require(process.cwd() + '/server/methods/dao/userDao');

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
    'user:edb78804-0059-460c-8363-460efc0d05fe': {
        username: 'johndoe'
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

testServer.handler('welcomeUserHandler', WelcomeUserHandler);

testServer.route([
    {
        path: '/user/{userId}/welcome',
        method: 'GET',
        config: {
            auth: 'testStrategy',
            handler: {
                welcomeUserHandler: {
                    type: 'profile'
                }
            }
        }
    }
]);

testServer.method('dao.userDao.readUsername', UserDao.readUsername);

let readUsernameStub;

describe('server/handlers/welcomeUserHandler', () => {

    describe('functional database', () => {

        beforeEach((done) => {

            readUsernameStub = Sinon.stub(testServer.methods.dao.userDao, 'readUsername', (db, userId, cb) => {

                return cb(null, testPerson['user:edb78804-0059-460c-8363-460efc0d05fe'].username);
            });

            return done();
        });

        afterEach((done) => {

            readUsernameStub.restore();

            return done();
        });

        it('accesses welcome page', (done) => {

            testServer.inject({
                method: 'GET',
                url: '/user/edb78804-0059-460c-8363-460efc0d05fe/welcome'
            }, (res) => {

                expect(res.statusCode).to.equal(200);
                expect(res.result.toLowerCase()).to.contain('<!doctype html>');

                let cookie;

                for (let i = 0; i < res.headers['set-cookie'].length; ++i) {
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

                expect(hawkSessionValue).to.be.not.empty();
                expect(res.headers['x-permitted-cross-domain-policies']).to.equal('master-only');
                expect(res.headers['cache-control']).to.equal('no-cache, no-store, must-revalidate');

                return done();
            });
        });

        it('returns 401', (done) => {

            testServer.inject({
                method: 'GET',
                url: '/user/e/welcome'
            }, (res) => {

                expect(res.headers['set-cookie']).to.not.exist();
                expect(res.statusCode).to.equal(Boom.forbidden().output.statusCode);
                expect(res.result).to.be.object();
                expect(res.result.error).to.equal(Boom.forbidden().message);
                expect(res.headers['content-type']).to.include('application/json');

                return done();
            });
        });
    });

    describe('database failure', () => {

        beforeEach((done) => {

            readUsernameStub = Sinon.stub(testServer.methods.dao.userDao, 'readUsername', (db, userId, cb) => {

                return cb('db_error');
            });

            return done();
        });

        afterEach((done) => {

            readUsernameStub.restore();

            return done();
        });

        it('returns error on database failure', (done) => {

            testServer.inject({
                method: 'GET',
                url: '/user/edb78804-0059-460c-8363-460efc0d05fe/welcome'
            }, (res) => {

                expect(res.statusCode).to.equal(Boom.internal().output.statusCode);
                expect(res.result).to.be.object();
                expect(res.result.error).to.equal(Boom.internal().message);

                return done();
            });
        });
    });
});
