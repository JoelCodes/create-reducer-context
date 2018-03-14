/* eslint-env jest */

describe('#combineMiddleware(...middleware)', () => {
  it('returns a playthrough if no functions are given');
  it('returns the same mw if it\'s the only param');
  it('ignores non-functions');
  it('combines the middleware');
});