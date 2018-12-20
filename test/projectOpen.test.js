/* eslint-disable quotes,no-console, no-unused-vars */
const assert = require('assert');
const path = require('path');
const fs = require('fs-extra');
const ospath = require('ospath');
const tCore = require('../src/helpers/tCoreSupport');
const utils = require('../src/helpers/utils');
const TCORE = require('./page-objects/elements');
const zipFileHelpers = require('../src/helpers/zipFileHelpers');

const TEST_PATH = path.join(ospath.home(), 'translationCore/testing');
const PROJECT_PATH = path.join(ospath.home(), 'translationCore/projects');
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
      it('should succeed open en_ult_php_text.zip and shows broken alignments, rename', async () => {
        const newTargetLangId = 'zult';
        const languageId = "en";
        const bookId = "php";
        const {bookName} = utils.getBibleData(bookId);
        const continueOnProjectInfo = true;
        const projectName = 'en_zult_php_book';
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
        await openProject(projectSettings, continueOnProjectInfo, newProjectName,);
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
        await openProject(projectSettings, continueOnProjectInfo, newProjectName,);
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
        await openProject(projectSettings, continueOnProjectInfo, newProjectName,);
        utils.testFinished();
      });
    }
  });
  
});

//
// helpers
//

/**
 * do an USFM import, export and compare test

 * @param projectSettings
 * @param continueOnProjectInfo
 * @param newProjectName
 * @return {Promise<void>}
 */
async function openProject(projectSettings, continueOnProjectInfo, newProjectName) {
  if (projectSettings.projectSource) {
    tCore.projectRemoval(projectSettings.projectName);
    tCore.projectRemoval(newProjectName);
    const unzipFolder = path.dirname(projectSettings.projectSource);
    const sourceProjectName = path.parse(projectSettings.projectSource).name;
    fs.removeSync(path.join(unzipFolder, sourceProjectName));
    fs.removeSync(path.join(unzipFolder, '__MACOSX'));
    await zipFileHelpers.extractZipFile(projectSettings.projectSource, unzipFolder);
    let unzippedProject = path.join(unzipFolder, sourceProjectName);
    if (fs.existsSync(path.join(unzippedProject, sourceProjectName))) { // see if nested
      unzippedProject = path.join(unzippedProject, sourceProjectName);
    }
    fs.copySync(unzippedProject, path.join(PROJECT_PATH, projectSettings.projectName));
    assert.ok(fs.existsSync(path.join(PROJECT_PATH, projectSettings.projectName)));
  }
  await tCore.clickOn(TCORE.userNavigation);
  await tCore.setToProjectPage();
  const cardNumber = await tCore.findProjectCardNumber(projectSettings.projectName);
  assert.ok(cardNumber > 1);

  await tCore.clickOnRetry(TCORE.projectsList.projectCardN(cardNumber).selectButton);

  if (projectSettings.license) {
    await tCore.navigateCopyrightDialog({license: projectSettings.license, continue: true});
  }
  
  if (!projectSettings.noProjectInfoDialog) {
    await tCore.navigateProjectInfoDialog({...projectSettings, continue: continueOnProjectInfo});
  }

  if (projectSettings.mergeConflicts) {
    await tCore.navigateMergeConflictDialog({continue: true});
  }

  if (projectSettings.missingVerses) {
    await tCore.navigateMissingVersesDialog({continue: true});
  }

  if (projectSettings.brokenAlignments) {
    await tCore.waitForDialog(TCORE.alignmentsResetDialog);
    const prompt = await tCore.getText(TCORE.alignmentsResetDialog.prompt);
    await tCore.verifyText(TCORE.alignmentsResetDialog.prompt, TCORE.alignmentsResetDialog.prompt.text);
    await tCore.navigateDialog(TCORE.alignmentsResetDialog, 'ok');
  }
  
  await tCore.navigateImportResults(continueOnProjectInfo, projectSettings, projectSettings.projectName);
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
