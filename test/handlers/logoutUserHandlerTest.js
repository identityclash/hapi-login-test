/**
 * Created by Omnius on 23/08/2016.
 */
'use strict';

const Code = require('code');
const Lab = require('lab');
const Sinon = require('sinon');

const TestServer = require('../testServer');
const LogoutUserHandler = require(process.cwd() + '/server/handlers/logoutUserHandler');
const UserCredentialDao = require(process.cwd() + '/server/methods/dao/userCredentialDao');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const before = lab.before;
const after = lab.after;
const describe = lab.describe;
const it = lab.it;

const testServer = new TestServer();

const testScheme = () => {

    return {
        authenticate: (request, reply) => {

            return reply.continue({credentials: {}});
        }
    };
};

testServer.auth.scheme('testScheme', testScheme);
testServer.auth.strategy('testStrategy', 'testScheme');

testServer.handler('logoutUserHandler', LogoutUserHandler);

testServer.route([
    {
        path: '/logout',
        method: 'GET',
        config: {
            auth: 'testStrategy',
            handler: {
                logoutUserHandler: {}
            }
        }
    }
]);

testServer.method('dao.userCredentialDao.deleteUserCredential', UserCredentialDao.deleteUserCredential);

let deleteUserCredentialStub;

describe('server/handlers/logoutUserHandler', () => {

    describe('functional database deletion', () => {

        before((done) => {

            deleteUserCredentialStub = Sinon.stub(testServer.methods.dao.userCredentialDao, 'deleteUserCredential',
                (db, token, cb) => {

                    return cb();
                });

            return done();
        });

        after((done) => {

            deleteUserCredentialStub.restore();

            return done();
        });

        it('removes the Hawk-Session-Token upon logout', (done) => {

            const cookie = {
                hawkSessionToken: '8e2e01856b562009a76eaa5bfdac2a1e0c34656bee18f193f909ad83e984d6d4',
                algorithm: 'sha256'
            };
            const base64jsonCookie = new Buffer(JSON.stringify(cookie)).toString('base64');

            testServer.inject({
                method: 'GET',
                url: '/logout',
                headers: {
                    cookie: 'Hawk-Session-Token=' + base64jsonCookie
                }
            }, (res) => {

                expect(res.statusCode).to.equal(302);

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
                expect(res.headers.location).to.equal('/login');

                return done();
            });
        });

        it('returns to login page', (done) => {

            testServer.inject({
                method: 'GET',
                url: '/logout'
            }, (res) => {

                expect(res.statusCode).to.equal(302);
                expect(res.headers.location).to.equal('/login');

                return done();
            });
        });
    });

    describe('issue in database deletion', () => {

        before((done) => {

            deleteUserCredentialStub = Sinon.stub(testServer.methods.dao.userCredentialDao, 'deleteUserCredential',
                (db, token, cb) => {

                    return cb('db error');
                });

            return done();
        });

        after((done) => {

            deleteUserCredentialStub.restore();

            return done();
        });

        it('removes the Hawk-Session-Token upon logout', (done) => {

            const cookie = {
                hawkSessionToken: '8e2e01856b562009a76eaa5bfdac2a1e0c34656bee18f193f909ad83e984d6d4',
                algorithm: 'sha256'
            };
            const base64jsonCookie = new Buffer(JSON.stringify(cookie)).toString('base64');

            testServer.inject({
                method: 'GET',
                url: '/logout',
                headers: {
                    cookie: 'Hawk-Session-Token=' + base64jsonCookie
                }
            }, (res) => {

                expect(res.statusCode).to.equal(302);

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
                expect(res.headers.location).to.equal('/login');

                return done();
            });
        });
    });
});
