/**
 * Created by Omnius on 31/07/2016.
 */
'use strict';

const Async = require('async');
const Boom = require('boom');
const Code = require('code');
const Lab = require('lab');

const RootRoute = require(process.cwd() + '/server/routes/rootRoute');
const TestServer = require('../testServer');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;

const testServer = new TestServer();

testServer.handler('rootHandler', (route, options) => {

    return (request, reply) => {

        if (options.type === 'notfound') {
            return reply(Boom.notFound());
        }

        return reply(true);
    };
});

testServer.route(RootRoute);

describe('server/routes/rootRoute', () => {

    it('has GET on path /css/register.css', (done) => {

        testServer.inject({
            method: 'GET',
            url: '/css/register.css'
        }, (res) => {

            expect(res.statusCode).to.equal(200);
            expect(res.result).to.contain('body');

            return done();
        });
    });

    it('has GET on path /js/std/jquery.min.js', (done) => {

        testServer.inject({
            method: 'GET',
            url: '/js/std/jquery.min.js'
        }, (res) => {

            expect(res.statusCode).to.equal(200);
            expect(res.headers['content-type']).to.include('application/javascript');
            expect(res.result).to.contain('function');

            return done();
        });
    });

    it('has GET, POST, PUT, and DELETE path /hello-world', (done) => {

        const methodNames = ['GET', 'POST', 'PUT', 'DELETE'];

        Async.each(methodNames, (name, next) => {

            testServer.inject({
                method: name,
                url: '/hello-world'
            }, (res) => {

                expect(res.statusCode).to.equal(404);
                expect(res.result.error).to.equal(Boom.notFound().message);

                return next();
            });
        }, () => {

            return done();
        });
    });
});
