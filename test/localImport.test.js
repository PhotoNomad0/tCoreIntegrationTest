/* eslint-disable quotes,no-console, no-unused-vars */
const assert = require('assert');
const path = require('path');
const fs = require('fs-extra');
const ospath = require('ospath');
const tCore = require('../src/helpers/tCoreSupport');
const utils = require('../src/helpers/utils');
const TCORE = require('./page-objects/elements');

const TEST_PATH = path.join(ospath.home(), 'translationCore', 'testing');
let app;
const testCount = 1; // number of time to repeat import tests
let TEST_FILE_PATH;
let savedTargetId = null;

/**
 * does USFM import of project and then exports as USFM.
 */

describe.skip('Local Tests', () => {

  before(async () => {
    app = await utils.beforeAll();
    TEST_FILE_PATH = await utils.getTestFiles();
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

  describe('Local Import Tests', () => {
    for (let testNum = 1; testNum <= testCount; testNum++) {
      it('should succeed local import 57-TIT-missing-verse.usfm', async () => {
        const newTargetLangId = generateTargetLangId();
        savedTargetId = newTargetLangId;
        const newLanguageId = "en";
        const bookId = "tit";
        const {bookName} = utils.getBibleData(bookId);
        const continueOnProjectInfo = true;
        const testFile = '57-TIT-missing-verse.usfm';
        const importPath = path.join(TEST_FILE_PATH, testFile);
        const projectSettings = {
          importPath,
          license: 'ccShareAlike',
          newLanguageId,
          bookName,
          newTargetLangId,
          missingVerses: true
        };
        const projectName = `${newLanguageId}_${newTargetLangId}_${bookId}_book`;
        await tCore.doLocalProjectImport(projectSettings, continueOnProjectInfo, projectName);
        utils.testFinished();
      });

      it('should succeed local import 57-TIT-missing-verse.usfm overwrite', async () => {
        const newTargetLangId = savedTargetId;
        const newLanguageId = "en";
        const bookId = "tit";
        const {bookName} = utils.getBibleData(bookId);
        const continueOnProjectInfo = true;
        const testFile = '57-TIT-missing-verse.usfm';
        const importPath = path.join(TEST_FILE_PATH, testFile);
        const projectSettings = {
          importPath,
          license: 'ccShareAlike',
          newLanguageId,
          bookName,
          newTargetLangId,
          missingVerses: true,
          noProjectRemoval: true,
          overwrite: true,
          noRename: true
        };
        const projectName = `${newLanguageId}_${newTargetLangId}_${bookId}_book`;
        await tCore.doLocalProjectImport(projectSettings, continueOnProjectInfo, projectName);
        utils.testFinished();
      });

      it('merge conflicts should succeed local import en-x-demo1_php_text_ulb_mc2.tstudio', async () => {
        const newTargetLangId = generateTargetLangId();
        const languageId = "en-x-demo1";
        const bookId = "php";
        const {bookName} = utils.getBibleData(bookId);
        const continueOnProjectInfo = true;
        const testFile = 'en-x-demo1_php_text_ulb_mc2.tstudio';
        const importPath = path.join(TEST_FILE_PATH, testFile);
        const projectSettings = {
          importPath,
          targetLangId: "ulb",
          license: 'ccShareAlike',
          languageId,
          languageDirectionLtr: true,
          bookName,
          newTargetLangId,
          mergeConflicts: true
        };
        const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
        await tCore.doLocalProjectImport(projectSettings, continueOnProjectInfo, projectName);
        utils.testFinished();
      });
      
      it('should succeed local import fr_tit_text_ulb.tstudio', async () => {
        const newTargetLangId = generateTargetLangId();
        const languageId = "fr";
        const bookId = "tit";
        const {bookName} = utils.getBibleData(bookId);
        const continueOnProjectInfo = true;
        const testFile = 'fr_tit_text_ulb.tstudio';
        const importPath = path.join(TEST_FILE_PATH, testFile);
        const projectSettings = {
          importPath,
          targetLangId: "ulb",
          license: 'ccShareAlike',
          languageName: "français",
          languageId,
          languageDirectionLtr: true,
          bookName,
          newTargetLangId,
          missingVerses: true
        };
        const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
        await tCore.doLocalProjectImport(projectSettings, continueOnProjectInfo, projectName);
        utils.testFinished();
      });
      
      it('should succeed local import es-419_tit_text_reg.tstudio', async () => {
        const newTargetLangId = generateTargetLangId();
        const languageId = "es-419";
        const bookId = "tit";
        const {bookName} = utils.getBibleData(bookId);
        const continueOnProjectInfo = true;
        const testFile = 'es-419_tit_text_reg.tstudio';
        const importPath = path.join(TEST_FILE_PATH, testFile);
        const projectSettings = {
          targetLangId: "reg",
          importPath,
          license: 'ccShareAlike',
          languageId,
          languageDirectionLtr: true,
          bookName,
          newTargetLangId,
          missingVerses: true
        };
        const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
        await tCore.doLocalProjectImport(projectSettings, continueOnProjectInfo, projectName);
        utils.testFinished();
      });
  
      it('should succeed local import 59_JAS_hi_grk_aligned_with_number.usfm', async () => {
        const newTargetLangId = generateTargetLangId();
        const newLanguageId = "hi";
        const bookId = "jas";
        const {bookName} = utils.getBibleData(bookId);
        const continueOnProjectInfo = true;
        const testFile = '59_JAS_hi_grk_aligned_with_number.usfm';
        const importPath = path.join(TEST_FILE_PATH, testFile);
        const projectSettings = {
          importPath,
          license: 'ccShareAlike',
          newLanguageId,
          bookName,
          newTargetLangId
        };
        const projectName = `${newLanguageId}_${newTargetLangId}_${bookId}_book`;
        await tCore.doLocalProjectImport(projectSettings, continueOnProjectInfo, projectName);
        utils.testFinished();
      });
    }
  });
  
  describe('Import/Export Tests', () => {
    let alignmentState = false;
    for (let testNum = 1; testNum <= testCount; testNum++) {
      it('do USFM import and export 57-TIT-AlignedHI.usfm', async () => {
        const newTargetLangId = generateTargetLangId();
        alignmentState = !alignmentState;
        const exportAlignments = alignmentState;
        const languageId = "hi";
        const bookId = "tit";
        const {bookName} = utils.getBibleData(bookId);
        const continueOnProjectInfo = true;
        const project_id = languageId + "_" + newTargetLangId + "_" + bookId + "_book";
        const testFile = '57-TIT-AlignedHI.usfm';
        const importPath = path.join(TEST_FILE_PATH, testFile);
        const projectSettings = {
          importPath,
          license: 'ccShareAlike',
          languageName: "Hindi",
          languageId,
          languageDirectionLtr: true,
          bookName,
          newTargetLangId,
        };
        await doUsfmImportExportTest(languageId, newTargetLangId, bookId, projectSettings, continueOnProjectInfo, project_id, true, exportAlignments, testFile, importPath);
      });

      it('do USFM import and export 45-ACT.usfm', async () => {
        const newTargetLangId = generateTargetLangId();
        const exportAlignments = false;
        const newLanguageId = "en";
        const bookId = "act";
        const {bookName} = utils.getBibleData(bookId);
        const continueOnProjectInfo = true;
        const project_id = newLanguageId + "_" + newTargetLangId + "_" + bookId + "_book";
        const testFile = '45-ACT.usfm';
        const importPath = path.join(TEST_FILE_PATH, testFile);
        const projectSettings = {
          importPath,
          license: 'ccShareAlike',
          languageDirectionLtr: true,
          bookName,
          newTargetLangId,
          newLanguageId
        };
        await doUsfmImportExportTest(newLanguageId, newTargetLangId, bookId, projectSettings, continueOnProjectInfo, project_id, false, exportAlignments, testFile, importPath);
      });
    }
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
 * @param {Boolean} hasAlignments
 * @param {Boolean} exportAlignments
 * @param testFile
 * @param importPath
 * @return {Promise<void>}
 */
async function doUsfmImportExportTest(languageId, newTargetLangId, bookId, projectSettings, continueOnProjectInfo,
                                        project_id, hasAlignments, exportAlignments, testFile, importPath) {
  const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
  await tCore.doLocalProjectImport(projectSettings, continueOnProjectInfo, projectName);
  
  // now do USFM export
  await tCore.setToProjectPage();
  const cardNumber = await tCore.findProjectCardNumber(project_id);
  assert.ok(cardNumber > 0);
  await tCore.clickOnRetry(TCORE.projectsList.projectCardN(cardNumber).menu);
  await tCore.clickOnRetry(TCORE.projectsList.projectCardMenuExportUSB);
  const outputFileName = testFile;
  const outputFile = path.join(TEST_PATH, outputFileName);
  fs.ensureDirSync(TEST_PATH);
  fs.removeSync(outputFile);
  await tCore.mockDialogPath(outputFile, true);
  if (hasAlignments) {
    await tCore.waitForDialog(TCORE.usfmExport);
    const currentValue = await tCore.getCheckBoxRetry(TCORE.usfmExport.includeAlignmentsInputValue);
    if (currentValue !== exportAlignments) {
      await tCore.setCheckBoxRetry(TCORE.usfmExport.includeAlignmentsInputValue, exportAlignments);
    }
    const newValue = await tCore.getSelection(TCORE.usfmExport.includeAlignmentsInputValue);
    assert.equal(exportAlignments, newValue);
    await app.client.pause(1000);
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
  log("Reading input USFM");
  let sourceUsfm = trimIdTag(fs.readFileSync(importPath).toString());
  log("input USFM length=" + sourceUsfm.length);
  log("Reading output USFM");
  const outputUsfm = trimIdTag(fs.readFileSync(outputFile).toString());
  log("output USFM length=" + outputUsfm.length);
  log("Checking output USFM");
  log("hasAlignments=" + hasAlignments);
  if (!hasAlignments) {
    if (sourceUsfm !== outputUsfm) {
      log("output: " + outputUsfm.substr(0, 100));
      log("does not equal\n input: " + sourceUsfm.substr(0, 100));
      assert.equal(sourceUsfm, outputUsfm, "output does not equal source");
    }
  } else if (exportAlignments) {
    const short = outputUsfm.length < sourceUsfm.length * 0.9;
    if (short) {
      log("output seems short");
      assert.ok(!short, "output seems short");
    }
  }
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

function log(text) {
  utils.log(text);
}

function generateTargetLangId() {
  const testCount = utils.getTestCount();
  return utils.generateTargetLanguageID(testCount % 2);
}
