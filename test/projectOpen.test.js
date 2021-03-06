/* eslint-disable quotes,no-console, no-unused-vars */
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

  before(async () => {
    app = await utils.beforeAll();
    TEST_FILE_PATH = await utils.getTestFiles();
  });

  beforeEach(async function() {
    await utils.beforeEachTest(this.currentTest);
  });

  afterEach(async () => {
    await utils.afterEachTest();
  });

  after(async() => {
    await utils.afterAll();
  });

  describe('Project Open Tests', () => {
    for (let testNum = 1; testNum <= testCount; testNum++) {
      it('should succeed open es-419_tit_no_git.zip with missing verses, no rename', async () => {
        const languageId = "es-419";
        const bookId = "tit";
        const {bookName} = utils.getBibleData(bookId);
        const continueOnProjectInfo = true;
        const projectName = 'es-419_reg_tit_book'; // rename copied project to
        const projectSource = path.join(TEST_FILE_PATH, "es-419_tit_no_git.zip");
        const projectSettings = {
          projectSource,
          projectName,
          targetLangId: "reg",
          languageId,
          languageDirectionLtr: true,
          bookName,
          missingVerses: true,
          noProjectInfoDialog: true,
          noRename: true
        };
        const newProjectName = `${languageId}_${projectSettings.targetLangId}_${bookId}_book`;
        await tCore.doOpenProject(projectSettings, continueOnProjectInfo, newProjectName);
        utils.testFinished();
      });

      it('should succeed open en_ult_php_text.zip and shows broken alignments, no rename', async () => {
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
        await tCore.doOpenProject(projectSettings, continueOnProjectInfo, newProjectName);
        utils.testFinished();
      });

      it('should succeed open es-419_tit_no_git.zip with missing verses, rename', async () => {
        const languageId = "es-419";
        const bookId = "tit";
        const {bookName} = utils.getBibleData(bookId);
        const continueOnProjectInfo = true;
        const projectName = 'es-419_tit_no_git';
        const projectSource = path.join(TEST_FILE_PATH, projectName + ".zip");
        const projectSettings = {
          projectSource,
          projectName,
          targetLangId: "reg",
          languageId,
          languageDirectionLtr: true,
          bookName,
          missingVerses: true
        };
        const newProjectName = `${languageId}_${projectSettings.targetLangId}_${bookId}_book`;
        await tCore.doOpenProject(projectSettings, continueOnProjectInfo, newProjectName);
        utils.testFinished();
      });

      it('should succeed open fr_eph_no_git.zip with missing verses, rename', async () => {
        const languageId = "fr";
        const bookId = "eph";
        const {bookName} = utils.getBibleData(bookId);
        const continueOnProjectInfo = true;
        const projectName = 'fr_eph_no_git';
        const projectSource = path.join(TEST_FILE_PATH, projectName + ".zip");
        const projectSettings = {
          projectSource,
          projectName,
          targetLangId: "reg",
          languageId,
          languageDirectionLtr: true,
          bookName,
          missingVerses: true
        };
        const newProjectName = `${languageId}_${projectSettings.targetLangId}_${bookId}_book`;
        await tCore.doOpenProject(projectSettings, continueOnProjectInfo, newProjectName);
        utils.testFinished();
      });

      describe('should succeed open en_ultx_mat_book.zip, should not lose tw god', () => {
        it('open project', async () => {
          const languageId = "en";
          const bookId = "mat";
          const {bookName} = utils.getBibleData(bookId);
          const continueOnProjectInfo = true;
          const projectName = 'en_ultx_mat_book';
          const projectSource = path.join(TEST_FILE_PATH, "en_ultx_mat_book.zip");
          const projectSettings = {
            projectSource,
            projectName,
            targetLangId: "ultx",
            languageId,
            languageDirectionLtr: true,
            bookName,
            noProjectInfoDialog: true,
            noRename: true
          };
          const newProjectName = `${languageId}_${projectSettings.targetLangId}_${bookId}_book`;
          await tCore.doOpenProject(projectSettings, continueOnProjectInfo, newProjectName);
          utils.testFinished();
        });

        it('should succeed to open tW and make selection for God', async () => {
          await tCore.setToToolPage();
          const settings = {
            onChecks: ["Key Terms"],
            offChecks: ["Other Terms", "Names"]
          };
          await tCore.launchTranslationWords(settings);
          await tCore.selectGroupMenuItem('God', 15, 6);
          const { selected, selectionPhrase, translatedAs } = await tCore.getTwSelectionForCurrent();
          let selections = await tCore.getSelections();
          log("initial selectionText: " + JSON.stringify(selections, null, 2));
          
          if (selections && selections.length) {
            await tCore.clickOn(TCORE.translationWords.clearSelections); // clear selections
          }

          const selectWord = "God";
          const success = await tCore.makeTwSelection(selectWord);
          if (!success) {
            log ("Failed to select word");
          } else {
            await tCore.clickOn(TCORE.translationWords.save); // save selection
            await app.client.pause(500);
          }

          selections = await tCore.getSelections();
          log("selectionText: " + JSON.stringify(selections, null, 2));
          
          await tCore.setToProjectPage();
          await app.client.pause(500);
          utils.testFinished(success);
        });

        it('should succeed open es-419_tit_no_git.zip with missing verses, rename', async () => {
          const languageId = "es-419";
          const bookId = "tit";
          const {bookName} = utils.getBibleData(bookId);
          const continueOnProjectInfo = true;
          const projectName = 'es-419_tit_no_git';
          const projectSource = path.join(TEST_FILE_PATH, projectName + ".zip");
          const projectSettings = {
            projectSource,
            projectName,
            targetLangId: "reg",
            languageId,
            languageDirectionLtr: true,
            bookName,
            missingVerses: true
          };
          const newProjectName = `${languageId}_${projectSettings.targetLangId}_${bookId}_book`;
          const projectPath = path.join(tCore.PROJECT_PATH, newProjectName);
          if (fs.existsSync(projectPath)) {
            delete projectSettings.projectSource; // if already present then skip deletion
            projectSettings.projectName = newProjectName;
            projectSettings.noProjectInfoDialog = true;
            projectSettings.noRename = true;
          }
          await tCore.doOpenProject(projectSettings, continueOnProjectInfo, newProjectName, true);
          utils.testFinished();
        });

        it('open project', async () => {
          const languageId = "en";
          const bookId = "mat";
          const {bookName} = utils.getBibleData(bookId);
          const continueOnProjectInfo = true;
          const projectName = 'en_ultx_mat_book';
          const projectSettings = {
            projectName,
            targetLangId: "ultx",
            languageId,
            languageDirectionLtr: true,
            bookName,
            noProjectInfoDialog: true,
            noRename: true
          };
          const newProjectName = `${languageId}_${projectSettings.targetLangId}_${bookId}_book`;
          await tCore.doOpenProject(projectSettings, continueOnProjectInfo, newProjectName, true);
          utils.testFinished();
        });

        it('should succeed to open tW and still have selection for God', async () => {
          await tCore.setToToolPage();
          const settings = {
            onChecks: ["Key Terms"],
            offChecks: ["Other Terms", "Names"]
          };
          await tCore.launchTranslationWords(settings);
          await tCore.selectGroupMenuItem('God', 15, 6);
          await app.client.pause(100);
          const { selected, selectionPhrase, translatedAs } = await tCore.getTwSelectionForCurrent();
          let selections = await tCore.getSelections();
          log("initial selectionText: " + JSON.stringify(selections, null, 2));

          let success = false;
          const selectWord = "God";
          if (selections && selections.length) {
            success = (selections.length === 1) && (selections[0].text === selectWord) && (translatedAs === selectWord);
          }
          
          if (!success) {
            log ("Failed keep selected word: " + selectWord);
          }

          await tCore.setToProjectPage();
          await app.client.pause(500);
          utils.testFinished(success);
        });
      });
    }
  }).timeout(1000000);
});

//
// helpers
//

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
