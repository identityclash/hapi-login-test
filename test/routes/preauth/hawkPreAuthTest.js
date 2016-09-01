/**
 * Created by Omnius on 18/08/2016.
 */
'use strict';

const Boom = require('boom');
const Code = require('code');
const Hawk = require('hawk');
const Lab = require('lab');

const HawkPreAuth = require(process.cwd() + '/server/routes/preauth/hawkPreAuth');
const TestServer = require('../../testServer');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;

const testServer = new TestServer();

const userCredentials = {
    id: '16fc82ece361f931d22f84bb590e18f63728509936d922df97fe7284f57a9f48',
    key: 'b97d869fa873f163bc489032a4e1fa1d848d141c3e966610f9b9b89869458571',
    algorithm: 'sha256'
};

const testScheme = () => {

    return {
        authenticate: (request, reply) => {

            const req = request.raw.req;

            const credentialsFunc = (id, callback) => {

                if (id === userCredentials.id) {
                    return callback(null, userCredentials);
                }

                return callback();
            };

            Hawk.server.authenticate(req, credentialsFunc, {}, (err, credentials, artifacts) => {

                const result = {credentials: credentials, artifacts: artifacts};

                if (err) {
                    return reply(err, null, result);
                }

                return reply.continue(result);
            });
        }
    };
};

testServer.auth.scheme('testScheme', testScheme);
testServer.auth.strategy('hawk-login-auth-strategy', 'testScheme');

testServer.route({
    path: '/',
    method: 'GET',
    config: {
        auth: 'hawk-login-auth-strategy',
        ext: {
            onPreAuth: {
                method: HawkPreAuth
            }
        },
        handler: function (request, reply) {

            const credentials = request.auth.credentials;

            return reply(credentials);
        }
    }
});

describe('server/routes/preauth/hawkPreAuth', () => {

    it('successfully parses a session token and allows successful authentication', (done) => {

        const cookie = {
            hawkSessionToken: 'bbc2eccc8f7c4a5dc3d7762a8ce81ad061159847151cbbd9af3fa82a957f757f',
            algorithm: 'sha256'
        };
        const base64jsonCookie = new Buffer(JSON.stringify(cookie)).toString('base64');

        testServer.inject({
            method: 'GET',
            url: '/',
            headers: {
                cookie: 'Hawk-Session-Token=' + base64jsonCookie
            }
        }, (res) => {

            expect(res.headers['content-type']).to.include('application/json');
            expect(res.statusCode).to.equal(200);
            expect(res.result).to.equal(userCredentials);

            return done();
        });
    });

    it('fails authentication due to missing session cookie', (done) => {

        testServer.inject({
            method: 'GET',
            url: '/'
        }, (res) => {

            expect(res.statusCode).to.equal(401);
            expect(res.result.error).to.equal(Boom.unauthorized().message);

            return done();
        });
    });

    it('fails authentication due to empty session token', (done) => {

        const cookie = {
            hawkSessionToken: '',
            algorithm: 'sha256'
        };
        const base64jsonCookie = new Buffer(JSON.stringify(cookie)).toString('base64');

        testServer.inject({
            method: 'GET',
            url: '/',
            headers: {
                cookie: 'Hawk-Session-Token=' + base64jsonCookie
            }
        }, (res) => {

            expect(res.statusCode).to.equal(401);
            expect(res.result.error).to.equal(Boom.unauthorized().message);

            return done();
        });
    });

    it('fails authentication due to empty algorithm', (done) => {

        const cookie = {
            hawkSessionToken: 'bbc2eccc8f7c4a5dc3d7762a8ce81ad061159847151cbbd9af3fa82a957f757f',
            algorithm: ''
        };
        const base64jsonCookie = new Buffer(JSON.stringify(cookie)).toString('base64');

        testServer.inject({
            method: 'GET',
            url: '/',
            headers: {
                cookie: 'Hawk-Session-Token=' + base64jsonCookie
            }
        }, (res) => {

            expect(res.statusCode).to.equal(401);
            expect(res.result.error).to.equal(Boom.unauthorized().message);

            return done();
        });
    });

    it('fails authentication due to non-hexadecimal session token', (done) => {

        const cookie = {
            hawkSessionToken: 'xyz_0-$2391abdug',
            algorithm: 'sha256'
        };
        const base64jsonCookie = new Buffer(JSON.stringify(cookie)).toString('base64');

        testServer.inject({
            method: 'GET',
            url: '/',
            headers: {
                cookie: 'Hawk-Session-Token=' + base64jsonCookie
            }
        }, (res) => {

            expect(res.statusCode).to.equal(401);
            expect(res.result.error).to.equal(Boom.unauthorized().message);

            return done();
        });
    });

    it('fails authentication due to an invalid session token length', (done) => {

        const cookie = {
            hawkSessionToken: 'bbc2eccc8f7c4a5dc3d7762a8ce81ad061159847151cbbd9af3fa82a957f757f5',
            algorithm: 'sha256'
        };
        const base64jsonCookie = new Buffer(JSON.stringify(cookie)).toString('base64');

        testServer.inject({
            method: 'GET',
            url: '/',
            headers: {
                cookie: 'Hawk-Session-Token=' + base64jsonCookie
            }
        }, (res) => {

            expect(res.statusCode).to.equal(401);
            expect(res.result.error).to.equal(Boom.unauthorized().message);

            return done();
        });
    });

    it('fails authentication due to an invalid session token', (done) => {

        const cookie = {
            hawkSessionToken: '8e2e01856b562009a76eaa5bfdac2a1efc34656bee18f193f909ad83e984d6d4',
            algorithm: 'sha256'
        };
        const base64jsonCookie = new Buffer(JSON.stringify(cookie)).toString('base64');

        testServer.inject({
            method: 'GET',
            url: '/',
            headers: {
                cookie: 'Hawk-Session-Token=' + base64jsonCookie
            }
        }, (res) => {

            expect(res.statusCode).to.equal(401);
            expect(res.result.error).to.equal(Boom.unauthorized().message);

            return done();
        });
    });
});
