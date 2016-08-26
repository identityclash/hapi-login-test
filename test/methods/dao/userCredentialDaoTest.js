/**
 * Created by Omnius on 21/08/2016.
 */
'use strict';

const Code = require('code');
// const Ioredis = require('ioredis');
const Lab = require('lab');

const IoredisMock = require(process.cwd() + '/test/ioredisMock');
const UserCredentialDao = require(process.cwd() + '/server/methods/dao/userCredentialDao');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const before = lab.before;
const after = lab.after;
const afterEach = lab.afterEach;
const describe = lab.describe;
const it = lab.it;

const userCredential = {
    hawkSessionToken: 'c95ba24c6d77d14fdebbb2c5b533042640c8dc0f4c324ec3497a1344f269979f',
    userId: '23437ebd-703b-438a-83b3-2397556f6398',
    id: 'ed169d0c7d28a9a5973c45cd3ad2a37ba7b363743899e31baaa159f1289dc36a',
    key: 'd3917adf3716476d5c07f3612bcf2f47de3f912c4dcc24f9ea581d31b127c7c8',
    algorithm: 'sha256'
};

// const REDIS_DB = 8;

let redis;

describe('server/methods/dao/userCredentialDao', () => {

    before((done) => {

        // redis = new Ioredis('redis://127.0.0.1:6379', {
        //     showFriendlyErrorStack: true
        // });

        // redis.select(REDIS_DB);

        redis = new IoredisMock();

        return done();
    });

    after((done) => {

        if (['connect', 'ready'].indexOf(redis.status) > -1) {
            redis.quit(() => {

                return done();
            });
        }
    });

    afterEach((done) => {

        if (['connect', 'ready'].indexOf(redis.status) > -1) {
            redis.flushdb();
        }
        if (redis.status !== 'end') {
            return done();
        }

        /* ensure reconnection after certain intentional disconnections in tests */
        redis.connect(() => {

            // redis.select(REDIS_DB);
            return done();
        });
    });

    describe('createUserCredential', () => {

        it('can create user credentials', (done) => {

            UserCredentialDao.createUserCredential(redis, userCredential.id, userCredential, (err) => {

                expect(err).to.be.null();

                redis.hgetall('userCredential:' + userCredential.id, (err, result) => {

                    expect(err).to.be.null();
                    expect(result).to.equal(userCredential);

                    return done();
                });
            });
        });

        it('will return error when token is a boolean', (done) => {

            UserCredentialDao.createUserCredential(redis, true, userCredential, (err) => {

                expect(err).to.equal('invalid token');

                return done();
            });
        });

        it('will return error when token is an object', (done) => {

            UserCredentialDao.createUserCredential(redis, userCredential, userCredential, (err) => {

                expect(err).to.equal('invalid token');

                return done();
            });
        });

        it('will return error when token is a number', (done) => {

            UserCredentialDao.createUserCredential(redis, 1, userCredential, (err) => {

                expect(err).to.equal('invalid token');

                return done();
            });
        });

        it('will return error when token does not exist', (done) => {

            UserCredentialDao.createUserCredential(redis, null, userCredential, (err) => {

                expect(err).to.equal('invalid token');

                return done();
            });
        });

        it('will return error when credentials are empty', (done) => {

            UserCredentialDao.createUserCredential(redis, userCredential.id, {}, (err) => {

                expect(err).to.equal('invalid credentials');

                return done();
            });
        });

        it('will return error when credentials are a boolean', (done) => {

            UserCredentialDao.createUserCredential(redis, userCredential.id, true, (err) => {

                expect(err).to.equal('invalid credentials');

                return done();
            });
        });

        it('will return error when credentials are a number', (done) => {

            UserCredentialDao.createUserCredential(redis, userCredential.id, 1, (err) => {

                expect(err).to.equal('invalid credentials');

                return done();
            });
        });

        it('will return error when credentials do not exist', (done) => {

            UserCredentialDao.createUserCredential(redis, userCredential.id, null, (err) => {

                expect(err).to.equal('invalid credentials');

                return done();
            });
        });

        it('will return error during database issues', (done) => {

            redis.disconnect();

            UserCredentialDao.createUserCredential(redis, userCredential.id, userCredential, (err) => {

                expect(err).to.not.be.null();

                return done();
            });
        });
    });

    describe('readUserCredential', () => {

        before((done) => {

            redis.hmset('userCredential:' + userCredential.id, userCredential, () => {

                return done();
            });
        });

        it('can read user credentials', (done) => {

            UserCredentialDao.readUserCredential(redis, userCredential.id, (err, results) => {

                expect(err).to.be.null();
                expect(results).to.equal(userCredential);

                return done();
            });
        });

        it('will return error when token is a boolean', (done) => {

            UserCredentialDao.readUserCredential(redis, true, (err) => {

                expect(err).to.equal('invalid token');

                return done();
            });
        });

        it('will return error when token is an object', (done) => {

            UserCredentialDao.readUserCredential(redis, {}, (err) => {

                expect(err).to.equal('invalid token');

                return done();
            });
        });

        it('will return error when token is a number', (done) => {

            UserCredentialDao.readUserCredential(redis, 1, (err) => {

                expect(err).to.equal('invalid token');

                return done();
            });
        });

        it('will return error when token does not exist', (done) => {

            UserCredentialDao.readUserCredential(redis, null, (err) => {

                expect(err).to.equal('invalid token');

                return done();
            });
        });

        it('will return error during database issues', (done) => {

            redis.disconnect();

            UserCredentialDao.readUserCredential(redis, userCredential.id, (err) => {

                expect(err).to.not.be.null();

                return done();
            });
        });
    });

    describe('deleteUserCredential', () => {

        before((done) => {

            redis.hmset('userCredential:' + userCredential.id, userCredential, () => {

                return done();
            });
        });

        it('can delete user credentials', (done) => {

            UserCredentialDao.deleteUserCredential(redis, userCredential.id, (err) => {

                expect(err).to.be.null();

                redis.hgetall('userCredential:' + userCredential.id, (err, credentials) => {

                    expect(err).to.be.null();
                    expect(credentials).to.be.empty();

                    return done();
                });
            });
        });

        it('will return error when token is a boolean', (done) => {

            UserCredentialDao.deleteUserCredential(redis, true, (err) => {

                expect(err).to.equal('invalid token');

                return done();
            });
        });

        it('will return error when token is an object', (done) => {

            UserCredentialDao.deleteUserCredential(redis, userCredential, (err) => {

                expect(err).to.equal('invalid token');

                return done();
            });
        });

        it('will return error when token is a number', (done) => {

            UserCredentialDao.deleteUserCredential(redis, 1, (err) => {

                expect(err).to.equal('invalid token');

                return done();
            });
        });

        it('will return error when token does not exist', (done) => {

            UserCredentialDao.deleteUserCredential(redis, null, (err) => {

                expect(err).to.equal('invalid token');

                return done();
            });
        });

        it('will return error during database issues', (done) => {

            redis.disconnect();

            UserCredentialDao.deleteUserCredential(redis, userCredential.id, (err) => {

                expect(err).to.not.be.null();

                return done();
            });
        });
    });
});
