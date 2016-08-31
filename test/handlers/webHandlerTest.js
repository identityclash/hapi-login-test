/**
 * Created by Omnius on 23/08/2016.
 */
'use strict';

const Code = require('code');
const Lab = require('lab');

const WebHandler = require(process.cwd() + '/server/handlers/webHandler');
const TestServer = require(process.cwd() + '/test/testServer');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;

const testServer = new TestServer();

testServer.handler('webHandler', WebHandler);

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
        path: '/login',
        method: 'GET',
        config: {
            handler: {
                webHandler: {
                    type: 'index'
                }
            }
        }
    },
    {
        path: '/somethingelse',
        method: '*',
        config: {
            handler: {
                webHandler: {
                    type: 'somethingelse'
                }
            }
        }
    }
]);

describe('server/handlers/webHandler', () => {

    it('redirects to user\'s welcome page when a session cookie exists', (done) => {

        const cookie = {
            hawkSessionToken: '8e2e01856b562009a76eaa5bfdac2a1e0c34656bee18f193f909ad83e984d6d4',
            userId: '14f755c7-7fe5-44f9-a742-eb9c1bb37748',
            algorithm: 'sha256'
        };
        const base64jsonCookie = new Buffer(JSON.stringify(cookie)).toString('base64');

        testServer.inject({
            method: 'GET',
            url: '/registration',
            headers: {
                cookie: 'Hawk-Session-Token=' + base64jsonCookie
            }
        }, (res) => {

            expect(res.statusCode).to.equal(302);
            expect(res.headers.location).to.equal(`/user/${cookie.userId}/welcome`);

            return done();
        });
    });

    it('renders registration page', (done) => {

        testServer.inject({
            method: 'GET',
            url: '/registration'
        }, (res) => {

            expect(res.statusCode).to.equal(200);
            expect(res.headers['x-permitted-cross-domain-policies']).to.equal('master-only');
            expect(res.result.toLowerCase()).to.contain('<!doctype html>');

            return done();
        });
    });

    it('renders login page on index', (done) => {

        testServer.inject({
            method: 'GET',
            url: '/login'
        }, (res) => {

            expect(res.statusCode).to.equal(200);
            expect(res.result.toLowerCase()).to.contain('<!doctype html>');

            return done();
        });
    });

    it('continues if option types that are neither registration nor index', (done) => {

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
