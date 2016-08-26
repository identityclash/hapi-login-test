/**
 * Created by Omnius on 24/08/2016.
 */
'use strict';

const Async = require('async');

function IoredisMultiMock(client) {

    if (!this instanceof IoredisMultiMock) {
        return new IoredisMultiMock(client);
    }

    this.client = client;
    this.queue = [];
}

IoredisMultiMock.prototype.set = function () {

    // if (arguments.length === 0) {
    //     throw new Error('invalid arguments length');
    // }
    // if (!this.client.status || this.client.status === 'end') {
    //     throw new Error('database closed');
    // }

    if (Array.isArray(this.queue)) {
        this.queue.push({
            set: [...arguments]
        });
    }

    return this;
};

IoredisMultiMock.prototype.get = function () {

    // if (arguments.length === 0 || arguments.length > 1) {
    //     throw new Error('invalid arguments length');
    // }
    // if (!this.client.status || this.client.status === 'end') {
    //     throw new Error('database closed');
    // }

    if (Array.isArray(this.queue)) {
        this.queue.push({
            get: [...arguments]
        });
    }

    return this;
};

IoredisMultiMock.prototype.hmset = function () {

    // if (arguments.length === 0 || arguments.length > 2) {
    //     throw new Error('invalid arguments length');
    // }
    // if (!this.client.status || this.client.status === 'end') {
    //     throw new Error('database closed');
    // }

    if (Array.isArray(this.queue)) {
        this.queue.push({
            hmset: [...arguments]
        });
    }

    return this;
};

IoredisMultiMock.prototype.exec = function (callback) {

    if (arguments.length === 0) {
        throw new Error('invalid argument callback function');
    }
    if (!this.client.status || this.client.status === 'end') {
        return callback(new Error('database closed'));
    }
    if (this.queue && this.queue.length === 0) {
        return callback(null, []);
    }

    const client = this.client;

    Async.mapSeries(this.queue, function (item, cb) {

        const key = Object.keys(item)[0];

        if (key === undefined) {
            return cb();
        }

        item[key].push((err, result) => {

            return cb(err, result);
        });

        client[key].apply(client, item[key]);

    }, (err, result) => {

        this.queue = null;

        return callback(err, result);
    });
};

if (module.exports) {
    module.exports = IoredisMultiMock;
}
