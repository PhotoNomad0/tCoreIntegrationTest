/* eslint-disable no-console */
const Application = require('spectron').Application;
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const electron = require('electron');
const path = require('path');
const dialogAddon = require('spectron-dialog-addon').default;

// const appPath = path.join(__dirname, '../../../testDir/translationCoreTest/src/es6-init.js'); // launch from source
const appPath = path.join(__dirname, '../../../translationCore/src/es6-init.js'); // launch from source

/*
  When running compiled app as below, spectron launches the app and can click the get started button that shows the app, but hangs trying to click on "Project Navigation" at top of app screen.  Not sure why that would be.
 */
// const appPath = '/Applications/translationCore.app/Contents/MacOS/translationCore'; // directly launch app

console.log('appPath', appPath);

global.before(() => {
  chai.should();
  chai.use(chaiAsPromised);
});

module.exports = {
  async startApp() {
    const useElectron = true; // (appPath.indexOf('main.js') >= 0);
    let app;
    if (useElectron) {
      app = new Application({
        path: electron,
        args: [appPath]
      });
    }
    // else { // this does not seem to be supported?
    //   // launch app directly
    //   app = new Application({
    //     path: appPath
    //   });
    // }
    dialogAddon.apply(app);
    await app.start();
    chaiAsPromised.transferPromiseness = app.transferPromiseness;
    return app;
  },

  async stopApp(app) {
    if (app && app.isRunning()) {
      await app.stop();
    }
  }
};
