/**
 * Created by Omnius on 6/15/16.
 */
'use strict';

const validate = require('./basicValidation').validate;

exports.register = (server, options, next) => {

    server.auth.strategy('basic-login-auth-strategy', 'basic', {
        validateFunc: validate,
        unauthorizedAttributes: {
            realm: 'My Realm',
            charset: 'UTF-8'
        }
    });

    next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};
