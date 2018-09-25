/* eslint-disable quotes,no-console */
const fs = require('fs-extra');
const path = require('path');
const ospath = require('ospath');
const TCORE = require('./page-objects/elements');
const _ = require('lodash');
const assert = require('assert');
// import { expect } from 'chai';

let app;
let version;
let testCount = 0;
let navigationDelay = 0;
const cleanupFileList = [];

function getCleanupFileList() {
  return cleanupFileList;
}

function logVersion() {
  log('**** App version "' + version + '" ****');
}

function initializeTest(app_, count, navigationDelay_) {
  testCount = count;
  app = app_;
  navigationDelay = navigationDelay_;
}

async function startTcore() {
  log("starting tCore");
  await app.client.pause(2000).waitUntilWindowLoaded()
    .getWindowCount()
    .should.eventually.have.at.least(1);
  await app.client.browserWindow.isVisible().should.eventually.equal(true);
  await app.client.windowByIndex(1).waitUntilWindowLoaded().getText(TCORE.getStartedButton.selector).then(text => {
    log('The button text content is "' + text + '"');
  });
  version = await getText(TCORE.versionLabel);
  logVersion();
  await clickOn(TCORE.getStartedButton);
}

/**
 * verify the settings in the Project Checker Dialog
 * @param expectedProjectSettings
 * @return {Promise<void>}
 */
