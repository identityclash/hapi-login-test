/**
 * Created by Omnius on 05/09/2016.
 */
'use strict';

const Boom = require('boom');
const Code = require('code');
const Lab = require('lab');

const ErrorContext = require(process.cwd() + '/server/helpers/errorContext');
const ErrorPreResponse = require(process.cwd() + '/server/routes/preresponse/errorPreResponse');
const TestServer = require('../../testServer');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;

const testServer = new TestServer();

const customizedMessage = '~~customized message~~';

testServer.route([
    {
        path: '/error/400',
        method: 'GET',
        config: {
            ext: {
                onPreResponse: {
                    method: ErrorPreResponse
                }
            },
            handler: function (request, reply) {

                return reply(Boom.badRequest());
            }
        }
    },
    {
        path: '/error/400custom',
        method: 'GET',
        config: {
            ext: {
                onPreResponse: {
                    method: ErrorPreResponse
                }
            },
            handler: function (request, reply) {

                return reply(Boom.badRequest(customizedMessage));
            }
        }
    },
    {
        path: '/error/401',
        method: 'GET',
        config: {
            ext: {
                onPreResponse: {
                    method: ErrorPreResponse
                }
            },
            handler: function (request, reply) {

                return reply(Boom.unauthorized());
            }
        }
    },
    {
        path: '/error/403',
        method: 'GET',
        config: {
            ext: {
                onPreResponse: {
                    method: ErrorPreResponse
                }
            },
            handler: function (request, reply) {

                return reply(Boom.forbidden());
            }
        }
    },
    {
        path: '/error/404',
        method: 'GET',
        config: {
            ext: {
                onPreResponse: {
                    method: ErrorPreResponse
                }
            },
            handler: function (request, reply) {

                return reply(Boom.notFound());
            }
        }
    },
    {
        path: '/error/500',
        method: 'GET',
        config: {
            ext: {
                onPreResponse: {
                    method: ErrorPreResponse
                }
            },
            handler: function (request, reply) {

                return reply(Boom.internal());
            }
        }
    }
]);

describe('server/routes/preresponse/errorPreResponse', () => {

    it('returns error 400 web page', (done) => {

        const statusCode = 400;

        testServer.inject({
            method: 'GET',
            url: `/error/${statusCode}`
        }, (res) => {

            expect(res.result.length).to.be.above(0);
            expect(res.headers['content-type']).to.include('text/html');
            expect(res.statusCode).to.equal(statusCode);
            expect(res.result.toString()).to.contain('<!doctype html>');
            expect(res.result.toString()).to.contain(ErrorContext[statusCode].custom);

            return done();
        });
    });

    it('returns error 400 web page with customized Boom error message', (done) => {

        const statusCode = 400;

        testServer.inject({
            method: 'GET',
            url: `/error/${statusCode}custom`
        }, (res) => {

            expect(res.result.length).to.be.above(0);
            expect(res.headers['content-type']).to.include('text/html');
            expect(res.statusCode).to.equal(statusCode);
            expect(res.result.toString()).to.contain('<!doctype html>');
            expect(res.result.toString()).to.contain(customizedMessage);

            return done();
        });
    });

    it('returns error 401 web page', (done) => {

        const statusCode = 401;

        testServer.inject({
            method: 'GET',
            url: `/error/${statusCode}`
        }, (res) => {

            expect(res.result.length).to.be.above(0);
            expect(res.headers['content-type']).to.include('text/html');
            expect(res.statusCode).to.equal(statusCode);
            expect(res.result.toString()).to.contain('<!doctype html>');
            expect(res.result.toString()).to.contain(ErrorContext[statusCode].custom);

            return done();
        });
    });

    it('returns error 403 web page', (done) => {

        const statusCode = 403;

        testServer.inject({
            method: 'GET',
            url: `/error/${statusCode}`
        }, (res) => {

            expect(res.result.length).to.be.above(0);
            expect(res.headers['content-type']).to.include('text/html');
            expect(res.statusCode).to.equal(statusCode);
            expect(res.result.toString()).to.contain('<!doctype html>');
            expect(res.result.toString()).to.contain(ErrorContext[statusCode].custom);

            return done();
        });
    });

    it('returns error 404 web page', (done) => {

        const statusCode = 404;

        testServer.inject({
            method: 'GET',
            url: `/error/${statusCode}`
        }, (res) => {

            expect(res.result.length).to.be.above(0);
            expect(res.headers['content-type']).to.include('text/html');
            expect(res.statusCode).to.equal(statusCode);
            expect(res.result.toString()).to.contain('<!doctype html>');
            expect(res.result.toString()).to.contain(ErrorContext[statusCode].custom);

            return done();
        });
    });

    it('returns error 500 web page', (done) => {

        const statusCode = 500;

        testServer.inject({
            method: 'GET',
            url: `/error/${statusCode}`
        }, (res) => {

            expect(res.result.length).to.be.above(0);
            expect(res.headers['content-type']).to.include('text/html');
            expect(res.statusCode).to.equal(statusCode);
            expect(res.result.toString()).to.contain('<!doctype html>');
            expect(res.result.toString()).to.contain(ErrorContext[statusCode].custom);

            return done();
        });
    });
});
