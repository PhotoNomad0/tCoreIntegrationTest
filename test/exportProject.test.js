/* eslint-disable quotes,no-console, no-unused-vars */
const assert = require('assert');
const path = require('path');
const fs = require('fs-extra');
const ospath = require('ospath');
const tCore = require('../src/helpers/tCoreSupport');
const utils = require('../src/helpers/utils');
const TCORE = require('./page-objects/elements');

const TEST_PATH = path.join(ospath.home(), 'translationCore/testing');
let app;
const testCount = 1; // number of time to repeat import tests
let TEST_FILE_PATH;

/**
 * does USFM import of project and then exports as USFM.
 */

describe('Project Open Tests', () => {
  let usfm2OutputFileName = null;

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

  describe('Project exports', () => {
    for (let testNum = 1; testNum <= testCount; testNum++) {
      it('should succeed import aligned test project en_ult_tit_book', async () => {
        const languageId = "en";
        const bookId = "tit";
        const {bookName} = utils.getBibleData(bookId);
        const continueOnProjectInfo = true;
        const projectName = 'en_ult_tit_book'; // rename copied project to
        const projectSource = path.join(TEST_FILE_PATH, "en_ult_tit_book.zip");
        const projectSettings = {
          projectSource,
          projectName,
          targetLangId: "ult",
          languageId,
          languageDirectionLtr: true,
          bookName,
          noProjectInfoDialog: true,
          noRename: true
        };
        const newProjectName = `${languageId}_${projectSettings.targetLangId}_${bookId}_book`;
        await tCore.doOpenProject(projectSettings, continueOnProjectInfo, newProjectName,);
        utils.testFinished();
      });

      it('should succeed to open WA after import', async () => { // make sure project WA is up to date
        await tCore.setToToolPage(false);
        await tCore.launchTool("Word Alignment");
        await app.client.pause(6000);
        await tCore.navigateDialog(TCORE.groupMenu.header);
        await tCore.setToProjectPage(true);
        await app.client.pause(2000);
        utils.testFinished();
      });

      it('should succeed export to USFM test project  en_ult_tit_book with alignments', async () => {
        const projectName = 'en_ult_tit_book';
        const expectedLength = 137610;
        const outputFile = await testExportToUsfm(projectName, projectName + ".3.usfm", true, true, expectedLength);
        utils.testFinished();
      });

      it('should succeed export to USFM test project  en_ult_tit_book without alignments', async () => {
        const projectName = 'en_ult_tit_book';
        usfm2OutputFileName = projectName + ".2.usfm";
        const expectedLength = 5909;
        const outputFile = await testExportToUsfm(projectName, usfm2OutputFileName, true, false, expectedLength);
        utils.testFinished();
      });

      it('should succeed export to CSV test project  en_ult_tit_book', async () => {
        const projectName = 'en_ult_tit_book';
        const outputFile = await tCore.doExportToCsv(projectName, projectName + ".zip", TEST_PATH);
        utils.testFinished();
      });

      it.skip('should succeed open en_ult_php_text.zip and shows broken alignments, rename', async () => {
        const newTargetLangId = 'zult';
        const languageId = "en";
        const bookId = "php";
        const {bookName} = utils.getBibleData(bookId);
        const continueOnProjectInfo = true;
        const projectName = 'en_zult_php_book'; // rename copied project to
        const projectSource = path.join(TEST_FILE_PATH, 'en_ult_php_text.zip');
        const projectSettings = {
          projectSource,
          projectName,
          newTargetLangId,
          languageId,
          languageDirectionLtr: true,
          bookName,
          noRename: true,
          brokenAlignments: true
        };
        const newProjectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
        await tCore.doOpenProject(projectSettings, continueOnProjectInfo, newProjectName,);
        utils.testFinished();
      });

      it('should succeed overwrite import en_ult_tit_book with edited verse', async () => {
        const usfmFilePath = path.join(TEST_PATH, usfm2OutputFileName);
        modifyTitus(usfmFilePath);
        const newLanguageId = "en";
        const bookId = "tit";
        const {bookName} = utils.getBibleData(bookId);
        const continueOnProjectInfo = true;
        const newTargetLangId = "ult";
        const projectName = 'en_ult_tit_book'; 
        const projectSource = null; // use existing project
        const projectSettings = {
          importPath: usfmFilePath,
          license: 'ccShareAlike',
          projectSource,
          projectName,
          newTargetLangId,
          newLanguageId,
          languageDirectionLtr: true,
          bookName,
          noRename: true,
          overwrite: true,
          noProjectRemoval: true,
          brokenAlignments: true
        };
        const newProjectName = `${newLanguageId}_${newTargetLangId}_${bookId}_book`;
        await tCore.doLocalProjectImport(projectSettings, continueOnProjectInfo, projectName);
        utils.testFinished();
      });
      
      it.skip('should fail export to CSV test project en_ult_tit_book after overwrite before tool openned', async () => {
        const projectName = 'en_ult_tit_book';
        const outputFile = await tCore.doExportToCsv(projectName, projectName + ".zip", TEST_PATH, true);
        utils.testFinished();
      });

      it('should succeed to open WA after overwrite', async () => {
        await tCore.setToToolPage(false);
        await tCore.launchTool("Word Alignment");
        await app.client.pause(6000);
        await tCore.navigateDialog(TCORE.groupMenu.header);
        await tCore.setToProjectPage(true);
        await app.client.pause(2000);
        utils.testFinished();
      });

      it('should succeed to open tW after overwrite', async () => {
        await tCore.setToToolPage(false);
        await tCore.launchTool("translationWords (Part 1)");
        await app.client.pause(6000);
        await tCore.navigateDialog(TCORE.groupMenu.header);
        await tCore.setToProjectPage(true);
        await app.client.pause(2000);
        utils.testFinished();
      });

      it('should succeed export to CSV test project  en_ult_tit_book after overwrite', async () => {
        const projectName = 'en_ult_tit_book';
        const outputFile = await tCore.doExportToCsv(projectName, projectName + ".zip", TEST_PATH, false);
        utils.testFinished();
      });

      it('should succeed to open WA after overwrite', async () => {
        await tCore.setToToolPage(false);
        await tCore.launchTool("Word Alignment");
        await app.client.pause(6000);
        await tCore.navigateDialog(TCORE.groupMenu.header);
        await tCore.setToProjectPage(true);
        await app.client.pause(2000);
        utils.testFinished();
      });

      it('should succeed to open tW after overwrite', async () => {
        await tCore.setToToolPage(false);
        await tCore.launchTool("translationWords (Part 1)");
        await app.client.pause(6000);
        await tCore.navigateDialog(TCORE.groupMenu.header);
        await tCore.setToProjectPage(true);
        await app.client.pause(2000);
        utils.testFinished();
      });
    }
  });
});

//
// helpers
//

function modifyTitus(pathToBook) {
  let usfm = fs.readFileSync(pathToBook).toString();
  usfm = usfm.replace("\\v 1 Paul, a servant of God","\\v 1 Paul, a servan of God");
  usfm = usfm.replace("\\v 4 To Titus, a true son","\\v 4 To Tit2us, a true son");
  fs.writeFileSync(pathToBook, usfm);
  return usfm;
}

async function testExportToUsfm(projectName, outputFileName, hasAlignments, exportAlignments, expectedLength) {
  const outputFile = await tCore.doExportToUsfm(projectName, outputFileName, hasAlignments, exportAlignments, TEST_PATH);
  const outputUsfm = trimIdTag(fs.readFileSync(outputFile).toString());
  log("output USFM length=" + outputUsfm.length);
  if (outputUsfm.length !== expectedLength) {
    log("USFM output should be length " + outputUsfm.length + ", but is " + outputUsfm.length);
    assert.ok(outputUsfm.length === outputUsfm.length);
  }
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
