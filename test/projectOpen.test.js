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

  before(async () => {
    app = await utils.beforeAll();
    TEST_FILE_PATH = await utils.getTestFiles();
  });

  beforeEach(async function() {
    await utils.beforeEachTest(this.currentTest);
  });

  afterEach(async () => {
    await tCore.dismissOldDialogs(utils.getTestFinished());
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

      it('should succeed open en_ult_php_text.zip and shows broken alignments, rename', async () => {
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
    }
  });
  
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
