/* eslint-disable quotes,no-console */
const assert = require('assert');
const path = require('path');
const fs = require('fs-extra');
const ospath = require('ospath');
const tCore = require('./tCoreSupport');
const utils = require('./utils');
const TCORE = require('./page-objects/elements');

const TEST_PATH = path.join(ospath.home(), 'translationCore', 'testing');
let app;

/**
 * does USFM import of project and then exports as USFM.
 */

describe('USFM Tests', () => {
  before(async () => {
    app = await utils.beforeAll();
  });

  beforeEach(async function() {
    await utils.beforeEachTest(this.currentTest.title);
  });

  afterEach(async () => {
    await utils.afterEachTest();
  });

  after(async() => {
    await utils.afterAll();
  });
  
  describe('Import/Export Tests', () => {
    it('do USFM import and export', async () => {
      const newTargetLangId = utils.generateTargetLanguageID();
      const usfmSelect = TCORE.usfmExport.selectUsfm3;
      const languageId = "hi";
      const bookId = "tit";
      const {bookName} = utils.getBibleData(bookId);
      const continueOnProjectInfo = true;
      const project_id = languageId + "_" + newTargetLangId + "_" + bookId + "_book";
      const testFile = '57-TIT-AlignedHI.usfm';
      const importPath = './test/fixtures/' + testFile;
      const projectSettings = {
        importPath,
        license: 'ccShareAlike',
        languageName: "Hindi",
        languageId,
        languageDirectionLtr: true,
        bookName,
        newTargetLangId,
      };
      await doUsfmImportExportTest(languageId, newTargetLangId, bookId, projectSettings, continueOnProjectInfo, project_id, usfmSelect, testFile, importPath);
    });

    it('do USFM import and export', async () => {
      const newTargetLangId = utils.generateTargetLanguageID();
      const usfmSelect = 0;
      const newLanguageId = "en";
      const bookId = "act";
      const {bookName} = utils.getBibleData(bookId);
      const continueOnProjectInfo = true;
      const project_id = newLanguageId + "_" + newTargetLangId + "_" + bookId + "_book";
      const testFile = '45-ACT.usfm';
      const importPath = './test/fixtures/' + testFile;
      const projectSettings = {
        importPath,
        license: 'ccShareAlike',
        languageDirectionLtr: true,
        bookName,
        newTargetLangId,
        newLanguageId
      };
      await doUsfmImportExportTest(newLanguageId, newTargetLangId, bookId, projectSettings, continueOnProjectInfo, project_id, usfmSelect, testFile, importPath);
    });
  });

});

//
// helpers
//

/**
 * do an USFM import, export and compare test
 * @param languageId
 * @param newTargetLangId
 * @param bookId
 * @param projectSettings
 * @param continueOnProjectInfo
 * @param project_id
 * @param usfmSelection
 * @param testFile
 * @param importPath
 * @return {Promise<void>}
 */
async function doUsfmImportExportTest(languageId, newTargetLangId, bookId, projectSettings, continueOnProjectInfo, project_id, usfmSelection, testFile, importPath) {
  const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
  await tCore.doLocalProjectImport(projectSettings, continueOnProjectInfo, projectName);
  await tCore.setToProjectPage();
  const cardNumber = await findCardNumber(project_id);
  assert.ok(cardNumber >= 0);
  await tCore.clickOnRetry(TCORE.projectsList.projectCardMenuN(cardNumber));
  await tCore.clickOnRetry(TCORE.projectsList.projectCardMenuExportUSB);
  const outputFileName = testFile;
  const outputFile = path.join(TEST_PATH, outputFileName);
  fs.ensureDirSync(TEST_PATH);
  fs.removeSync(outputFile);
  await tCore.mockDialogPath(outputFile, true);
  if (usfmSelection) {
    await tCore.waitForDialog(TCORE.usfmExport);
    await tCore.clickOnRetry(usfmSelection);
    await tCore.clickOnRetry(TCORE.usfmExport.export);
  }
  await app.client.pause(1000);
  log("File '" + outputFile + "' exists: " + fs.existsSync(outputFile));
  // const logs = await app.client.getRenderProcessLogs();
  // log("Logs:\n" + JSON.stringify(logs, null, 2));
  await tCore.waitForDialog(TCORE.exportResultsDialog);
  const expectedText = path.parse(testFile).name + " has been successfully exported to " + outputFileName + ".";
  await tCore.verifyText(TCORE.exportResultsDialog.prompt, expectedText);
  await tCore.clickOnRetry(TCORE.exportResultsDialog.ok);
  let sourceUsfm = trimIdTag(fs.readFileSync(importPath).toString());
  const outputUsfm = trimIdTag(fs.readFileSync(outputFile).toString());
  assert.equal(sourceUsfm.length, outputUsfm.length);
  assert.ok(sourceUsfm === outputUsfm);
  assert.equal(sourceUsfm, outputUsfm);
  utils.testFinished();
}

/**
 * trim unique part off of \id tag
 * @param text
 * @return {string}
 */
function trimIdTag(text) {
  let pos = text.indexOf('\\id ');
  const start = text.substr(0, pos);
  let rest = text.substr(pos);
  pos = rest.indexOf('\n');
  let id = rest.substr(0, pos);
  rest = rest.substr(pos);
  const parts = id.split(' ');
  id = [parts[0],parts[1]].join(' ');
  return start + id + rest;
}

async function findCardNumber(name) {
  let cardText;
  for (let i = 1; i <= 20; i++) {
    try {
      cardText = await tCore.getText(TCORE.projectsList.projectCardTitleN(i));
    } catch (e) {
      break;
    }
    if (cardText === name) {
      log("Card " + name + " found at position " + i);
      return i;
    }
  }
  log("Card not found for " + name);
  return -1;
}

function log(text) {
  utils.log(text);
}

