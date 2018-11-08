# tCoreIntegrationTest
translationCore testing using spectron.

# Setup

```
npm i
```

Also in `./test/tCoreConnect.js` change `appPath` to either 
* point to where the source is found (`'../../translationCore/src/main.js'`) or 
* to the app (`/Applications/translationCore.app/Contents/MacOS/translationCore`) - this is doesn't work yet, electron version conflicts?


# Running Tests
```
npm test
```

Uses Mocha test framework so tests are run sequentially and in order.  Tests look quite similar to `jest`.

# Enabling/Disabling Suites/Tests

All the tests are in path `./test/*.test.js`.
- Enabling: 
  - any test suites that have `describe.skip(` are ignored, just remove the `.skip(` to enable.
  - any tests that have `it.skip(` are ignored, just remove the `.skip(` to enable.

- Disabling: 
  - any test suites can be disabled (skipped) by adding `.skip(`.  For example change `describe(` to `describe.skip(`.
  - any tests can be disabled (skipped) by adding `.skip(`.  For example change `it(` to `it.skip(`.
   
# Debugging Tests
Here is a great description how to use Chrome to debug the scripts: https://glebbahmutov.com/blog/debugging-mocha-using-inspector/

To start debugger on a test:
```
npm run debug-test
```

To change the test to debug, edit this line in package.json and change the path to the test:

``` 
"debug-test": "mocha --inspect-brk ./test/onlineImport.test.js"
```

Open Chrome to `chrome://inspect`

# Tips
When tests fail prematurely with no indication, may need to increase timeout() on test
