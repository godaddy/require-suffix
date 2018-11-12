const strategies = [
  (path, ext) => `${path}.${ext}`,
  (path, ext) => `${path}/index.${ext}`
];

/**
 * The results of a require attempt
 * @typedef {Object} RequireResult
 * @property {Boolean} success Whether the attempt was successful, needed
 * because require's can return undefined if they're side-effecting modules
 * @property {*} result The module returned from require
 */

/**
 * Attempt to satisfy the require call with a specific strategy.
 *
 * @param {Object} context The current module
 * @param {Function} req The actual require function
 * @param {String} strategy The strategy (path) to attempt
 * @param {Array} args The non-path arguments passed to required
 * @returns {RequireResult} The result of the require
 */
function tryOneStrategy(context, req, strategy, args) {
  try {
    return {
      success: true,
      result: req.call(context, strategy, ...args)
    };
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND' || !~e.message.indexOf(strategy)) throw e;
    // fallback
    return { success: false };
  }
}

/**
 * Attempt to satisfy the require call with a specific extension, attempting all available strategies.
 * @param {Object} context The current module
 * @param {Function} req The actual require function
 * @param {*} path The path of the original require call
 * @param {Array} args The non-path arguments passed to required
 * @param {*} ext The extension to try
 */
// eslint-disable-next-line max-params
function tryOne(context, req, path, args, ext) {
  for (let i = 0; i < strategies.length; i++) {
    const result = tryOneStrategy(context, req, strategies[i](path, ext), args);
    if (result && result.success) {
      return result;
    }
  }
  return { success: false };
}

let original;
/**
 * Shims the require call with the given extensions
 *
 * @param {...String} extensions The string extensions to attempt in the require shim
 */
module.exports = function shim(...extensions) {
  const containsExtension = new RegExp(extensions.map(e => `\\.${e}$`).join('|'));
  // HACK: This makes it so that it will attempt to find *.{ext}.js
  // file as a first attempt to mimic what an actual bundled build would see
  original = original || module.constructor.prototype.require;
  module.constructor.prototype.require = function (path, ...args) {
    // Only mess around with local references and thing's not already looking
    // at *.native
    if (/^\./.test(path) && !containsExtension.test(path)) {
      for (let i = 0; i < extensions.length; i++) {
        const { success, result } = tryOne(this, original, path, args, extensions[i]);
        if (success) {
          return result;
        }
      }
    }

    return original.call(this, path, ...args);
  };
};

/**
 * Restores the original require, removing the shim
 */
module.exports.restore = function restore() {
  if (original) {
    module.constructor.prototype.require = original;
    original = null;
  }
};
