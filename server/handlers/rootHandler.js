/**
 * Created by Omnius on 18/07/2016.
 */
'use strict';

module.exports = (route, options) => {

    options.type = options.type || 'notfound';

    return (request, reply) => {

        if (options.type === 'index') {
            return reply.redirect('/login');
        }
        if (options.type === 'notfound') {
            return reply.view('error', {
                title: '404 - Page Not Found',
                h1: '404 - Page Not Found',
                message: 'The resource you are looking for does not exist.'
            }).code(404);
        }

        return reply.continue();
    };
};
