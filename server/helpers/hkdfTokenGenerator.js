/**
 * Created by Omnius on 6/23/16.
 *
 * This file is based on Mozilla's implementation of the Hawk middleware factory for Express in the following
 * repository:
 * https://github.com/mozilla-services/express-hawkauth
 */
'use strict';

const Crypto = require('crypto');
const Hkdf = require('hkdf');

const internals = {};

/**
 *
 * @param namespace
 * @param salt
 * @param callback
 */
exports.generateToken = (namespace, salt, callback) => {

    const token = Crypto.randomBytes(32).toString('hex');

    exports.retrieveFromToken(token, namespace, salt, 2 * 32, (id, key) => {
        return callback(id, key, token);
    });
};

/**
 *
 * @param token
 * @param namespace
 * @param salt
 * @param length
 * @param cb
 */
exports.retrieveFromToken = (token, namespace, salt, length, cb) => {

    const data = new Buffer(token, 'hex');

    internals.applyHkdf(data, namespace, salt, length, (keyMaterial) => {

        const tokenId = keyMaterial.slice(0, 32).toString('hex');
        const authKey = keyMaterial.slice(32, 64).toString('hex');

        return cb(tokenId, authKey);
    });
};

internals.kw = function (namespace) {
    return new Buffer(namespace);
};

internals.applyHkdf = function (km, info, salt, len, callback) {
    const df = new Hkdf('sha256', salt, km);
    df.derive(internals.kw(info), len, callback);
};
