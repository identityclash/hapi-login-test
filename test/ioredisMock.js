/**
 * Created by Omnius on 23/08/2016.
 */
'use strict';

const Hoek = require('hoek');
const IoredisMultiMock = require('./ioredisMultiMock');

function IoredisMock() {

    if (!this instanceof IoredisMock) {
        return new IoredisMock();
    }

    this.status = 'connect';
    this.stringStorage = {};
    this.hashStorage = {};

}

IoredisMock.prototype.disconnect = function () {

    this.status = 'end';
};

IoredisMock.prototype.quit = function (callback) {

    delete this;

    return callback();
};

IoredisMock.prototype.connect = function (callback) {

    if (!this instanceof IoredisMock) {
        throw new Error('database does not exist');
    }

    this.status = 'connect';

    return callback();
};

IoredisMock.prototype.flushdb = function () {

    this.stringStorage = {};
    this.hashStorage = {};
};

IoredisMock.prototype.multi = function () {

    const multi = new IoredisMultiMock(this);

    return multi;
};

IoredisMock.prototype.set = function () {

    if (arguments.length === 0 || arguments.length > 3) {
        throw new Error('invalid arguments length');
    }

    const isLastArgFunc = typeof arguments[arguments.length - 1] === 'function';
    const callback = arguments[arguments.length - 1];

    if (!this.status || this.status === 'end') {
        if (isLastArgFunc) {
            return callback.call(this, new Error('database closed'));
        }

        throw new Error('database closed');
    }

    if (!(typeof arguments[0] === 'string')) {
        throw new Error('invalid arguments');
    }

    const args = Hoek.clone(arguments);

    this.stringStorage[args[0]] = args[1];

    if (isLastArgFunc) {
        return callback.call(this, null, 'OK');
    }
};

IoredisMock.prototype.get = function () {

    if (arguments.length === 0 || arguments.length > 2) {
        throw new Error('invalid arguments length');
    }

    const isLastArgFunc = typeof arguments[arguments.length - 1] === 'function';
    const callback = arguments[arguments.length - 1];

    if (!isLastArgFunc) {
        throw new Error('invalid argument callback function');
    }

    if (!this.status || this.status === 'end') {
        return callback.call(this, new Error('database closed'));
    }
    if (!(typeof arguments[0] === 'string')) {
        throw new Error('invalid arguments');
    }

    const args = Hoek.clone(Array.isArray(arguments) ? arguments[0] : arguments);
    let retval = '';

    if (Object.keys(this.hashStorage).length > 0 && this.hashStorage.hasOwnProperty(args[0])) {
        return callback.call(this, new Error('incorrect command for datatype'));
    }
    if (Object.keys(this.stringStorage).length > 0 && this.stringStorage.hasOwnProperty(args[0])) {
        retval = this.stringStorage[args[0]];
    }

    if (isLastArgFunc) {
        return callback.call(this, null, retval);
    }
};

IoredisMock.prototype.del = function () {

    if (arguments.length === 0 || arguments.length > 2) {
        throw new Error('invalid arguments length');
    }

    const isLastArgFunc = typeof arguments[arguments.length - 1] === 'function';
    const callback = arguments[arguments.length - 1];

    if (!this.status || this.status === 'end') {
        if (isLastArgFunc) {
            return callback.call(this, new Error('database closed'));
        }

        throw new Error('database closed');
    }
    if (!(typeof arguments[0] === 'string')) {
        throw new Error('invalid arguments');
    }

    const args = Hoek.clone(Array.isArray(arguments) ? arguments[0] : arguments);

    let delCount = 0;

    // must change to async parallel when multiple key deletions are implemented in server
    if (Object.keys(this.stringStorage).length > 0 && this.stringStorage.hasOwnProperty(args[0])) {
        delCount++;
        delete this.stringStorage[args[0]];
    }
    if (Object.keys(this.hashStorage).length > 0 && this.hashStorage.hasOwnProperty(args[0])) {
        delCount++;
        delete this.hashStorage[args[0]];
    }

    if (isLastArgFunc) {
        return callback.call(this, null, delCount);
    }
};

