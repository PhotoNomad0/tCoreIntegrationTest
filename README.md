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