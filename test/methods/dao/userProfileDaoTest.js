/**
 * Created by Omnius on 21/08/2016.
 */
'use strict';

const Code = require('code');
const Lab = require('lab');

const IoredisMock = require(process.cwd() + '/test/ioredisMock');
const UserProfileDao = require(process.cwd() + '/server/methods/dao/userProfileDao');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const before = lab.before;
const after = lab.after;
const afterEach = lab.afterEach;
const describe = lab.describe;
const it = lab.it;

const userProfile = {
    id: '1',
    firstName: 'John',
    surname: 'Doe'
};

let redis;

describe('server/methods/dao/userProfileDao', () => {

    before((done) => {

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

            return done();
        });
    });

    describe('createUserProfile', () => {

        it('can create user profile', (done) => {

            UserProfileDao.createUserProfile(redis, userProfile.id, userProfile, (err) => {

                expect(err).to.be.null();

                redis.hgetall('userProfile:' + userProfile.id, (err, result) => {

                    expect(err).to.be.null();
                    expect(result).to.equal(userProfile);

                    return done();
                });
            });
        });

        it('will return error when user id is a boolean', (done) => {

            UserProfileDao.createUserProfile(redis, true, userProfile, (err) => {

                expect(err).to.equal('invalid user id');

                return done();
            });
        });

        it('will return error when user id is an object', (done) => {

            UserProfileDao.createUserProfile(redis, userProfile, userProfile, (err) => {

                expect(err).to.equal('invalid user id');

                return done();
            });
        });

        it('will return error when user id is a number', (done) => {

            UserProfileDao.createUserProfile(redis, 1, userProfile, (err) => {

                expect(err).to.equal('invalid user id');

                return done();
            });
        });

        it('will return error when user id does not exist', (done) => {

            UserProfileDao.createUserProfile(redis, null, userProfile, (err) => {

                expect(err).to.equal('invalid user id');

                return done();
            });
        });

        it('will return error when profile are empty', (done) => {

            UserProfileDao.createUserProfile(redis, userProfile.id, {}, (err) => {

                expect(err).to.equal('invalid profile');

                return done();
            });
        });

        it('will return error when profile are a boolean', (done) => {

            UserProfileDao.createUserProfile(redis, userProfile.id, true, (err) => {

                expect(err).to.equal('invalid profile');

                return done();
            });
        });

        it('will return error when profile are a number', (done) => {

            UserProfileDao.createUserProfile(redis, userProfile.id, 1, (err) => {

                expect(err).to.equal('invalid profile');

                return done();
            });
        });

        it('will return error when profile do not exist', (done) => {

            UserProfileDao.createUserProfile(redis, userProfile.id, null, (err) => {

                expect(err).to.equal('invalid profile');

                return done();
            });
        });

        it('will return error during database issues', (done) => {

            redis.disconnect();

            UserProfileDao.createUserProfile(redis, userProfile.id, userProfile, (err) => {

                expect(err).to.not.be.null();

                return done();
            });
        });
    });

    describe('readUserProfile', () => {

        before((done) => {

            redis.hmset('userProfile:' + userProfile.id, userProfile, () => {

                return done();
            });
        });

        it('can read user profile', (done) => {

            UserProfileDao.readUserProfile(redis, userProfile.id, (err, results) => {

                expect(err).to.be.null();
                expect(results).to.equal(userProfile);

                return done();
            });
        });

        it('will return error when token is a boolean', (done) => {

            UserProfileDao.readUserProfile(redis, true, (err) => {

                expect(err).to.equal('invalid user id');

                return done();
            });
        });

        it('will return error when token is an object', (done) => {

            UserProfileDao.readUserProfile(redis, {}, (err) => {

                expect(err).to.equal('invalid user id');

                return done();
            });
        });

        it('will return error when token is a number', (done) => {

            UserProfileDao.readUserProfile(redis, 1, (err) => {

                expect(err).to.equal('invalid user id');

                return done();
            });
        });

        it('will return error when token does not exist', (done) => {

            UserProfileDao.readUserProfile(redis, null, (err) => {

                expect(err).to.equal('invalid user id');

                return done();
            });
        });

        it('will return error during database issues', (done) => {

            redis.disconnect();

            UserProfileDao.readUserProfile(redis, userProfile.id, (err) => {

                expect(err).to.not.be.null();

                return done();
            });
        });
    });
});
