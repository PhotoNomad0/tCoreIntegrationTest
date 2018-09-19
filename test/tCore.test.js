/* eslint-disable quotes,no-console */
const fs = require('fs-extra');
const tCoreConnect = require('./tCoreConnect');
const Elements = require('./page-objects/elements');

let app;
let testCount = 0;
const navigationDelay = 1000; // TODO: for slowing down for demo

describe('tCore Test', () => {
  beforeEach(async () => {
    testCount++;
    fs.removeSync(getLogFilePath());
    app = await tCoreConnect.startApp();
  });

  afterEach(async() => {
    await tCoreConnect.stopApp(app);
  });

  it('opens USFM import', async() => {
    await startTcore();
    await clickOn(Elements.projectNavigation);
    await clickOn(Elements.menuButton);
    // await clickOn(Elements.localImportButton);
    await clickOn(Elements.onlineImportButton);
    await navigateDialog(Elements.onlineDialog, 'cancel');

    await clickOn(Elements.onlineImportButton);
    await navigateDialog(Elements.onlineDialog, 'access_internet');

    await navigateDialog(Elements.onlineImportDialog, null); // make sure dialog shown
    await setValue(Elements.onlineImportDialog.user, '');
    await setValue(Elements.onlineImportDialog.languageID, 'fr');
    await navigateDialog(Elements.onlineImportDialog, 'search');

    log("showing search");
    await app.client.pause(5000);
    await app.client.getTitle().should.equal('Five');
  });
});

//
// helpers
//

async function startTcore() {
  log("starting tCore");
  await app.client.pause(5000).waitUntilWindowLoaded()
    .getWindowCount()
    .should.eventually.have.at.least(1);
  await app.client.browserWindow.isVisible().should.eventually.equal(true);
  await app.client.windowByIndex(1).waitUntilWindowLoaded().getText(Elements.getStartedButton.selector).then(text => {
    log('The button text content is "' + text + '"');
  });
  await app.client.getText(Elements.versionLabel.selector).then(text => {
    log('**** App version "' + text + '" ****');
  });  
  await clickOn(Elements.getStartedButton);
}

async function setValue(elementObj, text) {
  await app.client.pause(navigationDelay);
  log('setting "' + (elementObj.text || elementObj.id) + '" to "' + text + '"');
  await app.client.setValue(elementObj.selector, text);
}

async function clickOn(elementObj) {
  await app.client.pause(navigationDelay);
  if (elementObj.text) {
    await app.client.getText(elementObj.selector).should.eventually.equal(elementObj.text);
  }
  log('clicking on "' + (elementObj.text || elementObj.id) + '"');
  await app.client.click(elementObj.selector);
}

async function waitForDialog(elementObj) {
  log('navigating "' + (elementObj.id) + '"');
  await app.client.pause(navigationDelay);
  await app.client.isVisible(elementObj.selector).should.eventually.equal(true);
  log('"' + (elementObj.id) + '" is visible');
}

/**
 * click on dialog button
 * @param {Object} elementObj
 * @param {String} clickOn_ - selector to click on
 * @return {Promise<void>}
 */
async function navigateDialog(elementObj, clickOn_) {
  await waitForDialog(elementObj);
  if (clickOn_) {
    await clickOn(elementObj[clickOn_]);
  }
}

function getLogFilePath() {
  return `./log${testCount}.txt`;
}

function log(text) {
  const output = (new Date().toUTCString()) + ": " + text;
  console.log(output);
  const logPath = getLogFilePath();
  const current = fs.existsSync(logPath) ? fs.readFileSync(logPath) : "";
  fs.writeFileSync(logPath, current + output + "\n");
}