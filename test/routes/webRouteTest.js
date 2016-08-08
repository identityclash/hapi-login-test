'use strict';

const Async = require('async');
const Boom = require('boom');
const Code = require('code');
const Lab = require('lab');

const WebRoute = require(process.cwd() + '/server/routes/webRoute');
const TestServer = require('../testServer');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const beforeEach = lab.beforeEach;
const afterEach = lab.afterEach;
const describe = lab.describe;
const it = lab.it;

const HANDLER_NAMES = ['webHandler', 'registerUserHandler', 'welcomeUserHandler', 'logoutUserHandler'];
const PASSED_THRU = 'Test passed through handler ';

let testHandlerNameContainer = [];

const testServer = new TestServer();

const testScheme = () => {

    return {
        authenticate: (request, reply) => {

            return reply.continue({credentials: {}});
        }
    };
};

testServer.auth.scheme('testScheme', testScheme);
testServer.auth.strategy('hawk-login-auth-strategy', 'testScheme');
testServer.auth.strategy('basic-login-auth-strategy', 'testScheme');

Async.each(HANDLER_NAMES, (name, next) => {

    testServer.handler(name, () => {

        return (request, reply) => {

            if (HANDLER_NAMES.indexOf(name) >= 0 && testHandlerNameContainer.indexOf(name) < 0) {
                testHandlerNameContainer.push(PASSED_THRU + name);
            }

            return reply(true);
        };
    });

    return next();
});

testServer.route(WebRoute);

