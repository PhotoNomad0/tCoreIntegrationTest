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

describe('Local Import Tests', () => {

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

  describe('Misc. Local Import Tests', () => {
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
          newTargetLangId,
          brokenAlignments: true
        };
        const projectName = `${newLanguageId}_${newTargetLangId}_${bookId}_book`;
        await tCore.doLocalProjectImport(projectSettings, continueOnProjectInfo, projectName);
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
