/**
 * Created by Omnius on 6/26/16.
 */
'use strict';

const _ = require('lodash/core');
const Boom = require('boom');

const ErrorContext = require('../helpers/errorContext');

module.exports = (route, options) => {

    return function (request, reply) {

        const clientToken = request.state['Hawk-Session-Token'];
        const statusCode = request.params.statusCode;
        const type = options.type;

        if (clientToken && clientToken.hawkSessionToken) {
            return reply.redirect(`/user/${clientToken.userId}/welcome`);
        }

        if (type === 'registration') {
            return reply.view('registration')
                .header('X-Permitted-Cross-Domain-Policies', 'master-only');
        }

        if (type === 'index') {
            return reply.view('login')
                .header('X-Permitted-Cross-Domain-Policies', 'master-only');
        }

        if (type === 'error') {
            const boom = _.isEmpty(ErrorContext[statusCode])
                ? Boom.internal()
                : ErrorContext[statusCode].boom;

            return reply(boom);
        }

        return reply.continue();
    };
};
