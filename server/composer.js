'use strict';

const Glue = require('glue');
const Manifest = require('./manifest');
const options = {
    relativeTo: __dirname
};

module.exports = Glue.compose.bind(Glue, Manifest.get('/'), options);
