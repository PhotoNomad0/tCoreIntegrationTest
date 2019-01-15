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

let renameIsBroken = false;
let disableLog = false;

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

/**
 * used to temporarily disable logging
 * @param {Boolean} disable - if true then disable, else enables logging again
 */
function disableLogging(disable = false) {
  disableLog = disable;
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
 * @param {Boolean} catchError - if true we log error, but don't fail test
 * @return {Promise<*>}
 */
async function getText(elementObj, delay = 0, catchError = false) {
  const id = elementDescription(elementObj);
  log('reading "' + id + '"');
  let text;
  try {
    await app.client.pause(delay).getText(elementObj.selector).then(text_ => {
      text = text_;
      log('value of "' + id + '" is "' + text + '"');
    });
  } catch (e) {
    log(id + " error thrown: " + getSafeErrorMessage(e));
    if (!catchError) {
      throw (e);
    }
  }
  return text;
}

/**
 * read current HTML in element
 * @param {Object} elementObj - item to read
 * @param {Boolean} outerHtml - returns outer html if true, else inner html
 * @param {Number} delay - optional time to wait before reading
 * @param {Boolean} catchError - if true we log error, but don't fail test
 * @return {Promise<*>}
 */
async function getHtml(elementObj, outerHtml = false, delay = 0, catchError = false) {
  const id = elementDescription(elementObj);
  log('reading "' + id + '"');
  let text;
  try {
    await app.client.pause(delay).getHTML(elementObj.selector, outerHtml).then(html => {
      text = html;
      log('value of "' + id + '" is "' + text + '"');
    });
  } catch (e) {
    log(id + " error thrown: " + getSafeErrorMessage(e));
    if (!catchError) {
      throw (e);
    }
  }
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
async function waitForDialog(elementObj, extraDelay = 0, expectVisible = true) {
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

/**
 * wait for element to be visible and then not
 * @param {Object} elementObj - dialog element
 * @param {Number} waitToShow - time to wait for dialog to show
 * @param {Boolean} noFail - if true then if dialog not seen, we do not fail test
 * @return {Promise<void>}
 */
async function waitForElementToComeAndGo(elementObj, waitToShow = 5000, waitToHide = 5000, noFail = false) {
  log("Waiting for '" +  elementDescription(elementObj) + "'");
  try {
    await app.client.waitForExist(elementObj.selector, waitToShow); // wait for searching please wait dialog
    log("Waiting for '" + elementDescription(elementObj) + "' to finish");
    await app.client.waitForExist(elementObj.selector, waitToHide, true); // wait until searching please wait disappears
  } catch (e) {
    log("*** Didn't see '" +  elementDescription(elementObj) + "'");
    if (!noFail) {
      throw(e);
    }
  }
}

async function waitForSearchDialog() {
  await waitForElementToComeAndGo(TCORE.searchingWaitDialog.prompt, 2000, 10000, true);
}

async function navigateOnlineImportDialog(importConfig) {
  await navigateDialog(TCORE.onlineImportDialog, null); // make sure dialog shown
  if (importConfig.waitForInitialSearchCompletion) {
    await waitForSearchDialog();
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
    await waitForSearchDialog();
  }
  if (importConfig.sourceProject) {
    await setValue(TCORE.onlineImportDialog.enterURL, importConfig.sourceProject);
  }
  if (importConfig.import) {
    await navigateDialog(TCORE.onlineImportDialog, 'import', false);
    await navigateDialog(TCORE.onlineAccessDialog, 'access_internet');
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
  } else if (settings.saveChanges) {
    await navigateDialog(TCORE.projectInfoCheckerDialog, 'saveChanges');
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

async function dismissDialogIfPresent(elementObj, prompt, acknowledgeButton) {
  let found = false;
  const name = elementDescription(elementObj);
  try {
    let visible = false;
    try {
      visible = await app.client.isVisible(elementObj.selector);
    } catch (e) {
      visible = false;
    }
    if (visible) {
      const text = await getText(elementObj);
      if ((text === prompt) || text.includes(prompt)) {
        log("Leftover Dialog shown " + name + ", dismissing");
        found = true;
        await clickOn(acknowledgeButton);
      }
    }
  } catch (e) {
    log(name + " error caught: " + getSafeErrorMessage(e));
  }
  return found;
}

/**
 * check for leftover dialogs
 * @return {Promise<boolean>}
 */
async function dismissOldDialogs(finished) {
  let leftOversFound = false;
  leftOversFound = leftOversFound || await dismissDialogIfPresent(TCORE.importErrorDialog, "Error occurred while importing your project", TCORE.importErrorDialog.ok);
  leftOversFound = leftOversFound || await dismissDialogIfPresent(TCORE.renamedDialog, "Your local project has been named", TCORE.renamedDialog.ok);
  leftOversFound = leftOversFound || await dismissDialogIfPresent(TCORE.alignmentsResetDialog, TCORE.alignmentsResetDialog.prompt.text, TCORE.alignmentsResetDialog.ok);
  if (leftOversFound) {
    let message = "";
    if (!finished) {
      message = "#### Test failed with leftover Dialogs ####";
    } else {
      message = "#### Leftover Dialog found and dismissed ####";
    }
    log(message);
    log(message, 0);
  }
  return leftOversFound;
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
      let loadingDialogFound = await delayWhileWaitDialogShown();
      if (!getNoRename(projectInfoSettings)) {
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
  await navigateDialog(TCORE.onlineAccessDialog, 'access_internet');

  // do import
  const importConfig = {
    languageID: 'fr',
    sourceProject,
    import: true,
    search: false
  };
  await navigateOnlineImportDialog(importConfig);
  
  if (projectSettings.preProjectInfoErrorMessage) {
    await delayWhileWaitDialogShown();
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

function getLogFilePath(test = -1) {
  const testNum = test >= 0 ? test : testCount;
  return `./logging/log${testNum}.txt`;
}

function log(text, testNum = -1) {
  if (!disableLog) {
    const output = (new Date().toUTCString()) + ": " + text;
    console.log(output);
    const logPath = getLogFilePath(testNum);
    const current = fs.existsSync(logPath) ? fs.readFileSync(logPath) : "";
    fs.writeFileSync(logPath, current + output + "\n");
  }
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
    disableLog = true;
    state = await getSelection(elementObj);
    disableLog = false;
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
  disableLog = true;
  for (let i = 0; i < count; i++) {
    try {
      state = await getSelection(elementObj);
      break;
    } catch (e) {
      log("Failed to get " + elementDescription(elementObj) + " on try " + (i+1));
      await app.client.pause(500);
    }
  }
  disableLog = false;
  return state;
}

async function findToolCardNumber(name) {
  let cardText;
  const childIndexesArray = await getChildIndices(TCORE.toolsList);
  disableLog = true;
  for (let i of childIndexesArray) {
    try {
      cardText = await getText(TCORE.toolsList.toolN(i, ' card ' + i).title);
    } catch (e) {
      break;
    }
    if (cardText === name) {
      disableLog = false;
      log("Card `" + name + "` found at position " + i);
      return i;
    } else {
      log("Skipping Card `" + cardText + "` at position " + i);
    }
  }
  disableLog = false;
  log("Card not found for: '" + name + "'");
  return -1;
}

/**
 * find position of text in elements
 * @param {Function} elementGetter - method to get element for position
 * @param {String} matchText
 * @param {Function} match - method for comparison, default is equals
 * @param {Number} maxCount - maximum number of elements to iterate through
 * @return {Promise<number>}
 */
async function findPositionOfText(elementGetter, matchText, match = (item, match) => (item === match), maxCount = 200) {
  let foundPos = -1;
  disableLog = true;
  for (let pos = 1; pos < maxCount; pos++) {
    const element = elementGetter(pos);
    try {
      const elementText = await getText(element);
      const matches = match(elementText, matchText);
      if (matches) {
        foundPos = pos;
        break;
      }
    } catch (e) {
      // skip
    }
  }
  disableLog = false;
  return foundPos;
}

/**
 * clicks launch on tool that matches name on card
 * @param {String} cardName
 * @return {Promise<Number>} - returns position found
 */
async function launchTool(cardName) {
  const cardNumber = await findToolCardNumber(cardName);
  const toolN = TCORE.toolsList.toolN(cardNumber, cardName);
  // find launch button
  const launchButtonPos = await findPositionOfText((pos) => toolN.launchButtonAtN(pos), "Launch");
  await clickOn(toolN.launchButtonAtN(launchButtonPos));
  return launchButtonPos;
}

/**
 * set checks in array to desirec states
 * @param {Number} cardNumber
 * @param {String} toolName
 * @param {Array} checksArray
 * @param {Boolean} selectionState
 * @return {Promise<void>}
 */
async function setChecks(cardNumber, toolName, checksArray, selectionState) {
  if (checksArray) {
    const toolN = TCORE.toolsList.toolN(cardNumber, toolName);
    for (let item of checksArray) {
      const checkPos = await findPositionOfText((pos) => toolN.typeLabelAtN(pos), item);
      if (checkPos >= 0) {
        await setCheckboxToDesired(toolN.typeSelectorAtN(checkPos), selectionState);
      }
    }
  }
}

/**
 * this matches two different types of group sections: the unselected will be a string.  The current selection will be an array.
 * @param {String} elementText - text on element
 * @param {String} match - text to match
 * @return {boolean} return true if a match
 */
function matchGroupSection(elementText, match) {
  if (Array.isArray(elementText)) {
    return elementText[0] === match;
  }
  return elementText === match;
}

/**
 * select specific item - will expand section if necessary and then select item by chapter and verse
 * @param {String} checkType - text of check section
 * @param {Number} chapter - chapter number of section entry
 * @param {Number} verse - verse number of section entry
 * @return {Promise<void>}
 */
async function selectGroupMenuItem(checkType, chapter, verse) {
  const groupItemPos = await findPositionOfText((pos) => TCORE.groupMenu.checkSectionN(pos, pos), checkType, (item, match) => matchGroupSection(item, match));
  if (groupItemPos >= 0) {
    const elementText = await getText(TCORE.groupMenu.checkSectionN(groupItemPos, checkType));
    const isCurrentSelection = Array.isArray(elementText);
    if (!isCurrentSelection) {
      await clickOnRetry(TCORE.groupMenu.checkSectionN(groupItemPos, checkType));
    }
    const verseString = chapter + ':' + verse;
    const verseItemPos = await findPositionOfText((pos) => TCORE.groupMenu.checkVerseN(groupItemPos, pos), verseString, (item, match) => item.includes(match));
    if (verseItemPos >= 0) {
      await clickOnRetry(TCORE.groupMenu.checkVerseN(groupItemPos, verseItemPos, verseString));
      return;
    }
  }
  log("Group Item not found: " + checkType + ", " + chapter + ':' + verse);
  assert.ok(false);
}

/**
 * removes quotes from string
 * @param {String} text
 * @return {*}
 */
function trimQuote(text) {
  let pos = text.indexOf('"');
  if (pos >= 0) {
    text = text.substr(pos + 1);
    pos = text.indexOf('"');
    if (pos >= 0) {
      text = text.substring(0, pos);
    }
  }
  return text;
}

/**
 * find the before and after text around the string to find
 * @param {String} text
 * @param {String} findString
 * @return {{found: boolean, before: string, after: string}}
 */
function getParts(text, findString) {
  let before = "";
  let after = "";
  let found = false;
  let pos = text.indexOf(findString);
  if (pos >= 0) {
    before = trimQuote(text.substr(0, pos));
    after = trimQuote(text.substr(pos + findString.length));
    found = true;
  }
  return {
    after,
    before,
    found
  };
}

/**
 * get translationWords selection for current check
 * @return {Promise<{translatedAs: string, selected: boolean, selectionPhrase: string}>}
 */
async function getTwSelectionForCurrent() {
  let selectionPhrase = "";
  let translatedAs = "";
  let selected = false;
  const instructions = await getText(TCORE.translationWords.instructions);
  const makeSelection = "Please select the translation for:";
  const {after, found} = getParts(instructions, makeSelection);
  if (found) {
    selectionPhrase = after;
    log("No selection for '" + selectionPhrase + '"');
  } else {
    const selectionMade = "has been translated as:";
    const {after, before, found} = getParts(instructions, selectionMade);
    if (found) {
      selectionPhrase = before;
      log("Selection made for '" + selectionPhrase + '"');
      translatedAs = after;
      log("Translated as '" + translatedAs + '"');
      selected = true;
    }
  }
  return {
    selected,
    selectionPhrase,
    translatedAs
  };
}

/**
 * launch translationWords with selected checks
 * @param {Object} settings
 * @return {Promise<void>}
 */
async function launchTranslationWords(settings = {}) {
  const toolName = "translationWords";
  const cardNumber = await findToolCardNumber(toolName);
  await setChecks(cardNumber, toolName, settings.onChecks, true);
  await setChecks(cardNumber, toolName, settings.offChecks, false);
  await launchTool(toolName);
  await app.client.pause(2000);
  await waitForDialogRetry(TCORE.groupMenu.header, 40);
}

/**
 * search through project cards to find card number that has project name
 * @param {String} projectName
 * @return {Promise<number>}
 */
async function findProjectCardNumber(projectName) {
  let cardText;
  const childIndexesArray = await getChildIndices(TCORE.projectsList);
  for (let i of childIndexesArray) {
    try {
      cardText = await getText(TCORE.projectsList.projectCardTitleN(i));
    } catch (e) {
      break;
    }
    if (cardText === projectName) {
      log("Card " + projectName + " found at position " + i);
      return i;
    }
  }
  log("Card not found for '" + projectName + "'");
  return -1;
}
/**
 * unzip test project into project folder
 * @param {Object} projectSettings
 * @return {Promise<void>}
 */
async function unzipTestProjectIntoProjects(projectSettings) {
  if (projectSettings.projectSource) {
    projectRemoval(projectSettings.projectName);
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
 * @param {String} projectName - name to initially give project in project folders
 * @param {Boolean} noInitialDelete
 * @return {Promise<void>}
 */
async function doOpenProject(projectSettings, continueOnProjectInfo, projectName, noInitialDelete = false) {
  if (!noInitialDelete) {
    projectRemoval(projectName);
  }
  await unzipTestProjectIntoProjects(projectSettings);
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
    const settings = {...projectSettings, continue: continueOnProjectInfo};
    if (!projectSettings.saveChanges && !projectSettings.overwrite && !projectSettings.cancel) {
      settings.continue = true;
    }
    await navigateProjectInfoDialog(settings);
  }

  if (projectSettings.mergeConflicts) {
    await navigateMergeConflictDialog({continue: true});
  }

  if (projectSettings.missingVerses) {
    await navigateMissingVersesDialog({continue: true});
  }

  await navigateImportResults(continueOnProjectInfo, projectSettings, projectName);
  const finalManifestVersion = getManifestTcVersion(path.join(PROJECT_PATH, projectName));
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
 * makes sure checkbox is set to desired toggle value
 * @param {Object} elementObj - item to verify
 * @param {Boolean} desiredValue
 * @return {Promise<void>}
 */
async function setCheckboxToDesired(elementObj, desiredValue) {
  const currentValue = await getCheckBoxRetry(elementObj);
  if (currentValue !== desiredValue) {
    await setCheckBoxRetry(elementObj, desiredValue);
  }
  disableLog = true;
  const newValue = await getSelection(elementObj);
  disableLog = false;
  if (desiredValue !== newValue) {
    log ("failed to set '" + elementDescription(elementObj) + "' to " + desiredValue);
    assert.equal(desiredValue, newValue);
  }
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
    await setCheckboxToDesired(TCORE.usfmExport.includeAlignmentsInputValue, exportAlignments);
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

function getSafeErrorMessage(error, defaultErrorMessage = "### Error message is empty ###") {
  let errorMessage = error || defaultErrorMessage;
  if (error && (error.type !== 'div')) {
    if (error.stack) {
      errorMessage = error.stack;
    } else {
      console.warn(error.toString()); // make message printable
    }
  }
  return errorMessage;
}

function setRenameIsBroken(broken = false) {
  renameIsBroken = broken;
}

/**
 * get position of element
 * @param {Object} elementObj - item to verify
 * @return {Promise<null|Object>} - rectangle
 */
async function getElementPosition(elementObj) {
  const id = elementDescription(elementObj);
  let position_ = null;
  try {
    const size = await app.client.getElementSize(elementObj.selector);
    const location = await app.client.getLocation(elementObj.selector);
    position_ = {
      width: size.width,
      height: size.height,
      x: location.x,
      y: location.y
    };
  } catch (e) {
    log(id + " error: " + e);
  }
  return position_;
}

/**
 * tries to select text by making a guess at position to click.  It does some iterative guessing and is currently 
 * limited to only a single word in search text
 * 
 * @param {String} selectWord
 * @param {Number} occurrence - in case multiple occurrences
 * @return {Promise<Boolean>} - true if successful
 */
async function makeTwSelection(selectWord, occurrence = 0) {
  let success = false;
  const elementObj = TCORE.translationWords.selectionArea;
  const id = elementDescription(elementObj);
  log("Finding position of '" + selectWord + "' in " + id);
  const selectionText = await getText(elementObj, 0, true);
  // log("selectionArea: " + initialSelectionArea);
  let pos = selectionText.indexOf(selectWord);
  while ((pos >= 0) && (occurrence > 0)) {
    pos = selectionText.indexOf(selectWord, pos + 1);
    occurrence--;
  }
  if (pos < 0) {
    log(id + " could not find: " + selectWord);
  } else {
    const parentRect = await getElementPosition(elementObj);
    log("rect= " + JSON.stringify(parentRect, null, 2));

    let selections = await getSelections(elementObj.currentSelections); // this gives us height of line
    if (!selections || !selections.length) { // make a selection and clean
      const pos = getPositionInRectangle(parentRect, 0.5, 0.5);
      await clickAtPositionInElement(TCORE.translationWords.selectionArea, pos);
      await app.client.pause(100);
      selections = await getSelections(elementObj.currentSelections);
      await clickOn({ ...selections[0], id: "Selection" }); // unselect
      await app.client.pause(100);
    }
    let selection = selections[0];
    const lineHeight = selection.rectangle.height;
    const lines = Math.round(parentRect.height / lineHeight);
    let ratio = (pos + selectWord.length / 2) / selectionText.length;
    while (!success) {
      const lineNum = Math.floor(parentRect.height * ratio / lineHeight);
      const yPos = lineNum * lineHeight + lineHeight / 2;
      const xRatio = (ratio - lineNum / lines) * lines;
      const xPos = parentRect.width * xRatio;
      const lastClick = {x: xPos, y: yPos};
      await clickAtPositionInElement(elementObj, lastClick);
      await app.client.pause(100);
      selections = await getSelections(elementObj.currentSelections); // this gives us height of line
      if (selections && selections.length) {
        for (let selection of selections) {
          if (selection.text === selectWord) {
            success = true;
            break;
          }
        }
      }
      if (!success) {
        const spans = await getText(elementObj.currentSelections, 0, true);
        if (spans.length <= 1) { // we missed
          ratio *= 0.75; // shift left and retry
        } else { // we clicked on something
          await clickOn({...selections[0], id: "Selection"}); // unselect
          await app.client.pause(100);
          let pos = spans[0].indexOf(selectWord);
          selection = selections[0];
          if (pos >= 0) { // we need to move to left
            const moveLeftNumChars = spans[0].length - pos + 1;
            const moveLeft = (moveLeftNumChars) / 2 + selection.text.length / 2;
            const ratioAdust = (moveLeft) / selectionText.length;
            ratio -= ratioAdust;
          } else { // we need to move to right
            pos = spans[2].indexOf(selectWord);
            const moveRightNumChars = pos + selection.text.length + 1;
            const moveRight = (moveRightNumChars) / 2 + selection.text.length / 2;
            const ratioAdust = (moveRight) / selectionText.length;
            ratio += ratioAdust;
          }
        }
      }
      
    }
  }
  return success;
}

const CLICK_TYPES = {
  DOUBLE_CLICK: 'double',
  LEFT_CLICK: 'left',
  RIGHT_CLICK: 'right',
};

/**
 * do a click within element
 * @param {Object} elementObj - item to verify
 * @param {Object} position - x,y
 * @param {String} clickType - type of click, default is double
 * @return {Promise<void>}
 */
async function clickAtPositionInElement(elementObj, position, clickType = CLICK_TYPES.DOUBLE_CLICK) {
  const id = elementDescription(elementObj);
  if (position) {
    // make integers
    const x = Math.round(position.x);
    const y = Math.round(position.y);
    log(clickType + " clicking on '" + id + "' at (x=" + x + ", y=" + y + ")");
    try {
      switch (clickType) {
        case CLICK_TYPES.LEFT_CLICK:
          await app.client.leftClick(elementObj.selector, x, y);
          break;
          
        case CLICK_TYPES.RIGHT_CLICK:
          await app.client.rightClick(elementObj.selector, x, y);
          break;
          
        default:
          await app.client.moveToObject(elementObj.selector, x, y).doDoubleClick();
          break;
      }
    } catch (e) {
      log(id + ": error thrown: " + getSafeErrorMessage(e));
    }
  }
}

/**
 * find relative position in rectangle
 * @param {Object} rectangle - rectangle to click in center of
 * @param {Number} xRatio
 * @param {Number} yRatio
 * @return {Object} - x and y of center of rectangle
 */
function getPositionInRectangle(rectangle, xRatio, yRatio) {
  let position = {};
  if (rectangle) {
    const x = rectangle.width * xRatio;
    const y = rectangle.height * yRatio;
    position = {
      x, y
    };
  }
  return position;
}

/**
 * get array of selections
 * @return {Promise<Array>}
 */
async function getSelections() {
  let elementObj = TCORE.translationWords.selectionArea.currentSelections;
  const selections = [];
  const id = elementDescription(elementObj);
  let elements = await app.client.$$(elementObj.selector);
  if (!elements.length) { // fall back to review screen
    elementObj = TCORE.translationWords.selectionArea.currentSelections2;
    elements = await app.client.$$(elementObj.selector);
  }
  for (let element of elements) {
    let background = "";
    let childSelector = null;
    try {
      childSelector = elementObj.selector + ":nth-child(" + (element.index+1) + ")";
      const style = await app.client.$(childSelector).getAttribute('style');
      background = style.includes('background-color');
    } catch (e) {
      log(id + ": error thrown: " + getSafeErrorMessage(e));
    }
    if (background) {
      let selectionText = null;
      let rectangle = null;
      try {
        selectionText = await app.client.getText(childSelector);
        rectangle = await getElementPosition({ selector: childSelector});
      } catch (e) {
        log(id + ": error thrown: " + getSafeErrorMessage(e));
      }
      if (selectionText !== null) {
        selections.push({ text: selectionText, rectangle, selector: childSelector, index: element.index });
      }
    }
  }
  return selections;
}

/**
 * replace inner html for element
 * @param {Object} elementObj - item to verify
 * @param {String} newText
 * @return {Promise<{success: boolean}>}
 */
async function changeInnerHtml(elementObj, newText) {
  let args_ = {
    newText
  };
  let results2 = { success: false };
  try {
    const results = await app.client.selectorExecute(elementObj.selector, function (elements, argsJson) {
      let success = false;
      const args = JSON.parse(argsJson);
      let message = '';
      if (elements.length > 0) {
        message = "Found " + elements.length + " elements";
        try {
          elements[0].innerHTML = args.newText;
          success = true;
        } catch (e) {
          message += "\nselection error thrown: " + e;
        }
      } else {
        message = "No elements found";
      }
      const results = {
        args,
        message,
        success
      };
      return JSON.stringify(results);

    }, JSON.stringify(args_));
    results2 = JSON.parse(results);
  } catch (e) {
    log("\n error thrown: " + getSafeErrorMessage(e));
  }
  if (!results2.success) {
    log("Failed to set html to " + newText);
    assert.ok(false);
  }
  return results2;
}

const tCoreSupport = {
  CLICK_TYPES,
  PROJECT_PATH,
  clickAtPositionInElement,
  clickOn,
  clickOnRetry,
  delayWhileWaitDialogShown,
  disableLogging,
  dismissOldDialogs,
  doExportToCsv,
  doExportToUsfm,
  doLocalProjectImport,
  doOnlineProjectImport,
  doOpenProject,
  elementDescription,
  findToolCardNumber,
  findProjectCardNumber,
  getCheckBoxRetry,
  getChildIndices,
  getCleanupFileList,
  getElementPosition,
  getHtml,
  getLogFilePath,
  getManifestTcVersion,
  getPackageJson,
  getPositionInRectangle,
  getSafeErrorMessage,
  getSearchResults,
  getSelections,
  getTwSelectionForCurrent,
  getSelection,
  getText,
  getTextRetry,
  getValue,
  indexInSearchResults,
  initializeTest,
  launchTool,
  launchTranslationWords,
  log,
  logVersion,
  makeTwSelection,
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
  parseSearchResult,
  projectRemoval,
  retryStep,
  selectGroupMenuItem,
  selectSearchItem,
  setCheckBoxRetry,
  setCheckboxToDesired,
  setRenameIsBroken,
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