'use strict';

const Boom = require('boom');

module.exports = (route, options) => {

    options.type = options.type || 'notfound';

    return (request, reply) => {

        if (options.type === 'notfound') {
            return reply(Boom.notFound('Page Not Found'));
        }
    };
};
