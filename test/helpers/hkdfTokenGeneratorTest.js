/**
 * Created by Omnius on 01/08/2016.
 */
'use strict';

const Code = require('code');
const Lab = require('lab');

const HkdfTokenGenerator = require(process.cwd() + '/server/helpers/hkdfTokenGenerator');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;

describe('server/helpers/hkdfTokenGenerator', () => {

    it('generates a token', (done) => {

        HkdfTokenGenerator.generateToken('127.0.0.1/hawkSessionToken', null, (id, key, token) => {

            expect(id).to.match(/^[a-fA-F0-9]+$/);
            expect(key).to.match(/^[a-fA-F0-9]+$/);
            expect(token).to.match(/^[a-fA-F0-9]+$/);

            return done();
        });
    });
});
