/**
 * Created by Omnius on 04/09/2016.
 */
'use strict';

const ErrorContext = require(process.cwd() + '/server/helpers/errorContext');

module.exports = (request, reply) => {

    if (!request.response.isBoom) {
        return reply.continue();
    }

    const err = request.response;
    const errName = err.output.payload.error;
    const message = err.message;
    const statusCode = err.output.payload.statusCode;

    // message was customized instead of using default error name from Boom payload
    const custom = (errName !== message) ? message : ErrorContext[statusCode].custom;

    return reply.view('error', {
        h1: statusCode + ' ' + errName,
        title: statusCode + ' ' + errName,
        message: custom
    }).code(statusCode)
        .unstate('Hawk-Session-Token')
        .header('X-Permitted-Cross-Domain-Policies', 'master-only');
};
