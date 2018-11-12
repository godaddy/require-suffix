const error = new Error('Module not found `./some-internal-module.native.js`');
error.code = 'MODULE_NOT_FOUND';

throw error;
