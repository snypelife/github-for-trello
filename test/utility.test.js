'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));

import { is } from '../chrome/js/utility.js';

describe('utility', () => {

  describe('is()', () => {
    describe('empty', () => {
      it('should return whether object is empty or not', () => {
        expect(is({}, 'empty?')).to.be.true;
        expect(is({ a: 1 }, 'empty?')).to.be.false;
      });
    });
    describe('object', () => {
      it('should return if is object or not', () => {
        expect(is({}, 'object?')).to.be.true;
        expect(is(1, 'object?')).to.be.false;
      });
    });
    describe('string', () => {
      it('should return if is string or not', () => {
        expect(is('foo bar baz', 'string?')).to.be.true;
        expect(is(1, 'string?')).to.be.false;
      });
    });
  });

});
