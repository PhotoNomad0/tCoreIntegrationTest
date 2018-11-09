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

describe.skip('USFM Tests', () => {

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
      const USFM3 = true;
      const newTargetLangId = "zzxz";
      const languageId = "hi";
      const bookId = "tit";
      const continueOnProjectInfo = true;
      const project_id = languageId + "_" + newTargetLangId + "_" + bookId + "_book";
      const testFile = '57-TIT-AlignedHI.usfm';
      const projectSettings = {
        importPath: './test/fixtures/' + testFile,
        license: 'ccShareAlike',
        languageName: "Hindi",
        languageId,
        languageDirectionLtr: true,
        bookName: "Titus (tit)",
        newTargetLangId,
      };
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.doLocalProjectImport(projectSettings, continueOnProjectInfo, projectName);
      await tCore.setToProjectPage();
      const cardNumber = await findCardNumber(project_id);
      assert.ok(cardNumber >= 0);
      await tCore.clickOnRetry(TCORE.projectsList.projectCardMenuN(cardNumber));
      await tCore.clickOnRetry(TCORE.projectsList.projectCardMenuExportUSB);
      await tCore.waitForDialog(TCORE.usfmExport);
      await tCore.clickOnRetry(USFM3 ? TCORE.usfmExport.selectUsfm3 : TCORE.usfmExport.selectUsfm2);
      const outputFileName = testFile;
      const outputFile = path.join(TEST_PATH, outputFileName);
      fs.ensureDirSync(TEST_PATH);
      fs.removeSync(outputFile);
      await tCore.mockDialogPath(outputFile, true);
      await tCore.clickOnRetry(TCORE.usfmExport.export);
      await app.client.pause(3000);
      log("File '" + outputFile + "' exists: " + fs.existsSync(outputFile));
      // const logs = await app.client.getRenderProcessLogs();
      // log("Logs:\n" + JSON.stringify(logs, null, 2));
      await tCore.waitForDialog(TCORE.exportResultsDialog);
      const expectedText = path.parse(testFile).name + " has been successfully exported to " + outputFileName + ".";
      await tCore.verifyText(TCORE.exportResultsDialog.prompt, expectedText);
      await tCore.clickOnRetry(TCORE.exportResultsDialog.ok);
      await app.client.pause(2000);
      utils.testFinished();
    });
  });
});

//
// helpers
//

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

