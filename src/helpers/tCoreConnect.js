/* eslint-disable no-console */
const Application = require('spectron').Application;
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const electron = require('electron');
const path = require('path');
const dialogAddon = require('spectron-dialog-addon').default;
let appStartupPath = null;
let appFolderPath = null;
let useElectron = false;

// ****************************
// launch from app source
// ****************************
// const appFolder = '../../../testDir/translationCoreTest'; 
const appFolder = '../../../translationCore';
const appStartupFile = 'src/es6-init.js';
appFolderPath = path.join(__dirname, appFolder);
appStartupPath = path.join(appFolderPath, appStartupFile);

// ****************************
// launch compiled app
/*
  When running compiled app as below, spectron launches the app and can click the get started button that shows the app, but hangs trying to click on "Project Navigation" at top of app screen.  Not sure why that would be.
 */
// ****************************
// appStartupPath = appFolderPath = '/Applications/translationCore.app/Contents/MacOS/translationCore'; // directly launch app

console.log('appStartupPath', appStartupPath);

global.before(() => {
  chai.should();
  chai.use(chaiAsPromised);
});

useElectron = (appStartupPath.indexOf('.js') >= 0);

module.exports = {
  async startApp() {
    let app;
    if (useElectron) {
      app = new Application({
        path: electron,
        args: [appStartupPath]
      });
    }
    else { // this does not seem to be supported?
      // launch app directly
      app = new Application({
        path: appStartupPath,
        env: {
          ELECTRON_ENABLE_LOGGING: true,
          ELECTRON_ENABLE_STACK_DUMPING: true,
          NODE_ENV: 'development'
        }
      });
    }
    dialogAddon.apply(app);
    await app.start();
    chaiAsPromised.transferPromiseness = app.transferPromiseness;
    return app;
  },

  async stopApp(app) {
    if (app && app.isRunning()) {
      await app.stop();
    }
  },

  appStartupPath,
  appFolderPath,
  useElectron
};
