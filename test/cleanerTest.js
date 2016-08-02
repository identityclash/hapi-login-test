/**
 * Created by Omnius on 18/07/2016.
 */
'use strict';

const Async = require('async');
const Code = require('code');
const Lab = require('lab');
const Fakeredis = require('fakeredis');
const Sinon = require('sinon');

const cleaner = require(process.cwd() + '/server/cleaner');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const before = lab.before;
const beforeEach = lab.beforeEach;
const after = lab.after;
const afterEach = lab.afterEach;
const it = lab.it;

let redis;

before((done) => {

    redis = Fakeredis.createClient();
    return done();
});

after((done) => {

    return done();
});

describe('server/cleaner', () => {

    beforeEach((done) => {

        Async.parallel([
            (cb) => {
                redis.set('userCredential:user1', 'user1', () => {
                    return cb();
                });
            },
            (cb) => {
                redis.set('userCredential:user2', 'user2', () => {
                    return cb();
                });
            },
            (cb) => {
                redis.set('userCredential:user3', 'user3', () => {
                    return cb();
                });
            }
        ], () => {
            return done();
        });
    });

    afterEach((done) => {

        redis.flushdb(() => {

            return done();
        });
    });

    it('deletes stored user credentials stored in the database', (done) => {

        cleaner.cleanUp(redis, () => {

            redis.keys('userCredential:*', (err, val) => {

                if (err) {
                    throw err;
                }

                expect(val).to.be.empty();
                return done();
            });
        });
    });

    it('returns error when an error occurs during retrieval of keys', (done) => {

        const stub = Sinon.stub(redis, 'keys').yields('error');

        cleaner.cleanUp(redis, (err) => {

            expect(err).to.be.equals('error');
            stub.restore();
            return done();
        });
    });

    it('returns error when an error occurs during actual deletion of a key', (done) => {

        const stub = Sinon.stub(redis, 'del').yields('error');

        cleaner.cleanUp(redis, (err) => {

            expect(err).to.be.equals('error');
            stub.restore();

            return done();
        });
    });
});
