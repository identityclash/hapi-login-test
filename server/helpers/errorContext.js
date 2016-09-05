/**
 * Created by Omnius on 05/09/2016.
 */
'use strict';

const Boom = require('boom');

module.exports = {
    400: {
        boom: Boom.badRequest(),
        custom: 'Invalid or unrecognized fields or attributes.'
    },
    401: {
        boom: Boom.unauthorized(),
        custom: 'You are not authorized to view this resource.'
    },
    403: {
        boom: Boom.forbidden(),
        custom: 'You are forbidden from accessing the resource.'
    },
    404: {
        boom: Boom.notFound(),
        custom: 'The resource you are looking for does not exist.'
    },
    500: {
        boom: Boom.internal(),
        custom: 'Sorry, but the server has encountered an error.'
    }
};
