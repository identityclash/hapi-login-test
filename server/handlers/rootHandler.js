/**
 * Created by Omnius on 18/07/2016.
 */
'use strict';

const errors = require(process.cwd() + '/server/helpers/errorPageContext');

module.exports = (route, options) => {

    options.type = options.type || 'notfound';

    return (request, reply) => {

        const clientToken = request.state['Hawk-Session-Token'];

        if (clientToken && clientToken.hawkSessionToken) {
            return reply.redirect(`/user/${clientToken.userId}/welcome`);
        }

        if (options.type === 'index') {
            return reply.redirect('/login');
        }

        if (options.type === 'notfound') {
            return reply.view('error', errors[404]).code(404);
        }

        return reply.continue();
    };
};
