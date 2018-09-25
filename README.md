# tCoreIntegrationTest
translationCore testing using spectron.

# Setup

```
npm i
```

Also in `./test/tCoreConnect.js` change `appPath` to either 
* point to the app (`/Applications/translationCore.app`) or
* where the source is found (`'../../translationCore/src/main.js'`)


# Running Tests
```
npm test
```

Uses Mocha test framework so tests are run sequentially and in order.  Tests look quite similar to `jest`.

# Debugging Tests
Here is a great description how to use Chrome to debug the scripts: https://glebbahmutov.com/blog/debugging-mocha-using-inspector/

To start debugger on a test:
```
npm run debug-test
```

To change the test to debug, edit this line in package.json and change the path to the test:

``` 
"debug-test": "mocha --inspect-brk ./test/tCore.test.js"
```

