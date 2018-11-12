# require-suffix
Shims node's require method so that it works with runtimes that have additional
file suffixes they prefer to load. The original impetus was react-native's
requires that preferring ios/android/win/native files over the standard js file.

This package is intended for use with test frameworks and not for production code.

## Motivation
For testing `react-native` with `mocha` and similar frameworks, typically you
need to modify your require/import statements to forcibly require the
`*.native` files like so:

``` js
const myComponent = require('./myComponent.native');
myComponent.foobar();
```

Where you would normally write this and let react-native find the right file to
use based on the platform build.

``` js
const myComponent = require('./myComponent');
myComponent.foobar();
```

## Usage
The presets are meant to be consumed via a require or directly from your
package.json like so:

``` json
{
  "scripts": {
    "test:native": "mocha --require require-suffix/native  ./test/*.test.js",
    "test:android": "mocha --require require-suffix/android  ./test/*.test.js",
    "test:ios": "mocha --require require-suffix/ios  ./test/*.test.js",
    "test:win": "mocha --require require-suffix/win  ./test/*.test.js",
  }
}
```

Then you can use require as your normally would in a react-native application:
``` js
const myComponent = require('./myComponent');
myComponent.foobar();
```

Assuming this was run with the `ios` preset, the above will look for
`myComponent.ios.js`, then `myComponent.native.js`, then `myComponent`.

## Preset Fallbacks
Based on the preset, the fallbacks are predefined as 

| Preset | Fallbacks |
|--------|-----------|
| native | `[path].native` -> `[path/index.native]` -> `[path]` |
| android | `[path].android` -> `[path/index.android]` -> `[path].native` -> `[path/index.native]` -> `[path]` |
| ios | `[path].ios` -> `[path/index.ios]` -> `[path].native` -> `[path/index.native]` -> `[path]` |
| win | `[path].win` -> `[path/index.win]` -> `[path].native` -> `[path/index.native]` -> `[path]` |

## Shim
You can also define your run your own fallbacks using shim like so:

```js
require('require-suffix/shim')('foo', 'bar', 'baz');
```
Which will look for `[path].foo` -> `[path]/index.foo` -> `[path].bar` -> `[path]/index.bar` -> `[path].baz` -> `[path]/index.baz` -> `[path]`

## Install

```bash
npm i require-suffix --save-dev
```

## Test

```bash
npm test
```
