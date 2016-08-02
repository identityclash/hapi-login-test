/**
 * Created by Omnius on 18/07/2016.
 */
'use strict';

const Code = require('code');
const Lab = require('lab');

const Manifest = require('../server/manifest');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;

describe('server/manifest', () => {

    it('gets manifest data', (done) => {

        expect(Manifest.get('/', {})).to.be.an.object();

        return done();
    });
});
