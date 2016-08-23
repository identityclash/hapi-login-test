/**
 * Created by Omnius on 23/08/2016.
 */
'use strict';

const Code = require('code');
const Lab = require('lab');

const TestServer = require('../testServer');
const RootHandler = require(process.cwd() + '/server/handlers/rootHandler');

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

            expect(res.statusCode).to.equal(404);
            expect(res.result).to.contain('<!doctype html>');
            expect(res.result.toLowerCase()).to.contain('page not found');

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
