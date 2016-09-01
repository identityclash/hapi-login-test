# Hapi-Login-Test

[Demo](https://hapi-login-test.herokuapp.com) login functionality using [Hapi](https://github.com/hapijs/hapi), basic authentication and Hawk authentication schemes, and [Redis](https://github.com/antirez/redis) for persistence. The interface is taken from [Bootstrap](https://getbootstrap.com/examples/signin/)'s sign-in sample form. The Hawk implementation used here is based on Mozilla Services' Hawk authentication [middleware](https://github.com/mozilla-services/express-hawkauth) for [Express](https://github.com/expressjs/express).

[![Build Status](https://travis-ci.org/identityclash/hapi-login-test.svg?branch=master)](https://travis-ci.org/identityclash/hapi-login-test)[![Coverage Status](https://coveralls.io/repos/github/identityclash/hapi-login-test/badge.svg?branch=master)](https://coveralls.io/github/identityclash/hapi-login-test?branch=master)

```
$ git clone https://github.com/identityclash/hapi-login-test.git && cd hapi-login-test
$ npm install            # download dependencies
$ npm start              # run server
$ npm test               # run test script
```

## Tools (in Alphabetical Order)
### [Hapi](https://github.com/hapijs/hapi)-Specific
* [Acquaint](https://github.com/genediazjr/acquaint) - Routes, handlers, and methods auto-loader
* [Blankie](https://github.com/nlf/blankie) - Plugin for customization of Content Security Policies (CSP)
* [Boom](https://github.com/hapijs/boom) - HTTP-friendly error objects
* [Confidence](https://github.com/hapijs/confidence) - JSON-based configuration document format and API
* [Crumb](https://github.com/hapijs/crumb) - Plugin for cross-site request forgery (CSRF) protection using random unique token (crumb)
* [Cryptiles](https://github.com/hapijs/cryptiles) - General utilities for cryptography
* [Disinfect](https://github.com/genediazjr/Disinfect) - Plugin for sanitizing request params, query, and payload
* [Glue](https://github.com/hapijs/glue) - Configuration based composition of the server
* [Good](https://github.com/hapijs/good) - Plugin for process monitoring
* [Good-Console](https://github.com/hapijs/good-console) - Console reporting for Good server events
* [Good-Squeeze](https://github.com/hapijs/good-squeeze) - Simple transform streams useful in creating Good data pipelines
* [Handlerbars](https://github.com/wycats/handlebars.js) - Semantic templating for view; an extension of [Mustache](https://github.com/mustache/mustache.github.com)
* [Hapi-Auth-Basic](https://github.com/identityclash/hapi-auth-basic) - Plugin for HTTP basic authentication scheme based on [RFC 2617](https://www.ietf.org/rfc/rfc2617.txt); a forked implementation of [Hapi-Auth-Basic](https://github.com/hapijs/hapi-auth-basic) for supporting custom "Authenticate" header response to prevent auth. challenge popup in browser
* [Hapi-Auth-Hawk](https://github.com/hapijs/hapi-auth-hawk) - Hawk authentication plugin
* [Hapi-Ioredis](https://github.com/cilindrox/hapi-ioredis) - [Ioredis](https://github.com/luin/ioredis) plugin
* [Hoek](https://github.com/hapijs/hoek) - Utility methods
* [Inert](https://github.com/hapijs/inert) - Static file and directory handlers
* [Scooter](https://github.com/hapijs/scooter) - User-agent information plugin
* [Vision](https://github.com/hapijs/vision) - Templates rendering support
* [Visionary](https://github.com/hapijs/visionary) - Views loader plugin

### General JavaScript
* [Async](https://github.com/caolan/async) - Utilities on asynchronous functions in JavaScript
* [BcryptJS](https://github.com/dcodeIO/bcrypt.js) - Utilities for hashing in JavaScript
* [Browserify](https://github.com/substack/node-browserify) - Allows require('modules') in the browser by bundling up all dependencies
* [Fakeredis](https://github.com/hdachev/fakeredis) - Fake implementation of Redis for testing purposes
* [HKDF](https://github.com/benadida/node-hkdf) - HKDF key-derivation function implementation based on [RFC 5869](https://tools.ietf.org/html/rfc5869) for NodeJS
* [Hawk](https://github.com/hueniverse/hawk) - HTTP Holder-Of-Key Authentication Scheme
* [Iron](https://github.com/hueniverse/iron) - Cryptographic utility for sealing a JSON object using symmetric key encryption with message integrity verification
* [jQuery](https://github.com/jquery/jquery) - Library for HTML document traversal and manipulation, event handling, animation, and AJAX
* [JSON-Stringify-Safe](https://github.com/isaacs/json-stringify-safe) - JSON.stringify but silently protects against circular references
* [Lodash](https://github.com/lodash/lodash) - Utility library for JavaScript working with iterating arrays, objects, & strings; manipulating & testing values; and creating composite functions
* [Redis](https://github.com/antirez/redis) - Key-value in-memory database that persists on disk
* [Request](https://github.com/request/request) - Simplified HTTP request client
* [UUID](https://github.com/defunctzombie/node-uuid) - Generate RFC-compliant UUIDs in JavaScript; a forked implementation of [Node UUID](https://github.com/broofa/node-uuid)
