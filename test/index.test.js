const { describe, it } = require('mocha');
const assume = require('assume');

describe('Shim', function () {
  afterEach(function () {
    const { restore } = require('../shim');
    restore();
    require('clear-require').all();
  });

  function testStandard(ext) {
    it(`${ext} finds ${ext} files`, function () {
      require('../' + ext);
      assume(require('./fixtures/thing')).has.property('type', ext);
    });

    it(`${ext} falls back to native`, function () {
      require('../' + ext);
      assume(require('./fixtures/other-thing')).has.property('type', 'native');
    });

    it(`${ext} falls back to web`, function () {
      require('../' + ext);
      assume(require('./fixtures/random')).has.property('type', 'web');
    });

    it(`${ext} finds directory index files`, function () {
      require('../' + ext);
      assume(require('./fixtures/some-folder')).has.property('type', ext);
    });

    it(`${ext} throws on not-found`, function () {
      require('../' + ext);
      assume(() => require('./fixtures/not.a.thing')).throws();
    });

    it(`${ext} throws on errors with a code different than MODULE_NOT_FOUND`, function () {
      assume(() => require('./fixtures/bad-module')).throws('something random not MODULE_NOT_FOUND');
    });

    it(`${ext} throws on errors MODULE_NOT_FOUND for an internal module`, function () {
      assume(() => require('./fixtures/internal-bad-module')).throws('Module not found `./some-internal-module.native.js`');
    });
  }

  testStandard('ios');
  testStandard('android');
  testStandard('win');

  it('can restore from the shim', function () {
    require('../ios');
    const { restore } = require('../shim');
    restore();
    assume(require('./fixtures/thing')).has.property('type', 'web');
  });

  it('can shim other things', function () {
    require('../shim')('thing', 'ios');
    assume(require('./fixtures/random')).has.property('type', 'thing');
    assume(require('./fixtures/thing')).has.property('type', 'ios');
    assume(require('./fixtures/other-thing')).has.property('type', 'web');
  });

  it('supports direct requires for specific files', function () {
    require('../android');
    assume(require('./fixtures/thing.ios')).has.property('type', 'ios');
  });
});
