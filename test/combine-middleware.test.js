/* eslint-env jest */
import {expect} from 'chai';

import {combineMiddleware} from '../src';

describe('#combineMiddleware(...middleware)', () => {
  function isPlayThroughMW(fn){
    if(typeof fn !== 'function') return false;
    const withStore = fn();
    if(typeof withStore !== 'function') return false;
    let foundAction;
    const runAction = {};
    const withNext = withStore((action) => {
      foundAction = action;
    });
    if(typeof withNext !== 'function') return false;
    withNext(runAction);
    return foundAction === runAction;
  }
  it('returns a playthrough if no functions are given', () => {
    expect(isPlayThroughMW(combineMiddleware())).to.be.true;
  });
  it('returns the same mw if it\'s the only param', () => {
    const fn = () => {};
    expect(combineMiddleware(fn)).to.eq(fn);
  });
  it('ignores non-functions', () => {
    const fn = () => {};
    expect(isPlayThroughMW(combineMiddleware({}))).to.be.true;
    expect(combineMiddleware({}, fn)).to.eq(fn);
  });
  it('combines the middleware', () => {
    const signals = [];
    const mw1 = () => (next) => (action) => {
      signals.push('mw1 before');
      next(action);
      signals.push('mw1 after');
    };
    const mw2 = () => (next) => (action) => {
      signals.push('mw2 before');
      next(action);
      signals.push('mw2 after');
    };

    const combined = combineMiddleware(mw1, mw2);
    let caughtAction;
    const catchAction = (action) => {
      caughtAction = action;
    };
    const myAction = {};
    combined()(catchAction)(myAction);
    expect(caughtAction).to.eq(myAction);
    expect(signals).to.deep.eq(['mw1 before', 'mw2 before', 'mw2 after', 'mw1 after']);
  });
});