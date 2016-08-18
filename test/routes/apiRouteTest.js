/**
 * Created by Omnius on 01/08/2016.
 */
'use strict';

const Async = require('async');
const Boom = require('boom');
const Code = require('code');
const Lab = require('lab');

const ApiRoute = require(process.cwd() + '/server/routes/apiRoute');
const TestServer = require('../testServer');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const afterEach = lab.afterEach;
const describe = lab.describe;
const it = lab.it;

const HANDLER_NAMES = ['loginUserHandler', 'registerUserHandler'];
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

testServer.handler('retrieveUserProfileHandler', () => {

    return (request, reply) => {

        if (HANDLER_NAMES.indexOf('retrieveUserProfileHandler') >= 0
            && testHandlerNameContainer.indexOf('retrieveUserProfileHandler') < 0) {
            testHandlerNameContainer.push(PASSED_THRU + 'retrieveUserProfileHandler');
        }

        return reply({
            userId: request.params.userId
        });
    };
});

testServer.route(ApiRoute);

describe('server/routes/apiRoute', () => {

    afterEach((done) => {

        testHandlerNameContainer = [];
        return done();
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

    it('has GET path /user/1657c7fa-20b3-475e-b1ea-7bc77ac93ad3/profile', (done) => {

        testServer.inject({
            method: 'GET',
            url: '/user/1657c7fa-20b3-475e-b1ea-7bc77ac93ad3/profile'
        }, (res) => {

            expect(res.statusCode).to.equal(200);
            expect(res.headers['content-type']).to.include('application/json');
            expect(res.result).to.equal({
                userId: '1657c7fa-20b3-475e-b1ea-7bc77ac93ad3'
            });

            return done();
        });
    });

    it('has GET path /auth/basic', (done) => {

        testServer.inject({
            method: 'GET',
            url: '/auth/basic'
        }, (res) => {

            expect(res.statusCode).to.equal(200);
            expect(res.headers['content-type']).to.include('application/json');
            expect(res.result).to.equal(true);

            return done();
        });
    });
});
