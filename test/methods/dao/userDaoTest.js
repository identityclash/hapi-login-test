/**
 * Created by Omnius on 21/08/2016.
 */
'use strict';

const Code = require('code');
const Lab = require('lab');

const IoredisMock = require(process.cwd() + '/test/ioredisMock');
const UserDao = require(process.cwd() + '/server/methods/dao/userDao');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const before = lab.before;
const beforeEach = lab.beforeEach;
const after = lab.after;
const afterEach = lab.afterEach;
const describe = lab.describe;
const it = lab.it;

const user = {
    id: '1',
    email: 'johndoe@gmail.com',
    username: 'johndoe',
    hashedPw: 'heresthehashedpw',
    realm: 'myrealm'
};

let redis;

describe('server/methods/dao/userDao', () => {

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

    describe('createUser', () => {

        it('can save user information', (done) => {

            UserDao.createUser(redis, user, (err) => {

                expect(err).to.be.null();

                redis.hgetall('user:' + user.id, (err, results) => {

                    expect(err).to.be.null();
                    expect(results).to.equal(user);

                    redis.get('userId:' + user.email, (err, results) => {

                        expect(err).to.be.null();
                        expect(results).to.equal(user.id);

                        redis.get('userId:' + user.username, (err, results) => {

                            expect(err).to.be.null();
                            expect(results).to.equal(user.id);

                            return done();
                        });
                    });
                });
            });
        });

        it('will return error when user is a boolean', (done) => {

            UserDao.createUser(redis, true, (err) => {

                expect(err).to.equal('invalid or incomplete user information');

                return done();
            });
        });

        it('will return error when user is a string', (done) => {

            UserDao.createUser(redis, 'johndoe', (err) => {

                expect(err).to.equal('invalid or incomplete user information');

                return done();
            });
        });

        it('will return error when user is a number', (done) => {

            UserDao.createUser(redis, 2, (err) => {

                expect(err).to.equal('invalid or incomplete user information');

                return done();
            });
        });

        it('will return error when user does not exist', (done) => {

            UserDao.createUser(redis, null, (err) => {

                expect(err).to.equal('invalid or incomplete user information');

                return done();
            });
        });

        it('will return error when user information is empty', (done) => {

            UserDao.createUser(redis, {}, (err) => {

                expect(err).to.equal('invalid or incomplete user information');

                return done();
            });
        });

        it('will return error when user does not have an id', (done) => {

            UserDao.createUser(redis, {
                username: user.username,
                email: user.email
            }, (err) => {

                expect(err).to.equal('invalid or incomplete user information');

                return done();
            });
        });

        it('will return error when user does not have an email', (done) => {

            UserDao.createUser(redis, {
                id: user.id,
                username: user.username
            }, (err) => {

                expect(err).to.equal('invalid or incomplete user information');

                return done();
            });
        });

        it('will return error when user does not have a username', (done) => {

            UserDao.createUser(redis, {
                id: user.id,
                email: user.email
            }, (err) => {

                expect(err).to.equal('invalid or incomplete user information');

                return done();
            });
        });

        it('will return error during database issues', (done) => {

            redis.disconnect();

            UserDao.createUser(redis, user, (err) => {

                expect(err).to.not.be.null();

                return done();
            });
        });
    });

    describe('readUserId', () => {

        beforeEach((done) => {

            redis.set('userId:' + user.username, user.id);
            redis.set('userId:' + user.email, user.id);

            return done();
        });

        it('can read user id given the username or email', (done) => {

            UserDao.readUserId(redis, user.username, (err, result) => {

                expect(err).to.be.null();
                expect(result).to.equal(user.id);

                UserDao.readUserId(redis, user.email, (err, result) => {

                    expect(err).to.be.null();
                    expect(result).to.equal(user.id);

                    return done();
                });
            });
        });

        it('will return error when the username or email is a boolean', (done) => {

            UserDao.readUserId(redis, true, (err) => {

                expect(err).to.equal('invalid username or email');

                return done();
            });
        });

        it('will return error when the username or email is a number', (done) => {

            UserDao.readUserId(redis, 2, (err) => {

                expect(err).to.equal('invalid username or email');

                return done();
            });
        });

        it('will return error when the username or email is an object', (done) => {

            UserDao.readUserId(redis, user, (err) => {

                expect(err).to.equal('invalid username or email');

                return done();
            });
        });

        it('will return error when the username or email does not exist', (done) => {

            UserDao.readUserId(redis, null, (err) => {

                expect(err).to.equal('invalid username or email');

                return done();
            });
        });

        it('will return error during database issues', (done) => {

            redis.disconnect();

            UserDao.readUserId(redis, user.email, (err) => {

                expect(err).to.be.not.null();

                return done();
            });
        });
    });

    describe('readUsername', () => {

        beforeEach((done) => {

            redis.hmset('user:' + user.id, user);

            return done();
        });

        it('can read username given the user id', (done) => {

            UserDao.readUsername(redis, user.id, (err, result) => {

                expect(err).to.be.null();
                expect(result).to.equal(user.username);

                return done();
            });
        });

        it('will return error when the user id is a boolean', (done) => {

            UserDao.readUsername(redis, true, (err) => {

                expect(err).to.be.not.null();

                return done();
            });
        });

        it('will return error when the user id is a number', (done) => {

            UserDao.readUsername(redis, 2, (err) => {

                expect(err).to.equal('invalid user id');

                return done();
            });
        });

        it('will return error when the user id is an object', (done) => {

            UserDao.readUsername(redis, user, (err) => {

                expect(err).to.equal('invalid user id');

                return done();
            });
        });

        it('will return error when the user id does not exist', (done) => {

            UserDao.readUsername(redis, null, (err) => {

                expect(err).to.equal('invalid user id');

                return done();
            });
        });

        it('will return error during database issues', (done) => {

            redis.disconnect();

            UserDao.readUsername(redis, user.id, (err) => {

                expect(err).to.be.not.null();

                return done();
            });
        });
    });

    describe('readUserHashAndRealm', () => {

        beforeEach((done) => {

            redis.hmset('user:' + user.id, user);

            return done();
        });

        it('can read user\'s hashed password and realm given the id', (done) => {

            UserDao.readUserHashAndRealm(redis, user.id, (err, result) => {

                expect(err).to.be.null();
                expect(result).to.equal([user.hashedPw, user.realm]);

                return done();
            });
        });

        it('will return error when user id is a boolean', (done) => {

            UserDao.readUserHashAndRealm(redis, true, (err) => {

                expect(err).to.equal('invalid user id');

                return done();
            });
        });

        it('will return error when user id is a number', (done) => {

            UserDao.readUserHashAndRealm(redis, 2, (err) => {

                expect(err).to.equal('invalid user id');

                return done();
            });
        });

        it('will return error when user id is an object', (done) => {

            UserDao.readUserHashAndRealm(redis, 2, (err) => {

                expect(err).to.equal('invalid user id');

                return done();
            });
        });

        it('will return error when user id does not exist', (done) => {

            UserDao.readUserHashAndRealm(redis, null, (err) => {

                expect(err).to.equal('invalid user id');

                return done();
            });
        });

        it('will return error during database issues', (done) => {

            redis.disconnect();

            UserDao.readUserHashAndRealm(redis, user.id, (err) => {

                expect(err).to.be.not.null();

                return done();
            });
        });
    });
});
