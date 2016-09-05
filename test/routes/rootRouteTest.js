/**
 * Created by Omnius on 31/07/2016.
 */
'use strict';

const Async = require('async');
const Boom = require('boom');
const Code = require('code');
const Lab = require('lab');

const ErrorContext = require(process.cwd() + '/server/helpers/errorContext');
const RootRoute = require(process.cwd() + '/server/routes/rootRoute');
const TestServer = require('../testServer');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;

const testServer = new TestServer();

testServer.handler('rootHandler', (route, options) => {

    return function (request, reply) {

        if (options.type === 'index') {
            return reply.redirect('/login');
        }
        if (options.type === 'notfound') {
            return reply(Boom.notFound());
        }

        return reply(true);
    };
});

testServer.handler('loginHandler', () => {

    return (request, reply) => {

        return reply(true);
    };
});

testServer.route(RootRoute);
testServer.route({
    path: '/login',
    method: 'GET',
    handler: {
        loginHandler: {}
    }
});

describe('server/routes/rootRoute', () => {

    it('has GET path /', (done) => {

        testServer.inject({
            method: 'GET',
            url: '/'
        }, (res) => {

            expect(res.statusCode).to.equal(302);
            return done();
        });
    });

    it('has GET, POST, PUT, and DELETE path /hello-world', (done) => {

        const methodNames = ['GET', 'POST', 'PUT', 'DELETE'];
        const statusCode = 404;

        Async.each(methodNames, (name, next) => {

            testServer.inject({
                method: name,
                url: '/hello-world'
            }, (res) => {

                expect(res.statusCode).to.equal(statusCode);
                expect(res.headers['content-type']).to.include('text/html');
                expect(res.result.toString()).to.contain(ErrorContext[statusCode].custom);

                return next();
            });
        }, () => {

            return done();
        });
    });
});