async function verifyProjectInfoDialog(expectedProjectSettings) {
  if (expectedProjectSettings.targetLangId) {
    await verifyValue(TCORE.projectInfoCheckerDialog.targetLangId, expectedProjectSettings.targetLangId);
  }
  if (expectedProjectSettings.languageName) {
    await verifyValue(TCORE.projectInfoCheckerDialog.languageName, expectedProjectSettings.languageName);
  }
  if (expectedProjectSettings.languageId) {
    await verifyValue(TCORE.projectInfoCheckerDialog.languageId, expectedProjectSettings.languageId);
  }
  if (expectedProjectSettings.resourceId) {
    await verifyValue(TCORE.projectInfoCheckerDialog.resourceId, expectedProjectSettings.resourceId);
  }
  if (expectedProjectSettings.languageDirectionLtr) {
    await verifyText(TCORE.projectInfoCheckerDialog.languageDirection, expectedProjectSettings.languageDirectionLtr ? "Left to right" : "Right to left");
  }
  if (expectedProjectSettings.bookName) {
    await verifyText(TCORE.projectInfoCheckerDialog.bookName, expectedProjectSettings.bookName);
  }
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
 * read current text in element
 * @param {Object} elementObj - item to verify
 * @return {Promise<*>}
 */
async function getText(elementObj, delay = 0) {
  const id = (elementObj.id || elementObj.text);
  if (id) {
    log('reading "' + id + '"');
  }
  let text;
  await app.client.pause(delay).getText(elementObj.selector).then(text_ => {
    text = text_;
    if (id) {
      log('value of "' + (elementObj.id || elementObj.text) + '" is "' + text + '"');
    }
  });
  return text;
}

/**
 * verify text in element
 * @param {Object} elementObj - item to verify
 * @param {string} text
 * @param {boolean} exact - if true then do exact match, otherwise trim
 * @return {Promise<void>}
 */
async function verifyText(elementObj, text, exact = true) {
  log('checking "' + (elementObj.id || elementObj.text) + '" equals "' + text + '"');
  if (exact) {
    await app.client.getText(elementObj.selector).should.eventually.equal(text);
  } else {
    const actualText = await getText(elementObj);
    verifyTextIsMatched(actualText, text);
  }
}

/**
 * verify element contains match
 * @param {Object} elementObj - item to verify
 * @param {string} match
 * @return {Promise<void>}
 */
async function verifyContainsText(elementObj, match) {
  log('checking "' + (elementObj.id || elementObj.text) + '" contains "' + match + '"');
  const actualText = await getText(elementObj);
  log("found text: '" + actualText + "'");
  if (!actualText.includes(match)) {
    assert.fail("'" + match + "' not in '" + actualText + "'");
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

async function waitForDialog(elementObj, extraDelay) {
  log('waiting for "' + (elementObj.id) + '"');
  await app.client.pause(navigationDelay + extraDelay)
    .isVisible(elementObj.selector).should.eventually.equal(true);
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
  log('Navigate dialog: "' + (elementObj.id) + '"');
  await waitForDialog(elementObj);
  if (clickOn_) {
    await clickOn(elementObj[clickOn_], exact);
  }
}

async function setToProjectPage() {
  await clickOn(TCORE.projectNavigation);
  await verifyOnSpecificPage(TCORE.projectsPage);
}

async function waitForElementToComeAndGo(elementObj) {
  log("Waiting for searching dialog");
  // app.client.pause(500);
  // await navigateDialog(Elements.searchingWaitDialog); // wait for searching please wait dialog
  await app.client.waitForExist(elementObj.selector, 5000); // wait for searching please wait dialog
  log("Waiting for searching dialog to finish");
  await app.client.waitForExist(elementObj.selector, 5000, true); // wait until searching please wait disappears
}

async function navigateOnlineImportDialog(importConfig) {
  await navigateDialog(TCORE.onlineImportDialog, null); // make sure dialog shown
  if (importConfig.waitForInitialSearchCompletion) {
    app.client.pause(1000);
    await waitForElementToComeAndGo(TCORE.searchingWaitDialog.prompt);
  }
  // await setValue(Elements.onlineImportDialog.user, ''); // seems to be issue with setting to empty string
  if (importConfig.user) {
    await setValue(TCORE.onlineImportDialog.user, (importConfig.user)); // seems to be issue with setting to empty string
  }
  if (importConfig.languageID) {
    await setValue(TCORE.onlineImportDialog.languageID, importConfig.languageID);
  }
  if (importConfig.search) {
    await navigateDialog(TCORE.onlineImportDialog, 'search');
    await waitForElementToComeAndGo(TCORE.searchingWaitDialog.prompt);
  }
  if (importConfig.sourceProject) {
    await setValue(TCORE.onlineImportDialog.enterURL, importConfig.sourceProject);
  }
  if (importConfig.import) {
    await navigateDialog(TCORE.onlineImportDialog, 'import', false);
    await navigateDialog(TCORE.onlineDialog, 'access_internet');
  }
  if (importConfig.cancel) {
    await navigateDialog(TCORE.onlineImportDialog, 'cancel');
  }
}

function getSelectorForBookN(bookNumber) {
  const selector = TCORE.projectInfoCheckerDialog.bookNameN.selector.replace('$N', bookNumber);
  log("book selector " + bookNumber + ": " + selector);
  return selector;
}

async function selectBookName(settings) {
  await clickOn(TCORE.projectInfoCheckerDialog.bookDropDownButton);
  let offset = 0;
  const selector2 = getSelectorForBookN(2);
  const book2 = await getText({selector: selector2}, 500);
  log("book 2 is: " + book2);
  if (book2.includes('(mat)')) {
    offset  = 39;
  }

  const parts = settings.newBookName.split('-');
  const bookNumber = parseInt(parts[0]);
  if (bookNumber < 41) {
    offset += -1; // there is a gap between OT and NT
  }
  const selector = getSelectorForBookN(bookNumber - offset);
  await clickOn({selector});
  const match = "(" + parts[1].toLowerCase() + ")";
  await verifyContainsText(TCORE.projectInfoCheckerDialog.bookName, match);
}

async function navigateProjectInfoDialog(settings) {
  log("Navigating Project Info Checker");
  await waitForDialog(TCORE.projectInfoCheckerDialog, 1000);
  await verifyProjectInfoDialog(settings);
  if (settings.newBookName) {
    await selectBookName(settings);
  }
  if (settings.newLanguageId) {
    await setValue(TCORE.projectInfoCheckerDialog.languageId, settings.newLanguageId);
  }
  if (settings.newTargetLangId) {
    await setValue(TCORE.projectInfoCheckerDialog.targetLangId, settings.newTargetLangId);
  }
  if (settings.continue) {
    await navigateDialog(TCORE.projectInfoCheckerDialog, 'continue');
  } else {
    await navigateDialog(TCORE.projectInfoCheckerDialog, 'cancel');
  }
}

async function navigateMissingVersesDialog(settings) {
  log("Navigating Missing Verses Checker");
  await waitForDialog(TCORE.missingVersesCheckerDialog, 1000);
  await verifyText(TCORE.missingVersesCheckerDialog.missingVersesLabel, TCORE.missingVersesCheckerDialog.missingVersesLabel.text);
  await verifyText(TCORE.missingVersesCheckerDialog.instructions, TCORE.missingVersesCheckerDialog.instructions.text);
  // log("Elements.missingVersesCheckerDialog: " + JSON.stringify(Elements.missingVersesCheckerDialog, null, 2));
  if (settings.continue) {
    await navigateDialog(TCORE.missingVersesCheckerDialog, 'continue');
  } else {
    await navigateDialog(TCORE.missingVersesCheckerDialog, 'cancel');
  }
}

async function navigateGeneralDialog(dialogConfig, buttonClick) {
  await waitForDialog(dialogConfig, 1000);
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

function fileCleanup(projectPath) {
  fs.removeSync(projectPath);
  cleanupFileList.push(projectPath); // record for final cleanup
}

function loadingTextShown(text) {
  return text.includes("Loading...") || text.includes("Please wait...");
}

async function delayWhileInfoDialogShown() {
  log("checking for Alert Dialog shown");
  let loadingDialogFound = false;
  await app.client.waitForExist(TCORE.searchingWaitDialog.title.selector, 5000);
  let text = await getText(TCORE.searchingWaitDialog.prompt);
  if (loadingTextShown(text)) {
    loadingDialogFound = true;
    log("Loading/Importing Dialog shown, wait for it to go away");
    while (loadingTextShown(text)) {
      await app.client.pause(500);
      try {
        text = await getText(TCORE.searchingWaitDialog.prompt);
      } catch (e) {
        text = "";
      }
    }
  }
  return loadingDialogFound;
}

async function doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings) {
  const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');
  if (projectName.includes("undefined")) {
    assert.fail("Invalid Project Name: " + projectName);
  }
  const projectPath = path.join(PROJECTS_PATH, projectName);
  log("making sure test project removed: " + projectPath);
  fileCleanup(projectPath);
  await setToProjectPage();
  await openImportDialog(TCORE.importTypeOptions.online);
  await navigateDialog(TCORE.onlineDialog, 'access_internet');

  // do import
  const importConfig = {
    languageID: 'fr',
    sourceProject,
    import: true,
    search: false
  };
  await navigateOnlineImportDialog(importConfig);
  
  if (projectInfoSettings.preProjectInfoErrorMessage) {
    const importErrorDialog = _.cloneDeep(TCORE.importErrorDialog);
    importErrorDialog.prompt.text = projectInfoSettings.preProjectInfoErrorMessage;
    await waitForDialog(TCORE.importErrorDialog);
    await navigateGeneralDialog(TCORE.importErrorDialog, 'ok');
    await verifyOnSpecificPage(TCORE.projectsPage);
    return;
  }

  // navigate project information dialog
  const projectInfoConfig = {
    ...projectInfoSettings,
    continue: continueOnProjectInfo
  };
  
  if (!projectInfoSettings.noProjectInfoDialog) {
    await delayWhileInfoDialogShown();
    await navigateProjectInfoDialog(projectInfoConfig);
  }

  if (projectInfoSettings.missingVerses) {
    await navigateMissingVersesDialog({ continue: true});
  }
  
  if (continueOnProjectInfo || !projectInfoSettings.noProjectInfoDialog) {
    if (projectInfoSettings.errorMessage) {
      await waitForDialog(TCORE.importErrorDialog, 2000);
      await verifyContainsText(TCORE.importErrorDialog.prompt, projectInfoSettings.errorMessage);
      await navigateGeneralDialog(TCORE.importErrorDialog, 'ok');
      await verifyOnSpecificPage(TCORE.projectsPage);
    } else {
      if (!projectInfoSettings.noRename) {
        let loadingDialogFound = await delayWhileInfoDialogShown();
        if (loadingDialogFound) {
          await waitForDialog(TCORE.renamedDialog);
        }
        
        // navigate renamed dialog
        const renamedDialogConfig = _.cloneDeep(TCORE.renamedDialog);
        renamedDialogConfig.prompt.text = `Your local project has been named\n    ${projectName}`;
        await navigateGeneralDialog(renamedDialogConfig, 'ok');
      }
    }
    await verifyOnSpecificPage(TCORE.toolsPage);
  } else {
    await waitForDialog(TCORE.importErrorDialog);
    await navigateGeneralDialog(TCORE.importCancelDialog, 'cancelImport');
    await verifyOnSpecificPage(TCORE.projectsPage);
  }
  // fs.removeSync(projectPath); // TODO: cannot remove until deselected
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
  const elements = await app.client.$$(TCORE.onlineImportDialog.searchResults.selector);
  const childIndexesArray = Array.from(Array(elements.length + 1).keys()).splice(1);
  // log("childIndexesArray: " + JSON.stringify(childIndexesArray));
  const searchResults = [];
  for (let item of childIndexesArray) {
    // log("item: " + item);
    const selector = TCORE.onlineImportDialog.searchResultN.selector.replace('$N', item);
    // log("selector: " + selector);
    const text = await getText({selector});
    const params = parseSearchResult(text);
    searchResults.push(params);
  }
  return searchResults;
}

async function selectSearchItem(index, verifyText) {
  index++; // search results start at index 1
  log('selecting search result "' + index + '"');
  const selector = TCORE.onlineImportDialog.searchResultCheckBoxN.selector.replace('$N', index);
  const clickOnCheckbox = {
    ...TCORE.onlineImportDialog.searchResultCheckBoxN,
    selector
  };
  await clickOn(clickOnCheckbox);
  if (verifyText) {
    log('verifying selected URL "' + verifyText + '"');
    await waitForValue(TCORE.onlineImportDialog.enterURL, verifyText);
  }
}

async function openImportDialog(importSelection) {
  await clickOn(TCORE.importMenuButton);
  await clickOn(TCORE.importMenuButton[importSelection]);
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

const tCoreSupport = {
  clickOn,
  doOnlineProjectImport,
  getCleanupFileList,
  getLogFilePath,
  getSearchResults,
  indexInSearchResults,
  initializeTest,
  log,
  logVersion,
  navigateDialog,
  navigateGeneralDialog,
  navigateOnlineImportDialog,
  navigateProjectInfoDialog,
  openImportDialog,
  parseSearchResult,
  selectSearchItem,
  setToProjectPage,
  setValue,
  startTcore,
  verifyOnSpecificPage,
  verifyProjectInfoDialog,
  verifyText,
  verifyValue,
  waitForDialog,
  waitForElementToComeAndGo,
  waitForValue
};

module.exports = tCoreSupport;