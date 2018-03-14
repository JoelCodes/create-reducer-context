/* eslint-env jest */
import {expect} from 'chai';
import {shallow, mount} from 'enzyme';

describe('#createReducerContext(reducer[, preloadedState][, middleware])', () => {
  describe('parameter errors', () => {
    it('throws an error if there are no parameters or the first is not a function');
    it('throws an error if the third parameter is not a function');
  });
  it('takes in a reducer and preloadedState and returns a Provider and connect');
  it('takes in a reducer and derives the preloadedState.');
  it('changes in response to actions');
  describe('middleware', () => {
    it('lets a flow-through middleware work unimpeded');
    it('makes no change on a blocking middleware');
    it('permits async middleware');
  });
});