IoredisMock.prototype.hmset = function () {

    if (arguments.length === 0 || arguments.length > 3) {
        throw new Error('invalid arguments length');
    }

    const isLastArgFunc = typeof arguments[arguments.length - 1] === 'function';
    const callback = arguments[arguments.length - 1];

    if (!this.status || this.status === 'end') {
        if (isLastArgFunc) {
            return callback.call(this, new Error('database closed'));
        }

        throw new Error('database closed');
    }
    if (!(typeof arguments[0] === 'string' && typeof arguments[1] === 'object')) {
        throw new Error('invalid arguments');
    }

    const args = Hoek.clone(arguments);

    // must change when function arguments are passed an array instead of an object in the server
    this.hashStorage[args[0]] = args[1];

    if (isLastArgFunc) {
        return callback.call(this, null, 'OK');
    }
};

IoredisMock.prototype.hget = function () {

    if (arguments.length === 0 || arguments.length > 3) {
        throw new Error('invalid arguments length');
    }

    const isLastArgFunc = typeof arguments[arguments.length - 1] === 'function';
    const callback = arguments[arguments.length - 1];

    if (!isLastArgFunc) {
        throw new Error('invalid argument callback function');
    }
    if (!this.status || this.status === 'end') {
        return callback.call(this, new Error('database closed'));
    }
    if (!(typeof arguments[0] === 'string' && typeof arguments[1] === 'string')) {
        return callback.call(this, 'invalid arguments');
    }

    const args = Hoek.clone(arguments);
    const redisKey = args[0];

    let retval = '';

    if (Object.keys(this.stringStorage).length > 0 && this.stringStorage.hasOwnProperty(redisKey)) {
        return callback.call(this, new Error('incorrect command for datatype'));
    }
    if (Object.keys(this.hashStorage).length > 0 && this.hashStorage.hasOwnProperty(redisKey)
        && this.hashStorage[redisKey].hasOwnProperty(args[1])) {
        retval = this.hashStorage[redisKey][args[1]];
    }

    return callback.call(this, null, retval);
};

IoredisMock.prototype.hmget = function () {

    if (arguments.length === 0 || arguments.length > 2) {
        throw new Error('invalid arguments length');
    }

    const isLastArgFunc = typeof arguments[arguments.length - 1] === 'function';
    const callback = arguments[arguments.length - 1];

    if (!isLastArgFunc) {
        throw new Error('invalid argument callback function');
    }
    if (!this.status || this.status === 'end') {
        return callback.call(this, new Error('database closed'));
    }
    if (!Array.isArray(arguments[0])) {
        throw callback.call(this, 'invalid arguments');
    }

    const args = Hoek.clone(arguments[0]);
    const redisKey = args[0];

    const retval = [];

    if (Object.keys(this.stringStorage).length > 0 && this.stringStorage.hasOwnProperty(redisKey)) {
        return callback.call(this, new Error('incorrect command for datatype'));
    }
    if (Object.keys(this.hashStorage).length > 0 && this.hashStorage.hasOwnProperty(redisKey)) {
        const hash = this.hashStorage[redisKey];

        for (let i = 1; i < args.length; i++) {
            if (hash.hasOwnProperty(args[i])) {
                retval.push(this.hashStorage[redisKey][args[i]]);
            }
        }
    }

    return callback.call(this, null, retval);
};

IoredisMock.prototype.hgetall = function () {

    if (arguments.length === 0 || arguments.length > 2) {
        throw new Error('invalid arguments length');
    }

    const isLastArgFunc = typeof arguments[arguments.length - 1] === 'function';
    const callback = arguments[arguments.length - 1];

    if (!isLastArgFunc) {
        throw new Error('invalid argument callback function');
    }
    if (!this.status || this.status === 'end') {
        return callback.call(this, new Error('database closed'));
    }

    const args = Hoek.clone(arguments);
    const redisKey = args[0];

    let retval = {};

    if (Object.keys(this.stringStorage).length > 0 && this.stringStorage.hasOwnProperty(redisKey)) {
        return callback.call(this, new Error('incorrect command for datatype'));
    }
    if (Object.keys(this.hashStorage).length > 0 && this.hashStorage.hasOwnProperty(redisKey)) {
        retval = this.hashStorage[redisKey];
    }

    return callback.call(this, null, retval);
};

module.exports = IoredisMock;