describe('server/routes/webRoute', () => {

    beforeEach((done) => {

        return done();
    });

    afterEach((done) => {

        testHandlerNameContainer = [];
        return done();
    });

    it('has GET path /css/register.css', (done) => {

        testServer.inject({
            method: 'GET',
            url: '/css/register.css'
        }, (res) => {

            expect(res.statusCode).to.equal(200);
            expect(res.result).to.contain('body');

            return done();
        });
    });

    it('has GET path /js/std/jquery.min.js', (done) => {

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

    it('has GET path /login', (done) => {

        testServer.inject({
            method: 'GET',
            url: '/login'
        }, (res) => {

            expect(testHandlerNameContainer).to.include(PASSED_THRU + 'webHandler');
            expect(res.headers['content-type']).to.include('application/json');
            expect(res.statusCode).to.equal(200);
            expect(res.result).to.be.true();

            return done();
        });
    });

    it('has GET path /registration', (done) => {

        testServer.inject({
            method: 'GET',
            url: '/registration'
        }, (res) => {

            expect(testHandlerNameContainer).to.include(PASSED_THRU + 'webHandler');
            expect(res.headers['content-type']).to.include('application/json');
            expect(res.statusCode).to.equal(200);
            expect(res.result).to.be.true();

            return done();
        });
    });

    it('has POST path /user/registration', (done) => {

        testServer.inject({
            method: 'POST',
            url: '/user/registration',
            payload: {
                username: 'johndoe',
                email: 'johndoe@gmail.com',
                password: 'password1234',
                firstname: 'john',
                surname: 'doe',
                birthdate: '1980-12-12'
            }
        }, (res) => {

            expect(testHandlerNameContainer).to.include(PASSED_THRU + 'registerUserHandler');
            expect(res.headers['content-type']).to.include('application/json');
            expect(res.statusCode).to.equal(200);
            expect(res.result).to.be.true();

            return done();
        });
    });

    it('should reject invalid payload (username) on POST path /user/registration', (done) => {

        testServer.inject({
            method: 'POST',
            url: '/user/registration',
            payload: {
                username: 'johndoe$$$',
                email: 'johndoe@gmail.com',
                password: 'password1234',
                firstname: 'john',
                surname: 'doe',
                birthdate: '1980-12-12'
            }
        }, (res) => {

            expect(testHandlerNameContainer).to.not.include(PASSED_THRU + 'registerUserHandler');
            expect(res.headers['content-type']).to.include('application/json');
            expect(res.statusCode).to.equal(400);
            expect(res.result.error).to.equal(Boom.badRequest().message);

            return done();
        });
    });

    it('should reject invalid payload (email) on POST path /user/registration', (done) => {

        testServer.inject({
            method: 'POST',
            url: '/user/registration',
            payload: {
                username: 'johndoe',
                email: 'johndoegmail.com',
                password: 'password1234',
                firstname: 'john',
                surname: 'doe',
                birthdate: '1980-12-12'
            }
        }, (res) => {

            expect(testHandlerNameContainer).to.not.include(PASSED_THRU + 'registerUserHandler');
            expect(res.headers['content-type']).to.include('application/json');
            expect(res.statusCode).to.equal(400);
            expect(res.result.error).to.equal(Boom.badRequest().message);

            return done();
        });
    });

    it('should reject invalid payload (password) on POST path /user/registration', (done) => {

        testServer.inject({
            method: 'POST',
            url: '/user/registration',
            payload: {
                username: 'johndoe',
                email: 'johndoe@gmail.com',
                password: 'password1234`~',
                firstname: 'john',
                surname: 'doe',
                birthdate: '1980-12-12'
            }
        }, (res) => {

            expect(testHandlerNameContainer).to.not.include(PASSED_THRU + 'registerUserHandler');
            expect(res.headers['content-type']).to.include('application/json');
            expect(res.statusCode).to.equal(400);
            expect(res.result.error).to.equal(Boom.badRequest().message);

            return done();
        });
    });

    it('should reject invalid payload (first name) on POST path /user/registration', (done) => {

        testServer.inject({
            method: 'POST',
            url: '/user/registration',
            payload: {
                username: 'johndoe',
                email: 'johndoegmail.com',
                password: 'password1234',
                firstname: 'j0hn$',
                surname: 'doe',
                birthdate: '1980-12-12'
            }
        }, (res) => {

            expect(testHandlerNameContainer).to.not.include(PASSED_THRU + 'registerUserHandler');
            expect(res.headers['content-type']).to.include('application/json');
            expect(res.statusCode).to.equal(400);
            expect(res.result.error).to.equal(Boom.badRequest().message);

            return done();
        });
    });

    it('should reject invalid payload (surname) on POST path /user/registration', (done) => {

        testServer.inject({
            method: 'POST',
            url: '/user/registration',
            payload: {
                username: 'johndoe',
                email: 'johndoegmail.com',
                password: 'password1234',
                firstname: 'john',
                surname: 'doe$',
                birthdate: '1980-12-12'
            }
        }, (res) => {

            expect(testHandlerNameContainer).to.not.include(PASSED_THRU + 'registerUserHandler');
            expect(res.headers['content-type']).to.include('application/json');
            expect(res.statusCode).to.equal(400);
            expect(res.result.error).to.equal(Boom.badRequest().message);

            return done();
        });
    });

    it('should reject invalid payload (birth date) on POST path /user/registration', (done) => {

        testServer.inject({
            method: 'POST',
            url: '/user/registration',
            payload: {
                username: 'johndoe',
                email: 'johndoegmail.com',
                password: 'password1234',
                firstname: 'john',
                surname: 'doe$',
                birthdate: '1980-13-12'
            }
        }, (res) => {

            expect(testHandlerNameContainer).to.not.include(PASSED_THRU + 'registerUserHandler');
            expect(res.headers['content-type']).to.include('application/json');
            expect(res.statusCode).to.equal(400);
            expect(res.result.error).to.equal(Boom.badRequest().message);

            return done();
        });
    });

    it('has GET path /user/welcome', (done) => {

        testServer.inject({
            method: 'GET',
            url: '/user/welcome'
        }, (res) => {

            expect(testHandlerNameContainer).to.include(PASSED_THRU + 'welcomeUserHandler');
            expect(res.headers['content-type']).to.include('application/json');
            expect(res.statusCode).to.equal(200);
            expect(res.result).to.be.true();

            return done();
        });
    });

    it('has GET path /user/logout', (done) => {

        testServer.inject({
            method: 'GET',
            url: '/user/logout'
        }, (res) => {

            expect(testHandlerNameContainer).to.include(PASSED_THRU + 'logoutUserHandler');
            expect(res.headers['content-type']).to.include('application/json');
            expect(res.statusCode).to.equal(200);
            expect(res.result).to.be.true();

            return done();
        });
    });
});
