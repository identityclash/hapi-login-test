/**
 * Created by Omnius on 18/07/2016.
 */
'use strict';

const Boom = require('boom');

module.exports = (route, options) => {

    options.type = options.type || 'notfound';

    return (request, reply) => {

        if (options.type === 'index') {
            return reply.redirect('/login');
        }
        if (options.type === 'notfound') {
            return reply(Boom.notFound('Page Not Found'));
        }
    };
};
