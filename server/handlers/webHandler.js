/**
 * Created by Omnius on 6/26/16.
 */
'use strict';

module.exports = (route, options) => {

    return (request, reply) => {

        if (options.type === 'registration') {
            return reply.view('register');
        }

        if (options.type === 'index') {
            return reply.view('login');
        }
    };
};
