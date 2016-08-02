/**
 * Created by Omnius on 01/08/2016.
 */
'use strict';

const Code = require('code');
const Lab = require('lab');

const ApiRoute = require(process.cwd() + '/server/routes/apiRoute');
const TestServer = require('../testServer');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;

const testServer = new TestServer();

const testScheme = () => {

    return {
        authenticate: (request, reply) => {

            return reply.continue({credentials: {}});
        }
    };
};

testServer.auth.scheme('hawk', testScheme);
testServer.auth.strategy('hawk-login-auth-strategy', 'hawk');

testServer.handler('retrieveUserProfileHandler', () => {

    return (request, reply) => {

        return reply({
            userId: request.params.userId
        });
    };
});

testServer.route(ApiRoute);

describe('server/routes/apiRoute', () => {

    it('has GET on path /user/1657c7fa-20b3-475e-b1ea-7bc77ac93ad3/profile', (done) => {

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
});
