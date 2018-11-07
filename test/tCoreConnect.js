/* eslint-disable no-console */
const Application = require('spectron').Application;
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const electron = require('electron');
const path = require('path');
const dialogAddon = require('spectron-dialog-addon').default;

const appPath = path.join(__dirname, '../../translationCore/src/main.js'); // launch from source
// const appPath = '/Applications/translationCore.app/Contents/MacOS/translationCore'; // directly launch app

console.log('appPath', appPath);

global.before(() => {
  chai.should();
  chai.use(chaiAsPromised);
});

module.exports = {
  async startApp() {
    const useElectron = (appPath.indexOf('main.js') >= 0);
    let app;
    if (useElectron) {
      app = new Application({
        path: electron,
        args: [appPath]
      });
    } else {
      // launch app directly
      app = new Application({
        path: appPath
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
  }
};
