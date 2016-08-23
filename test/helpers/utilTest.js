/**
 * Created by Omnius on 20/08/2016.
 */
'use strict';

const Code = require('code');
const Lab = require('lab');

const Util = require(process.cwd() + '/server/helpers/util');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;

describe('server/helpers/util', () => {

    describe('function isHexString', () => {

        it('returns true if the value is a numeric string', (done) => {

            const value = '7786485029038401';
            const isHex = Util.isHexString(value);

            expect(isHex).to.be.true();

            return done();
        });

        it('returns true if the value is a hexidecimal string containing upper case values', (done) => {

            const value = 'ABCDEFABCDEFABCD';
            const isHex = Util.isHexString(value);

            expect(isHex).to.be.true();

            return done();
        });

        it('returns true if the value is a hexidecimal string containing lower case values', (done) => {

            const value = 'abcdefabcdefabcd';
            const isHex = Util.isHexString(value);

            expect(isHex).to.be.true();

            return done();
        });

        it('returns true if the value is a valid hexadecimal string containing alphanumeric characters', (done) => {

            const value = '8e2e01856b562009a76eaa5bfdac2a1e0c34656bee18f193f909ad83e984d6d4';
            const isHexString = Util.isHexString(value);

            expect(isHexString).to.be.true();

            return done();
        });

        it('returns false if the value is a boolean', (done) => {

            const value = true;
            const isHex = Util.isHexString(value);

            expect(isHex).to.be.false();

            return done();
        });

        it('returns false if the value is an object', (done) => {

            const value = {};
            const isHex = Util.isHexString(value);

            expect(isHex).to.be.false();

            return done();
        });

        it('returns false if the value is a number', (done) => {

            const value = 778;
            const isHex = Util.isHexString(value);

            expect(isHex).to.be.false();

            return done();
        });

        it('returns false if the value is an empty string', (done) => {

            const value = '';
            const isHexString = Util.isHexString(value);

            expect(isHexString).to.be.false();

            return done();
        });

        it('returns false if the value contains alphabet characters beyond the letter "f"', (done) => {

            const value = 'dbc14cb180a5719G';
            const isHexString = Util.isHexString(value);

            expect(isHexString).to.be.false();

            return done();
        });

        it('returns false if the value\'s length is not a multiple of 16', (done) => {

            const value = '8e2e01856b562009a76eaa5bfdac2a1e0c34656bee18f193f909ad83e984d6d45810ab5fdc';
            const isHexString = Util.isHexString(value);

            expect(isHexString).to.be.false();

            return done();
        });

        it('returns false if the value contains a dash', (done) => {

            const value = 'dbc14cb180a-5719';
            const isHexString = Util.isHexString(value);

            expect(isHexString).to.be.false();

            return done();
        });

        it('returns false if the value contains an underscore', (done) => {

            const value = 'dbc14cb_180a5719';
            const isHexString = Util.isHexString(value);

            expect(isHexString).to.be.false();

            return done();
        });

        it('returns false if the value contains other special characters', (done) => {

            const value = 'dbc14cb180a5~ec1';
            const isHexString = Util.isHexString(value);

            expect(isHexString).to.be.false();

            return done();
        });
    });
});
