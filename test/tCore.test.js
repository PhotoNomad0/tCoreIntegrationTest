/* eslint-disable quotes,no-console */
const fs = require('fs-extra');
const tCoreConnect = require('./tCoreConnect');
const Elements = require('./page-objects/elements');
var assert = require('assert');

let app;
let testCount = 0;
const navigationDelay = 500; // TODO: for slowing down for demo

describe('tCore Test', () => {
  beforeEach(async () => {
    testCount++;
    fs.removeSync(getLogFilePath());
    app = await tCoreConnect.startApp();
  });

  afterEach(async() => {
    await tCoreConnect.stopApp(app);
  });

  it('do online import', async() => {
    const sourceProject = 'https://git.door43.org/tCore-test-data/AlignedUlt_en';
    const settings_en_tit_algn = {
      targetLangId: "algn",
      languageName: "English",
      languageId: "en",
      resourceId: "",
      languageDirectionLtr: true,
      bookName: "Titus (tit)"
    };
    await startTcore();
    await setToProjectPage();
    await clickOn(Elements.menuButton);
    // await clickOn(Elements.localImportButton);
    await clickOn(Elements.onlineImportButton);
    await navigateDialog(Elements.onlineDialog, 'cancel');
    await clickOn(Elements.onlineImportButton);
    await navigateDialog(Elements.onlineDialog, 'access_internet');

    // do import
    await navigateDialog(Elements.onlineImportDialog, null); // make sure dialog shown
    // await setValue(Elements.onlineImportDialog.user, ''); // seems to be issue with setting to empty string
    await setValue(Elements.onlineImportDialog.user, 'tCore-test-data'); // seems to be issue with setting to empty string
    await setValue(Elements.onlineImportDialog.languageID, 'fr');
    // await navigateDialog(Elements.onlineImportDialog, 'search');
    await setValue(Elements.onlineImportDialog.enterURL, sourceProject);
    await navigateDialog(Elements.onlineImportDialog, 'import', false);
    await navigateDialog(Elements.onlineDialog, 'access_internet');
    
    // entering project information
    await app.client.pause(3000);
    await waitForDialog(Elements.projectCheckerDialog);
    await verifyProjectInfoDialog(settings_en_tit_algn);
    await setValue(Elements.projectCheckerDialog.targetLangId, "zzzz");

    log("showing search");
    await app.client.pause(10000);
  });
  
  // disabled because we don't have a way to interact with file system dialog
  it.skip('opens USFM import', async() => {
    await startTcore();
    await clickOn(Elements.projectNavigation);
    await clickOn(Elements.menuButton);
    await clickOn(Elements.localImportButton);
    
    log("showing search");
    await app.client.pause(10000);
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

/**
 * verify the settings in the Project Checker Dialog
 * @param expectedProjectSettings
 * @return {Promise<void>}
 */
async function verifyProjectInfoDialog(expectedProjectSettings) {
  await verifyValue(Elements.projectCheckerDialog.targetLangId, expectedProjectSettings.targetLangId);
  await verifyValue(Elements.projectCheckerDialog.languageName, expectedProjectSettings.languageName);
  await verifyValue(Elements.projectCheckerDialog.languageId, expectedProjectSettings.languageId);
  await verifyValue(Elements.projectCheckerDialog.resourceId, expectedProjectSettings.resourceId);
  await verifyText(Elements.projectCheckerDialog.languageDirection, expectedProjectSettings.languageDirectionLtr ? "Left to right" : "Right to left");
  await verifyText(Elements.projectCheckerDialog.bookName, expectedProjectSettings.bookName);
}

/**
 * set value in input
 * @param {Object} elementObj - item to set
 * @param {string} text
 * @return {Promise<void>}
 */
async function setValue(elementObj, text) {
  await app.client.pause(navigationDelay);
  log('setting "' + elementObj.id + '" to "' + text + '"');
  //TODO: seems to fail with empty string
  await app.client.element(elementObj.selector).setValue(text);
  await app.client.pause(200);
  await app.client.getValue(elementObj.selector).should.eventually.equal(text);
}

/**
 * check value in input
 * @param {Object} elementObj - item to set
 * @param {string} text
 * @return {Promise<void>}
 */
async function verifyValue(elementObj, text) {
  log('checking "' + elementObj.id + '" for "' + text + '"');
  await app.client.getValue(elementObj.selector).then(value => {
    verifyTextIsMatched(value, text);
  });
}

/**
 * check value in input
 * @param {Object} elementObj - item to set
 * @param {string} text
 * @return {Promise<void>}
 */
async function waitForValue(elementObj, text) {
  await app.client.pause(navigationDelay);
  log('checking "' + elementObj.id + '" for "' + text + '"');
  await app.client.getValue(elementObj.selector).should.eventually.equal(text);
}

function verifyTextIsMatched(text, matchText) {
  assert.equal((text || "").toString().trim(), matchText.trim());
}

/**
 * click on element
 * @param {Object} elementObj - item to click on
 * @param {string} text
 * @param {boolean} exact - if true then do exact match, otherwise trim
 * @return {Promise<void>}
 */
async function verifyText(elementObj, text, exact = true) {
  log('checking "' + elementObj.id + '" for "' + text + '"');
  if (exact) {
    await app.client.getText(elementObj.selector).should.eventually.equal(text);
  } else {
    await app.client.getText(elementObj.selector).then(text => {
      verifyTextIsMatched(text, text);
    });
  }
}

/**
 * click on element
 * @param {Object} elementObj - item to click on
 * @param {boolean} exact - if true then do exact match, otherwise trim
 * @return {Promise<void>}
 */
async function clickOn(elementObj, exact = true) {
  await app.client.pause(navigationDelay);
  if (elementObj.text) {
    await verifyText(elementObj, elementObj.text, exact);
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
 * @param {Object} elementObj - dialog element
 * @param {String} clickOn_ - selector to click on
 * @param {boolean} exact - if true then do exact match, otherwise trim
 * @return {Promise<void>}
 */
async function navigateDialog(elementObj, clickOn_, exact = true) {
  await waitForDialog(elementObj);
  if (clickOn_) {
    await clickOn(elementObj[clickOn_], exact);
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

async function setToProjectPage() {
  await clickOn(Elements.projectNavigation);
}
