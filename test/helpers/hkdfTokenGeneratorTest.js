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

describe('server/routes/hkdfTokenGenerator', () => {

    it('generates a token', (done) => {

        HkdfTokenGenerator.generateToken('127.0.0.1/hawkToken', null, (id, key, token) => {

            expect(id).to.be.not.null();
            expect(key).to.be.not.null();
            expect(token).to.be.not.null();

            return done();
        });
    });
});
