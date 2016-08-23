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
    key: 'dbc14cb180a5719a90ec1edf2cb1e276a7e857f8b68e9276e83a9e082404e372',
    id: '3ec2b9261714e317cef1b74e5338111070be5794021b9a8b0ff915f1a9efc4eb',
    algorithm: 'sha256',
    user: '14f755c7-7fe5-44f9-a742-eb9c1bb37748'
};

const testScheme = () => {

    return {
        authenticate: (request, reply) => {

            const req = request.raw.req;

            const credentialsFunc = (id, callback) => {

                if (id === userCredentials.id) {
                    return callback(null, userCredentials);
                }

                return callback(null, {});
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
        handler: (request, reply) => {

            const credentials = request.auth.credentials;

            return reply(credentials);
        }
    }
});

describe('server/routes/preauth/hawkPreAuth', () => {

    it('successfully parses a session token and allows successful authentication', (done) => {

        const cookie = {
            hawkSessionToken: '8e2e01856b562009a76eaa5bfdac2a1e0c34656bee18f193f909ad83e984d6d4',
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
            hawkSessionToken: '8e2e01856b562009a76eaa5bfdac2a1e0c34656bee18f193f909ad83e984d6d4',
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
            hawkSessionToken: '8e2e01856b562009a76eaa5bfdac2a1e0c34656bee18f193f909ad83e984d6d45',
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

            expect(res.statusCode).to.equal(500);
            expect(res.result.error).to.equal(Boom.internal().message);

            return done();
        });
    });
});
