/**
 * Created by Omnius on 23/08/2016.
 */
'use strict';

const Boom = require('boom');
const Code = require('code');
const Lab = require('lab');

const RootHandler = require(process.cwd() + '/server/handlers/rootHandler');
const TestServer = require(process.cwd() + '/test/testServer');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;

const testServer = new TestServer();

testServer.handler('rootHandler', RootHandler);

testServer.route([
    {
        path: '/',
        method: 'GET',
        config: {
            handler: {
                rootHandler: {
                    type: 'index'
                }
            }
        }
    },
    {
        path: '/{path*}',
        method: '*',
        config: {
            handler: {
                rootHandler: {}
            }
        }
    },
    {
        path: '/somethingelse',
        method: '*',
        config: {
            handler: {
                rootHandler: {
                    type: 'somethingelse'
                }
            }
        }
    }
]);

describe('server/handlers/rootHandler', () => {

    it('redirects to user\'s welcome page when a session cookie exists', (done) => {

        const cookie = {
            hawkSessionToken: '8e2e01856b562009a76eaa5bfdac2a1e0c34656bee18f193f909ad83e984d6d4',
            userId: '14f755c7-7fe5-44f9-a742-eb9c1bb37748',
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

            expect(res.statusCode).to.equal(302);
            expect(res.headers.location).to.equal(`/user/${cookie.userId}/welcome`);

            return done();
        });
    });

    it('redirects to login page on index', (done) => {

        testServer.inject({
            method: 'GET',
            url: '/'
        }, (res) => {

            expect(res.statusCode).to.equal(302);
            expect(res.headers.location).to.equal('/login');

            return done();
        });
    });

    it('handles when resource is notfound', (done) => {

        testServer.inject({
            method: 'POST',
            url: '/hello'
        }, (res) => {

            expect(res.statusCode).to.equal(Boom.notFound().output.statusCode);
            expect(res.result).to.be.object();
            expect(res.result.error).to.equal(Boom.notFound().message);

            return done();
        });
    });

    it('continues if option types that are neither index nor notfound', (done) => {

        testServer.inject({
            method: 'GET',
            url: '/somethingelse'
        }, (res) => {

            expect(res.statusCode).to.equal(200);
            expect(res.result).to.be.null();

            return done();
        });
    });
});
