/**
 * Created by Omnius on 23/08/2016.
 */
'use strict';

const Code = require('code');
const Lab = require('lab');

const LoginUserHandler = require(process.cwd() + '/server/handlers/loginUserHandler');
const TestServer = require(process.cwd() + '/test/testServer');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;

const testServer = new TestServer();

const testScheme = () => {

    return {
        authenticate: (request, reply) => {

            return reply.continue({
                credentials: {
                    userId: 'johndoe',
                    algorithm: 'sha256',
                    hawkSessionToken: 'abcdef1234567890'
                }
            });
        }
    };
};

testServer.auth.scheme('testScheme', testScheme);
testServer.auth.strategy('testStrategy', 'testScheme');

testServer.handler('loginUserHandler', LoginUserHandler);

testServer.route([
    {
        path: '/',
        method: 'GET',
        config: {
            auth: 'testStrategy',
            handler: {
                loginUserHandler: {}
            }
        }
    }
]);

describe('server/handlers/loginUserHandler', () => {

    it('handles successful setting of session cookie upon authenticated login', (done) => {

        testServer.inject({
            method: 'GET',
            url: '/'
        }, (res) => {

            expect(res.statusCode).to.equal(200);
            expect(res.headers['x-permitted-cross-domain-policies']).to.equal('master-only');

            let cookie;

            for (let i = 0; i < res.headers['set-cookie'].length; i++) {
                if (res.headers['set-cookie'][i].indexOf('Hawk-Session-Token') > -1) {
                    cookie = res.headers['set-cookie'][i];
                    break;
                }
            }

            expect(cookie).to.contain('Hawk-Session-Token');
            expect(res.result.toLowerCase()).to.contain('successful login');

            return done();
        });
    });
});
