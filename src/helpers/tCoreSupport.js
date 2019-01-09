/* eslint-disable quotes,no-console */
const fs = require('fs-extra');
const path = require('path');
const ospath = require('ospath');
const TCORE = require('../../test/page-objects/elements');
const dialogAddon = require('spectron-dialog-addon').default;
const _ = require('lodash');
const tCoreConnect = require('./tCoreConnect');
const assert = require('assert');
const zipFileHelpers = require('./zipFileHelpers');
// import { expect } from 'chai';

const renameIsBroken = true; // TODO: set back to false when fixed

let app;
let version;
let testCount = 0;
let navigationDelay = 0;
const cleanupFileList = [];
let tcAppVersion = -1;
const PROJECT_PATH = path.join(ospath.home(), 'translationCore/projects');

function getPackageJson() {
  const packagePath = path.join(tCoreConnect.appFolderPath, 'package.json');
  const data = fs.readJsonSync(packagePath);
  return data;
}

function getPackageTcVersion() {
  if (tcAppVersion < 0) {
    const data = getPackageJson();
    tcAppVersion = data && data.manifestVersion && parseInt(data.manifestVersion);
    log("tCore current manifest Version: " + tcAppVersion);
  }
  return tcAppVersion;
}

/**
 * get the tCore Version from manifest
 * @param {String} projectPath - path to project
 * @return {number} - version number in manifest
 */
function getManifestTcVersion(projectPath) {
  const data = fs.readJsonSync(path.join(projectPath, 'manifest.json'));
  const manifestVersion = data && data.tc_version && parseInt(data.tc_version);
  return manifestVersion;
}

/**
 *  verify that project was migrated to correct version
 * @param projectPath
 * @return {Boolean} success flag
 */
function validateManifestVersion(projectPath) {
  const tcAppVersion = getPackageTcVersion();
  const manifestVersion = getManifestTcVersion(projectPath);
  const success = manifestVersion === tcAppVersion;
  if (!success) {
    log("#### Manifest final tCore Version was: '" + manifestVersion + "' but should be '" + tcAppVersion + "'");
    assert.equal(manifestVersion, tcAppVersion);
  }
  return success;
}

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
  await app.client.pause(4000);
  log("Finished initial delay");
  try {
    await app.client.waitUntilWindowLoaded()
      .getWindowCount()
      .should.eventually.have.at.least(1);
    log("Reached Window count");
  } catch(e) {
    log("Could not get window count, trying to continue");
    await app.client.pause(500);
  }
  try {
    await app.client.browserWindow.isVisible().should.eventually.equal(true);
    log("browserWindow visible");
  } catch(e) {
    log("Could not found browserWindow, trying to continue");
    await app.client.pause(500);
  }
  log("looking for getting started button");
  await retryStep(20, async () => {
    await app.client.windowByIndex(1).waitUntilWindowLoaded();
  }, "Looking for " + elementDescription(TCORE.getStartedButton),
  500);
  
  let buttonText = await getTextRetry(TCORE.getStartedButton);
  log("button text shown: " + buttonText);
  version = await getText(TCORE.versionLabel);
  logVersion();
  await clickOn(TCORE.getStartedButton);
}

