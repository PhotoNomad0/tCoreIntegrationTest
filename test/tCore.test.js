/* eslint-disable quotes,no-console */
const fs = require('fs-extra');
const tCoreConnect = require('./tCoreConnect');
const path = require('path');
const ospath = require('ospath');
const Elements = require('./page-objects/elements');
const _ = require('lodash');
const assert = require('assert');

let app;
let version;
let testCount = 0;
const navigationDelay = 500; // TODO: for slowing down for demo

describe('tCore Test', () => {
  let testName;
  
  before(async () => {
    fs.removeSync(getLogFilePath());
    app = await tCoreConnect.startApp();
    await startTcore();
  });

  beforeEach(function() {
    testName = this.currentTest.title;
    // console.log('beforeEach', testName);
    testCount++;
    fs.removeSync(getLogFilePath());
    logVersion();
    log('Test Name: "' + testName + '"');
  });

  afterEach(async() => {
    log("Test Ended");
  });
  
  after(async() => {
    await tCoreConnect.stopApp(app);
  });

  it.skip('do online import access cancel', async() => {
    await setToProjectPage();
    await clickOn(Elements.importMenuButton);
    // await clickOn(Elements.localImportButton);
    await clickOn(Elements.importMenuButton.onlineImportButton);
    await navigateDialog(Elements.onlineDialog, 'cancel');
    await clickOn(Elements.importMenuButton.close);
    await verifyOnSpecificPage(Elements.projectsPage);
    log("#### Finished Test ####");
  });

  it('do online search', async() => {
    let searchResults;
    await setToProjectPage();
    await clickOn(Elements.importMenuButton);
    // await clickOn(Elements.localImportButton);
    // await clickOn(Elements.onlineImportButton);
    // await navigateDialog(Elements.onlineDialog, 'cancel');
    await clickOn(Elements.importMenuButton.onlineImportButton);
    await navigateDialog(Elements.onlineDialog, 'access_internet');

    // get initial results
    const importConfigInitial = {
      import: false,
      waitForInitialSearchCompletion: true
    };
    await navigateOnlineImportDialog(importConfigInitial);
    // searchResults = await getSearchResults();
    // log("searchResults: " + JSON.stringify(searchResults, null, 2));

    // do search
    const importConfig = {
      user: 'tCore-test-data',
      languageID: 'fr',
      import: false,
      search: true
    };
    await navigateOnlineImportDialog(importConfig);
    searchResults = await getSearchResults();
    log("searchResults: " + JSON.stringify(searchResults, null, 2));
    const index = indexInSearchResults(searchResults, "fr_ulb_tit_book");
    assert.equal(index >= 0, true);
    await selectSearchItem(index, 'https://git.door43.org/tCore-test-data/fr_ulb_tit_book');

    searchResults = await getSearchResults();
    // log("searchResults: " + JSON.stringify(searchResults, null, 2));

    await navigateDialog(Elements.onlineImportDialog, 'cancel');
    await verifyOnSpecificPage(Elements.projectsPage);
    log("#### Finished Test ####");
  });

  it('do online import with cancel', async() => {
    const newTargetLangId = "zzzz";
    const sourceProject = 'https://git.door43.org/tCore-test-data/AlignedUlt_en';
    const settings_en_tit_algn = {
      targetLangId: "algn",
      languageName: "English",
      languageId: "en",
      resourceId: "",
      languageDirectionLtr: true,
      bookName: "Titus (tit)"
    };
    const continueOnProjectInfo = false;
    const projectName = `${settings_en_tit_algn.languageId}_${newTargetLangId}_tit_book`;
    await doOnlineProjectImport(projectName, sourceProject, newTargetLangId, continueOnProjectInfo, settings_en_tit_algn);
    log("#### Finished Test ####");
  });

  it('do online import', async() => {
    const newTargetLangId = "zzzz";
    const sourceProject = 'https://git.door43.org/tCore-test-data/AlignedUlt_en';
    const settings_en_tit_algn = {
      targetLangId: "algn",
      languageName: "English",
      languageId: "en",
      resourceId: "",
      languageDirectionLtr: true,
      bookName: "Titus (tit)"
    };
    const continueOnProjectInfo = true;
    const projectName = `${settings_en_tit_algn.languageId}_${newTargetLangId}_tit_book`;
    await doOnlineProjectImport(projectName, sourceProject, newTargetLangId, continueOnProjectInfo, settings_en_tit_algn);
    log("#### Finished Test ####");
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

function logVersion() {
  log('**** App version "' + version + '" ****');
}

async function startTcore() {
  log("starting tCore");
  await app.client.pause(2000).waitUntilWindowLoaded()
    .getWindowCount()
    .should.eventually.have.at.least(1);
  await app.client.browserWindow.isVisible().should.eventually.equal(true);
  await app.client.windowByIndex(1).waitUntilWindowLoaded().getText(Elements.getStartedButton.selector).then(text => {
    log('The button text content is "' + text + '"');
  });
  await app.client.getText(Elements.versionLabel.selector).then(text => {
    version = text;
    logVersion();
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
  await app.client.getValue(elementObj.selector).then(async value => {
    if (value !== text) {
      log('**** failed setting "' + elementObj.id + '", now is "' + value + '"');
      await app.client.element(elementObj.selector).setValue(text);
      await app.client.pause(200);
    }
  });
  await app.client.getValue(elementObj.selector).should.eventually.equal(text);
}

/**
 * check value in input
 * @param {Object} elementObj - item to set
 * @param {string} text
 * @return {Promise<void>}
 */
async function verifyValue(elementObj, text) {
  log('checking "' + (elementObj.id || elementObj.text) + '" for "' + text + '"');
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
  log('checking "' + (elementObj.id || elementObj.text) + '" for "' + text + '"');
  if (exact) {
    await app.client.getText(elementObj.selector).should.eventually.equal(text);
  } else {
    await app.client.getText(elementObj.selector).then(text_ => {
      verifyTextIsMatched(text_, text);
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
  log('waiting for "' + (elementObj.id) + '"');
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
async function navigateDialog(elementObj, clickOn_ = null, exact = true) {
  await waitForDialog(elementObj);
  if (clickOn_) {
    await clickOn(elementObj[clickOn_], exact);
  }
}

function getLogFilePath() {
  return `./logging/log${testCount}.txt`;
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
  await verifyOnSpecificPage(Elements.projectsPage);
}

async function waitForPleaseWaitDialogToLeave() {
  log("Waiting for searching dialog");
  // app.client.pause(500);
  // await navigateDialog(Elements.searchingWaitDialog); // wait for searching please wait dialog
  await app.client.waitForExist(Elements.searchingWaitDialog.prompt.selector, 5000); // wait for searching please wait dialog
  log("Waiting for searching dialog to finish");
  await app.client.waitForExist(Elements.searchingWaitDialog.prompt.selector, 5000, true); // wait until searching please wait disappears
}

async function navigateOnlineImportDialog(importConfig) {
  await navigateDialog(Elements.onlineImportDialog, null); // make sure dialog shown
  if (importConfig.waitForInitialSearchCompletion) {
    app.client.pause(1000);
    await waitForPleaseWaitDialogToLeave();
  }
  // await setValue(Elements.onlineImportDialog.user, ''); // seems to be issue with setting to empty string
  if (importConfig.user) {
    await setValue(Elements.onlineImportDialog.user, (importConfig.user)); // seems to be issue with setting to empty string
  }
  if (importConfig.languageID) {
    await setValue(Elements.onlineImportDialog.languageID, importConfig.languageID);
  }
  if (importConfig.search) {
    await navigateDialog(Elements.onlineImportDialog, 'search');
    await waitForPleaseWaitDialogToLeave();
  }
  if (importConfig.sourceProject) {
    await setValue(Elements.onlineImportDialog.enterURL, importConfig.sourceProject);
  }
  if (importConfig.import) {
    await navigateDialog(Elements.onlineImportDialog, 'import', false);
    await navigateDialog(Elements.onlineDialog, 'access_internet');
  }
  if (importConfig.cancel) {
    await navigateDialog(Elements.onlineImportDialog, 'cancel');
  }
}

async function navigateProjectInfoDialog(settings_en_tit_algn, projectInfoConfig) {
  await app.client.pause(3000);
  await waitForDialog(Elements.projectCheckerDialog);
  await verifyProjectInfoDialog(settings_en_tit_algn);
  if (projectInfoConfig.targetLangId) {
    await setValue(Elements.projectCheckerDialog.targetLangId, projectInfoConfig.targetLangId);
  }
  if (projectInfoConfig.continue) {
    await navigateDialog(Elements.projectCheckerDialog, 'continue');
  } else {
    await navigateDialog(Elements.projectCheckerDialog, 'cancel');
  }
}

async function navigateGeneralDialog(dialogConfig, buttonClick) {
  await app.client.pause(3000);
  await waitForDialog(dialogConfig);
  if (dialogConfig.title.text) {
    await verifyText(dialogConfig.title, dialogConfig.title.text);
  }
  if (dialogConfig.prompt.text) {
    await verifyText(dialogConfig.prompt, dialogConfig.prompt.text);
  }
  if (buttonClick) {
    await navigateDialog(dialogConfig, buttonClick);
  }
}

async function verifyOnSpecificPage(verifyPage) {
  await navigateDialog(verifyPage, null); // make sure page shown
  if (verifyPage.text) {
    await verifyText(verifyPage, verifyPage.text);
  }
}

async function doOnlineProjectImport(projectName, sourceProject, newTargetLangId, continueOnProjectInfo, settings_en_tit_algn) {
  const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');
  const projectPath = path.join(PROJECTS_PATH, projectName);
  console.log("making sure test project removed: " + projectPath);
  fs.removeSync(projectPath);
  await setToProjectPage();
  await clickOn(Elements.importMenuButton);
  // await clickOn(Elements.localImportButton);
  // await clickOn(Elements.onlineImportButton);
  // await navigateDialog(Elements.onlineDialog, 'cancel');
  await clickOn(Elements.importMenuButton.onlineImportButton);
  await navigateDialog(Elements.onlineDialog, 'access_internet');

  // do import
  const importConfig = {
    languageID: 'fr',
    sourceProject,
    import: true,
    search: false
  };
  await navigateOnlineImportDialog(importConfig);

  // navigate project information dialog
  const projectInfoConfig = {
    targetLangId: newTargetLangId,
    continue: continueOnProjectInfo
  };
  await navigateProjectInfoDialog(settings_en_tit_algn, projectInfoConfig);

  if (continueOnProjectInfo) {
    // navigate renamed dialog
    const renamedDialogConfig = _.cloneDeep(Elements.renamedDialog);
    renamedDialogConfig.prompt.text = `Your local project has been named\n    ${projectName}`;
    await navigateGeneralDialog(renamedDialogConfig, 'ok');
    await verifyOnSpecificPage(Elements.toolsPage);
  } else {
    await navigateGeneralDialog(Elements.importCancelDialog, 'cancelImport');
    await verifyOnSpecificPage(Elements.projectsPage);
  }
  fs.removeSync(projectPath);
}

function parseSearchResult(text) {
  const params = [];
  for (let item of text.split('  ')) {
    const parts = item.split('\n');
    for (let part of parts) {
      params.push(part.trim());
    }
  }
  return params;
}

/**
 * look in the search results for 
 * @param {Array} searchResults
 * @param {String} match
 * @param {Number} column
 * @return {*}
 */
function indexInSearchResults(searchResults, match, column = 0) {
  let pos = -1;
  if (searchResults && searchResults.length) {
    pos = searchResults.findIndex(item => {
      // log("checking item: " + JSON.stringify(item));
      // log("matching: " + item[column] + " to " + match);
      return item[column] === match; 
    });
  }
  // log("pos: " + JSON.stringify(pos));
  return pos;
}

/**
 * returns a list of the results of search
 * @return {Promise<Array>}
 */
async function getSearchResults() {
  log("Getting Search Results:");
  const elements = await app.client.$$(Elements.onlineImportDialog.searchResults.selector);
  const childIndexesArray = Array.from(Array(elements.length + 1).keys()).splice(1);
  // log("childIndexesArray: " + JSON.stringify(childIndexesArray));
  const searchResults = [];
  for (let item of childIndexesArray) {
    // log("item: " + item);
    const selector = Elements.onlineImportDialog.searchResultN.selector.replace('$N', item);
    // log("selector: " + selector);
    await app.client.getText(selector).then(text => {
      // log("content: " + text);
      const params = parseSearchResult(text);
      searchResults.push(params);
    });
  }
  return searchResults;
}

async function selectSearchItem(index, verifyText) {
  index++; // search results start at index 1
  log('selecting search result "' + index + '"');
  const selector = Elements.onlineImportDialog.searchResultCheckBoxN.selector.replace('$N', index);
  const clickOnCheckbox = {
    ...Elements.onlineImportDialog.searchResultCheckBoxN,
    selector
  };
  await clickOn(clickOnCheckbox);
  if (verifyText) {
    log('verifying selected URL "' + verifyText + '"');
    await waitForValue(Elements.onlineImportDialog.enterURL, verifyText);
  }
}