async function getTextRetry(element, count = 20) {
  let elementText;
  await retryStep(count, async () => {
    elementText = await getText(element);
  }, "getting text for " + elementDescription(element),
  500);
  return elementText;
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
  if (expectedProjectSettings.languageDirectionLtr !== undefined) {
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
  log('setting "' + elementDescription(elementObj) + '" to "' + text + '"');
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
  log('checking "' + elementDescription(elementObj) + '" for "' + text + '"');
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
  assert.equal((text || "").toString().trim(), matchText.trim(), "text '" + text + "' does not match expected '" + matchText + "'");
}

/**
 * read current text in element
 * @param {Object} elementObj - item to read
 * @param {Number} delay - optional time to wait before reading
 * @return {Promise<*>}
 */
async function getText(elementObj, delay = 0) {
  const id = elementDescription(elementObj);   
  log('reading "' + id + '"');
  let text;
  await app.client.pause(delay).getText(elementObj.selector).then(text_ => {
    text = text_;
    log('value of "' + id + '" is "' + text + '"');
  });
  return text;
}

/**
 * read current value in element
 * @param {Object} elementObj - item to read
 * @param {Number} delay - optional time to wait before reading
 * @return {Promise<*>}
 */
async function getValue(elementObj, delay = 0) {
  const id = elementDescription(elementObj);
  log('reading "' + id + '"');
  let value;
  await app.client.pause(delay).getValue(elementObj.selector).then(value_ => {
    value = value_;
    log('value of "' + id + '" is "' + value + '"');
  });
  return value;
}

/**
 * get selection state of checkbox
 * @param {Object} elementObj - item to read
 * @param {Number} delay - optional time to wait before reading
 * @return {Promise<Boolean>}
 */
async function getSelection(elementObj, delay = 0) {
  const id = elementDescription(elementObj);
  log('reading Selection state of "' + id + '"');
  if (delay) {
    await app.client.pause(delay);
  }
  const value = await app.client.element(elementObj.selector).isSelected();
  log('value of "' + id + '" is "' + value + '"');
  return value;
}

/**
 * verify text in element
 * @param {Object} elementObj - item to verify
 * @param {string} text
 * @param {boolean} exact - if true then do exact match, otherwise trim
 * @return {Promise<void>}
 */
async function verifyText(elementObj, text, exact = true) {
  log('checking "' + elementDescription(elementObj) + '" equals "' + text + '"');
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
  log('checking "' + elementDescription(elementObj) + '" contains "' + match + '"');
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
  log('clicking on "' + elementDescription(elementObj) + '"');
  await app.client.click(elementObj.selector);
}

/**
 * wait for dialog to be shown or hid
 * @param {Object} elementObj - dialog element
 * @param {Number} extraDelay - extra ms to wait before checking
 * @param {Boolean} expectVisible - if true then expect dialog to be shown, else expect to be hidden
 * @return {Promise<void>}
 */
async function waitForDialog(elementObj, extraDelay, expectVisible = true) {
  const expectedString = (expectVisible ? 'true' : 'false');
  log('waiting for "' +  elementDescription(elementObj) + '" visible to be ' + expectedString);
  await app.client.pause(navigationDelay + extraDelay);
  await app.client.isVisible(elementObj.selector).should.eventually.equal(expectVisible);
  log('"' +  elementDescription(elementObj) + '" is ' + expectedString);
}

/**
 * click on dialog button
 * @param {Object} elementObj - dialog element
 * @param {String} clickOn_ - selector to click on
 * @param {boolean} exact - if true then do exact match, otherwise trim
 * @return {Promise<void>}
 */
async function navigateDialog(elementObj, clickOn_ = null, exact = true) {
  log('Navigate dialog: "' +  elementDescription(elementObj) + '"');
  await waitForDialog(elementObj);
  if (clickOn_) {
    await clickOn(elementObj[clickOn_], exact);
  }
}

async function setToProjectPage(fromTool = false) {
  if (fromTool) {
    await clickOn(TCORE.projectNavigationFromTool);
  } else {
    await clickOn(TCORE.projectNavigation);
  }
  await verifyOnSpecificPage(TCORE.projectsPage);
}

async function setToToolPage(fromTool = false) {
  if (fromTool) {
    await clickOn(TCORE.toolNavigationFromTool);
  } else {
    await clickOn(TCORE.toolNavigation);
  }
  await verifyOnSpecificPage(TCORE.toolsPage);
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
  if (settings.overwrite) {
    await navigateDialog(TCORE.projectInfoCheckerDialog, 'overwrite');
  } else if (settings.continue) {
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

async function navigateMergeConflictDialog(settings) {
  log("Navigating Merge Conflicts Checker");
  await waitForDialog(TCORE.mergeConflictCheckerDialog, 1000);
  let text = await getText(TCORE.mergeConflictCheckerDialog.mergeConflictLabel);
  const includesLabel = text.includes( TCORE.mergeConflictCheckerDialog.mergeConflictLabel.text);
  if (!includesLabel) {
    assert.ok(includesLabel, "Missing text '" + TCORE.mergeConflictCheckerDialog.mergeConflictLabel.text + "' in '" + text);
  }
  text = await getText(TCORE.mergeConflictCheckerDialog.instructions);
  await verifyText(TCORE.mergeConflictCheckerDialog.instructions, TCORE.mergeConflictCheckerDialog.instructions.text);
  const childIndexesArray = await getChildIndices(TCORE.mergeConflictCheckerDialog.mergeConflicts);
  for (let i of childIndexesArray) {
    log("Resolving Merge Conflict " + i);
    const mergeConflictElement = TCORE.mergeConflictCheckerDialog.mergeConflictN(i);
    const resolveButtonElement = mergeConflictElement.resolveButton;
    await app.client.click(resolveButtonElement.selector);
    await clickOn(mergeConflictElement.resolveOption((i % 2) + 1));
  }
  if (settings.continue) {
    await navigateDialog(TCORE.mergeConflictCheckerDialog, 'continue');
  } else {
    await navigateDialog(TCORE.mergeConflictCheckerDialog, 'cancel');
  }
}

async function navigateCopyrightDialog(settings) {
  log("Navigating Copyright");
  await waitForDialog(TCORE.copyrightDialog, 1000);
  await verifyContainsText(TCORE.copyrightDialog.licensesLabel, TCORE.copyrightDialog.licensesLabel.text);
  await verifyText(TCORE.copyrightDialog.instructions, TCORE.copyrightDialog.instructions.text);
  if (settings.license) {
    const checkBox = TCORE.copyrightDialog[settings.license];
    if (checkBox) {
      await clickOn(checkBox);
    } else {
      const message = "copyright button not found: " + settings.license;
      log(message);
      assert.fail(message);
    }
  }
  if (settings.continue) {
    await navigateDialog(TCORE.missingVersesCheckerDialog, 'continue');
  } else {
    await navigateDialog(TCORE.missingVersesCheckerDialog, 'cancel');
  }
}

async function navigateGeneralDialog(dialogConfig, buttonClick) {
  await waitForDialog(dialogConfig, 1000);
  if (dialogConfig.title.text) {
    log("verify dialog title equals: " + dialogConfig.title.text);
    await verifyText(dialogConfig.title, dialogConfig.title.text);
  }
  if (dialogConfig.prompt.text) {
    log("verify dialog prompt contains: " + dialogConfig.prompt.text);
    await verifyContainsText(dialogConfig.prompt, dialogConfig.prompt.text);
  }
  if (buttonClick) {
    await navigateDialog(dialogConfig, buttonClick);
  }
}

async function verifyOnSpecificPage(verifyPage) {
  await navigateDialog(verifyPage, null); // make sure page shown
  log("verify on specific page");
  if (verifyPage.text) {
    await verifyTextRetry(verifyPage, verifyPage.text);
  }
  log("finished verify on specific page");
}

function loadingTextShown(text) {
  return text.includes("Loading your project data") || text.includes("Loading...") || text.includes("Please wait...");
}

async function delayWhileWaitDialogShown() {
  log("Delay while wait Dialog shown");
  let loadingDialogFound = false;
  try {
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
  } catch (e) {
    log("Loading/Importing Dialog not shown, moving on");
  }
  return loadingDialogFound;
}

function projectRemoval(projectName, noRemoval = false) {
  const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');
  if (projectName.includes("undefined")) {
    assert.fail("Invalid Project Name: " + projectName);
  }
  const projectPath = path.join(PROJECTS_PATH, projectName);
  if (!noRemoval) {
    log("making sure test project removed: " + projectPath);
    fs.removeSync(projectPath);
  }
  cleanupFileList.push(projectPath); // record for final cleanup
}

/**
 * wait for dialog with retry
 * @param {Object} elementObj - item to verify
 * @param {number} count - retry count
 * @param {Boolean} expectVisible - if true then expect dialog to be shown, else expect to be hidden
 * @return {Promise<void>}
 */
async function waitForDialogRetry(elementObj, count = 20, expectVisible = true) {
  await retryStep(count, async () => {
    await waitForDialog(elementObj, 0, expectVisible);
  }, "Waiting for Dialog: " + elementDescription(elementObj),
  500);
}

function getNoRename(projectInfoSettings) {
  return projectInfoSettings.noRename || renameIsBroken; // use global flag when rename is broken so we can test the rest
}

async function navigateImportResults(continueOnProjectInfo, projectInfoSettings, projectName) {
  if (continueOnProjectInfo || projectInfoSettings.noProjectInfoDialog) {
    if (projectInfoSettings.errorMessage) {
      await app.client.pause(500);
      await waitForDialog(TCORE.importErrorDialog, 2000);
      await verifyContainsText(TCORE.importErrorDialog.prompt, projectInfoSettings.errorMessage);
      await navigateGeneralDialog(TCORE.importErrorDialog, 'ok');
      await verifyOnSpecificPage(TCORE.projectsPage);
    } else {
      if (!getNoRename(projectInfoSettings)) {
        let loadingDialogFound = await delayWhileWaitDialogShown();
        if (loadingDialogFound) {
          await waitForDialog(TCORE.renamedDialog);
        }

        // navigate renamed dialog
        const renamedDialogConfig = _.cloneDeep(TCORE.renamedDialog);
        renamedDialogConfig.prompt.text = `Your local project has been named\n    ${projectName}`;
        renamedDialogConfig.prompt.id = 'Project Renamed Prompt';
        log("Checking for rename prompt: " + renamedDialogConfig.prompt.text);
        await navigateGeneralDialog(renamedDialogConfig, 'ok');
      }
      if (projectInfoSettings.brokenAlignments) {
        log("Navigating Broken Alignments");
        await waitForDialogRetry(TCORE.alignmentsResetDialog);
        // const prompt = await getText(TCORE.alignmentsResetDialog.prompt);
        await verifyText(TCORE.alignmentsResetDialog.prompt, TCORE.alignmentsResetDialog.prompt.text);
        await navigateDialog(TCORE.alignmentsResetDialog, 'ok');
      } else {
        log("Making sure broken Alignments NOT shown");
        await app.client.pause(1000);
        await waitForDialogRetry(TCORE.alignmentsResetDialog, 20, false);
      }
    }
    await verifyOnSpecificPage(TCORE.toolsPage);
    const projectPath = path.join(PROJECT_PATH, projectName);
    validateManifestVersion(projectPath);
  } else {
    await waitForDialogRetry(TCORE.importErrorDialog);
    await navigateGeneralDialog(TCORE.importCancelDialog, 'cancelImport');
    await verifyOnSpecificPage(TCORE.projectsPage);
  }
}

async function doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectSettings) {
  projectRemoval(projectName, projectSettings.noProjectRemoval);
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
  
  if (projectSettings.preProjectInfoErrorMessage) {
    const importErrorDialog = _.cloneDeep(TCORE.importErrorDialog);
    importErrorDialog.prompt.text = projectSettings.preProjectInfoErrorMessage;
    await waitForDialog(TCORE.importErrorDialog);
    await navigateGeneralDialog(importErrorDialog, 'ok');
    await verifyOnSpecificPage(TCORE.projectsPage);
    return;
  }

  // navigate project information dialog
  const projectInfoConfig = {
    ...projectSettings,
    continue: continueOnProjectInfo
  };
  
  if (!projectSettings.noProjectInfoDialog) {
    await delayWhileWaitDialogShown();
    await navigateProjectInfoDialog(projectInfoConfig);
  }

  if (projectSettings.mergeConflicts) {
    await navigateMergeConflictDialog({continue: true});
  }

  if (projectSettings.missingVerses) {
    await navigateMissingVersesDialog({ continue: true});
  }

  await navigateImportResults(continueOnProjectInfo, projectSettings, projectName);
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
 * returns array of indices of an elements children.  Not sure why this is preferred.  Is it 
 *      possible that there could be a sparse array returned?
 * @param elementObj
 * @return {Promise<number[]>}
 */
async function getChildIndices(elementObj) {
  const elements = await app.client.$$(elementObj.selector);
  const childIndexesArray = Array.from(Array(elements.length + 1).keys()).splice(1);
  log("Found " + childIndexesArray.length + " for " + elementDescription(elementObj));
  return childIndexesArray;
}

/**
 * returns a list of the results of search
 * @return {Promise<Array>}
 */
async function getSearchResults() {
  log("Getting Search Results:");
  const childIndexesArray = await getChildIndices(TCORE.onlineImportDialog.searchResults);
  // log("childIndexesArray: " + JSON.stringify(childIndexesArray));
  const searchResults = [];
  for (let item of childIndexesArray) {
    // log("item: " + item);
    const searchResultN = TCORE.onlineImportDialog.searchResultN(item);
    const text = await getText(searchResultN);
    const params = parseSearchResult(text);
    searchResults.push(params);
  }
  return searchResults;
}

async function selectSearchItem(index, verifyText) {
  index++; // search results start at index 1
  log('selecting search result "' + index + '"');
  const clickOnCheckbox = TCORE.onlineImportDialog.searchResultCheckBoxN(index);
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

function mockDialogPath(file, isSaveDialog = false) {
  const usfmPath = path.resolve(file);
  const exists = (fs.existsSync(usfmPath));
  if (isSaveDialog || exists) {
    const method = isSaveDialog ? 'showSaveDialog' : 'showOpenDialog';
    const returnValue = isSaveDialog ? usfmPath : [usfmPath];
    dialogAddon.mock([{method: method, value: returnValue}]);
  } else {
    log("File '" + file + "' does not exist");
    assert.fail("mockDialogPath: File '" + file + "' does not exist");
  }
}

async function doLocalProjectImport(projectSettings, continueOnProjectInfo, projectName) {
  projectRemoval(projectName, projectSettings.noProjectRemoval);
  mockDialogPath(projectSettings.importPath);
  await setToProjectPage();
  await openImportDialog(TCORE.importTypeOptions.local);

  if (projectSettings.preProjectInfoErrorMessage) {
    await delayWhileWaitDialogShown();
    const importErrorDialog = _.cloneDeep(TCORE.importErrorDialog);
    importErrorDialog.prompt.text = projectSettings.preProjectInfoErrorMessage;
    await waitForDialog(TCORE.importErrorDialog);
    await navigateGeneralDialog(TCORE.importErrorDialog, 'ok');
    await verifyOnSpecificPage(TCORE.projectsPage);

  } else { // no error expected yet

    await delayWhileWaitDialogShown();
    await navigateCopyrightDialog({license: projectSettings.license, continue: true});

    if (!projectSettings.noProjectInfoDialog) {
      await navigateProjectInfoDialog({...projectSettings, continue: continueOnProjectInfo});
    }

    if (projectSettings.mergeConflicts) {
      await navigateMergeConflictDialog({continue: true});
    }

    if (projectSettings.missingVerses) {
      await navigateMissingVersesDialog({continue: true});
    }

    if (projectSettings.overwrite) {
      const overwriteDialogConfig = _.cloneDeep(TCORE.overwriteProjectDialog);
      overwriteDialogConfig.prompt.text = TCORE.overwriteProjectDialog.prompt.matchingText(projectName);
      await navigateGeneralDialog(overwriteDialogConfig, projectSettings.overwriteCancel ? 'cancel' : 'overwrite');
      await app.client.pause(500);
    }
    
    await navigateImportResults(continueOnProjectInfo, projectSettings, projectName);
  }
}

function elementDescription(elementObj) {
  return (elementObj.id || elementObj.text || elementObj.selector);
}

async function clickOnRetry(elementObj, count = 10, delay = 500) {
  await retryStep(count, async () => {
    await clickOn(elementObj);
  }, "clicking on " + elementDescription(elementObj),
  delay);
}

async function navigateRetry(elementObj, count = 20, delay = 500) {
  let success = false;
  const name = elementDescription(elementObj);
  for (let i = 1; i <= count; i++) {
    log(name + ", step= " + i);
    success = false;
    try {
      success = await app.client.isVisible(elementObj.selector);
      if (!success) {
        log(name + ", not visible step " + i);
        await app.client.waitForExist(elementObj.selector, 1000);
      }
    } catch (e) {
      log(name + ", failed step " + i);
      success = false;
      await app.client.pause(delay);
    }
    if (success) {
      log(name + ", finished in step " + i);
      break;
    }
  }
  if (!success) {
    log(name + ", Failed!");
    assert.fail("Retry " + name + ", Failed!");
  }
  await navigateDialog(elementObj);
}

/**
 * retries an operation with error recovery
 * @param {Number} count - maximum retry count
 * @param {Function} operation - operation to perform
 * @param {String} name - operation name for log
 * @param {Number} delay - time to delay between retries
 * @return {Promise<void>}
 */
async function retryStep(count, operation, name, delay = 500) {
  let success = false;
  for (let i = 0; i < count; i++) {
    log(name + ", step= " + (i + 1));
    success = false;
    try {
      await operation();
      success = true;
    } catch (e) {
      log(name + ", failed step " + (i + 1));
      success = false;
      await app.client.pause(delay);
    }
    if (success) {
      log(name + ", finished in step " + (i + 1));
      break;
    }
  }
  if (!success) {
    log(name + ", Failed!");
    assert.fail("Retry " + name + ", Failed!");
  }
}

/**
 * set checkbox to newState and verify
 * @param {Object} elementObj - item to click on
 * @param {Boolean} newState
 * @param {Number} count - maximum number of retries
 * @return {Promise<Boolean>} - new state
 */
async function setCheckBoxRetry(elementObj, newState, count = 20) {
  let state;
  for (let i = 0; i < count; i++) {
    try {
      await app.client.click(elementObj.selector);
    } catch (e) {
      log("Failed to click " + elementDescription(elementObj) + " on try " + (i+1));
    }
    await app.client.pause(500);
    state = await getSelection(elementObj);
    if (state === newState) {
      break;
    }
  }
  return state;
}

/**
 * get the checkbox selection state with retries
 * @param {Object} elementObj - item to get state of
 * @param {Number} count - maximum number of retries
 * @return {Promise<Number>}
 */
async function getCheckBoxRetry(elementObj, count = 20) {
  let state = false;
  for (let i = 0; i < count; i++) {
    try {
      state = await getSelection(elementObj);
      break;
    } catch (e) {
      log("Failed to get " + elementDescription(elementObj) + " on try " + (i+1));
      await app.client.pause(500);
    }
  }
  return state;
}

async function findToolCardNumber(name) {
  let cardText;
  const childIndexesArray = await getChildIndices(TCORE.toolsList);
  for (let i of childIndexesArray) {
    try {
      cardText = await getText(TCORE.toolsList.toolN(i, ' card ' + i).title);
    } catch (e) {
      break;
    }
    if (cardText === name) {
      log("Card `" + name + "` found at position " + i);
      return i;
    } else {
      log("Skipping Card `" + cardText + "` at position " + i);
    }
  }
  log("Card not found for: '" + name + "'");
  return -1;
}

async function launchTool(cardName) {
  const cardNumber = await findToolCardNumber(cardName);
  let launchButtonPos = -1;
  const toolN = TCORE.toolsList.toolN(cardNumber, cardName);
  // find launch button
  for (let pos = 1; pos < 20; pos++) {
    const possibleButton = toolN.launchButtonAtN(pos);
    try {
      const buttonText = await getText(possibleButton);
      if (buttonText === "Launch") {
        launchButtonPos = pos;
        break;
      }
    } catch(e) {
      // skip
    }
  }
  await clickOn(toolN.launchButtonAtN(launchButtonPos));
}

async function findProjectCardNumber(name) {
  let cardText;
  const childIndexesArray = await getChildIndices(TCORE.projectsList);
  for (let i of childIndexesArray) {
    try {
      cardText = await getText(TCORE.projectsList.projectCardTitleN(i));
    } catch (e) {
      break;
    }
    if (cardText === name) {
      log("Card " + name + " found at position " + i);
      return i;
    }
  }
  log("Card not found for '" + name + "'");
  return -1;
}
/**
 * unzip test project into project folder
 * @param {Object} projectSettings
 * @param {String} newProjectName
 * @return {Promise<void>}
 */
async function unzipTestProjectIntoProjects(projectSettings, newProjectName) {
  if (projectSettings.projectSource) {
    projectRemoval(projectSettings.projectName);
    projectRemoval(newProjectName);
    const unzipFolder = path.dirname(projectSettings.projectSource);
    const sourceProjectName = path.parse(projectSettings.projectSource).name;
    fs.removeSync(path.join(unzipFolder, sourceProjectName));
    fs.removeSync(path.join(unzipFolder, '__MACOSX'));
    log("Unzipping project: " + projectSettings.projectSource);
    await zipFileHelpers.extractZipFile(projectSettings.projectSource, unzipFolder);
    let unzippedProject = path.join(unzipFolder, sourceProjectName);
    if (fs.existsSync(path.join(unzippedProject, sourceProjectName))) { // see if nested
      unzippedProject = path.join(unzippedProject, sourceProjectName);
    }
    log("copying project: " + unzippedProject);
    fs.copySync(unzippedProject, path.join(PROJECT_PATH, projectSettings.projectName));
    assert.ok(fs.existsSync(path.join(PROJECT_PATH, projectSettings.projectName)));
  }
}

/**
 * do an USFM import, export and compare test
 * @param {Object} projectSettings
 * @param {Boolean} continueOnProjectInfo
 * @param {String} newProjectName
 * @return {Promise<void>}
 */
async function doOpenProject(projectSettings, continueOnProjectInfo, newProjectName) {
  await unzipTestProjectIntoProjects(projectSettings, newProjectName);
  const projectPath = path.join(PROJECT_PATH, projectSettings.projectName);
  const initialManifestVersion = getManifestTcVersion(projectPath);
  log("Project Initial tCore Manifest Version: " + initialManifestVersion);
  await clickOn(TCORE.userNavigation);
  await setToProjectPage();
  const cardNumber = await findProjectCardNumber(projectSettings.projectName);
  assert.ok(cardNumber >= 0, "Could not find project card");

  await clickOnRetry(TCORE.projectsList.projectCardN(cardNumber).selectButton);

  if (projectSettings.license) {
    await navigateCopyrightDialog({license: projectSettings.license, continue: true});
  }

  if (!projectSettings.noProjectInfoDialog) {
    await navigateProjectInfoDialog({...projectSettings, continue: continueOnProjectInfo});
  }

  if (projectSettings.mergeConflicts) {
    await navigateMergeConflictDialog({continue: true});
  }

  if (projectSettings.missingVerses) {
    await navigateMissingVersesDialog({continue: true});
  }

  await navigateImportResults(continueOnProjectInfo, projectSettings, newProjectName);
  const finalManifestVersion = getManifestTcVersion(path.join(PROJECT_PATH, newProjectName));
  log("Project Initial tCore Manifest Migrated from: '" + initialManifestVersion + "' to '" + finalManifestVersion + "'");
}

/**
 * verify text in element
 * @param {Object} elementObj - item to verify
 * @param {string} text
 * @param {number} count - retry count
 * @return {Promise<void>}
 */
async function verifyTextRetry(elementObj, text, count = 20) {
  const id = elementDescription(elementObj);
  log("Waiting for '" + id + "' to equal: '" + text + "'");
  await retryStep(count, async () => {
    const currentText = await getText(elementObj);
    log(id + " current Text: '" + currentText + "'");
    await verifyText(elementObj, text);
  }, "verifying text for " + elementDescription(elementObj),
  500);
}

/**
 * do export to USFM
 * @param {String} projectName - project name to export
 * @param {String} outputFileName - name for output file
 * @param {Boolean} hasAlignments - true if project has alignments
 * @param {Boolean} exportAlignments - true if we are to export alignments
 * @param {String} outputFolder - path for output folder
 * @return {Promise<string>}
 */
async function doExportToUsfm(projectName, outputFileName, hasAlignments, exportAlignments, outputFolder) {
  await setToProjectPage();
  const cardNumber = await findProjectCardNumber(projectName);
  assert.ok(cardNumber >= 0, "Could not find project card");
  await clickOnRetry(TCORE.projectsList.projectCardN(cardNumber).menu);
  await clickOnRetry(TCORE.projectsList.projectCardMenuExportUSB);
  const outputFile = path.join(outputFolder, outputFileName);
  fs.ensureDirSync(outputFolder);
  fs.removeSync(outputFile);
  await mockDialogPath(outputFile, true);
  if (hasAlignments) {
    await waitForDialog(TCORE.usfmExport);
    const currentValue = await getCheckBoxRetry(TCORE.usfmExport.includeAlignmentsInputValue);
    if (currentValue !== exportAlignments) {
      await setCheckBoxRetry(TCORE.usfmExport.includeAlignmentsInputValue, exportAlignments);
    }
    const newValue = await getSelection(TCORE.usfmExport.includeAlignmentsInputValue);
    assert.equal(exportAlignments, newValue);
    await app.client.pause(1000);
    await clickOnRetry(TCORE.usfmExport.export);
  }
  await app.client.pause(1000);
  log("File '" + outputFile + "' exists: " + fs.existsSync(outputFile));
  // const logs = await app.client.getRenderProcessLogs();
  // log("Logs:\n" + JSON.stringify(logs, null, 2));
  await waitForDialog(TCORE.exportResultsDialog);
  const expectedText = path.parse(outputFileName).name + " has been successfully exported to " + outputFileName + ".";
  await verifyTextRetry(TCORE.exportResultsDialog.prompt, expectedText);
  await clickOnRetry(TCORE.exportResultsDialog.ok);
  return outputFile;
}

/**
 * do export to CSV
 * @param {String} projectName - project name to export
 * @param {String} outputFileName - name for output file
 * @param {String} outputFolder - path for output folder
 * @param {Boolean} expectToolError - if true than error expected
 * @return {Promise<string>}
 */
async function doExportToCsv(projectName, outputFileName, outputFolder, expectToolError) {
  await setToProjectPage();
  const cardNumber = await findProjectCardNumber(projectName);
  assert.ok(cardNumber >= 0, "Could not find project card");
  await clickOnRetry(TCORE.projectsList.projectCardN(cardNumber).menu);
  await clickOnRetry(TCORE.projectsList.projectCardMenuExportCSV);
  const outputFile = path.join(outputFolder, outputFileName);
  fs.ensureDirSync(outputFolder);
  fs.removeSync(outputFile);
  await mockDialogPath(outputFile, true);
  await app.client.pause(1000);
  log("File '" + outputFile + "' exists: " + fs.existsSync(outputFile));
  await waitForDialog(TCORE.exportResultsDialog);
  let expectedText = null;
  if (expectToolError) {
    expectedText = "Export failed with error No tools have loaded for this project..";
  } else {
    expectedText = path.parse(outputFileName).name + " has been successfully exported to " + outputFile + ".";
  }
  await verifyTextRetry(TCORE.exportResultsDialog.prompt, expectedText);
  await clickOnRetry(TCORE.exportResultsDialog.ok);
  return outputFile;
}

const tCoreSupport = {
  PROJECT_PATH,
  clickOn,
  clickOnRetry,
  delayWhileWaitDialogShown,
  doExportToCsv,
  doExportToUsfm,
  doLocalProjectImport,
  doOnlineProjectImport,
  elementDescription,
  findToolCardNumber,
  findProjectCardNumber,
  getCheckBoxRetry,
  getChildIndices,
  getCleanupFileList,
  getLogFilePath,
  getManifestTcVersion,
  getPackageJson,
  getSearchResults,
  getSelection,
  getText,
  getTextRetry,
  getValue,
  indexInSearchResults,
  initializeTest,
  launchTool,
  log,
  logVersion,
  mockDialogPath,
  navigateCopyrightDialog,
  navigateDialog,
  navigateGeneralDialog,
  navigateImportResults,
  navigateMergeConflictDialog,
  navigateMissingVersesDialog,
  navigateOnlineImportDialog,
  navigateProjectInfoDialog,
  navigateRetry,
  openImportDialog,
  doOpenProject,
  parseSearchResult,
  projectRemoval,
  retryStep,
  selectSearchItem,
  setCheckBoxRetry,
  setToProjectPage,
  setToToolPage,
  setValue,
  startTcore,
  unzipTestProjectIntoProjects,
  validateManifestVersion,
  verifyOnSpecificPage,
  verifyProjectInfoDialog,
  verifyText,
  verifyValue,
  waitForDialog,
  waitForElementToComeAndGo,
  waitForValue
};

module.exports = tCoreSupport;