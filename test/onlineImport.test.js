/* eslint-disable quotes,no-console */
const TCORE = require('./page-objects/elements');
const _ = require('lodash');
const assert = require('assert');
const tCore = require('./tCoreSupport');
const utils = require('./utils');

let app;

describe.skip('tCore Test', () => {

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
  
  describe.skip('Misc. Tests', () => {
    it('do online import access cancel', async () => {
      await tCore.setToProjectPage();
      await tCore.openImportDialog(TCORE.importTypeOptions.online);
      await tCore.navigateDialog(TCORE.onlineDialog, 'cancel');
      await tCore.clickOn(TCORE.importMenuButton.close);
      await tCore.verifyOnSpecificPage(TCORE.projectsPage);
      utils.testFinished();
    });

    it('do online search', async () => {
      let searchResults;
      await tCore.setToProjectPage();
      await tCore.openImportDialog(TCORE.importTypeOptions.online);
      await tCore.navigateDialog(TCORE.onlineDialog, 'access_internet');

      // get initial results
      const importConfigInitial = {
        import: false,
        waitForInitialSearchCompletion: true
      };
      await tCore.navigateOnlineImportDialog(importConfigInitial);
      // searchResults = await getSearchResults();
      // log("searchResults: " + JSON.stringify(searchResults, null, 2));

      // do search
      const importConfig = {
        user: 'tCore-test-data',
        languageID: 'fr',
        import: false,
        search: true
      };
      await tCore.navigateOnlineImportDialog(importConfig);
      searchResults = await tCore.getSearchResults();
      log("searchResults: " + JSON.stringify(searchResults, null, 2));
      const index = tCore.indexInSearchResults(searchResults, "fr_ulb_tit_book");
      assert.equal(index >= 0, true);
      await tCore.selectSearchItem(index, 'https://git.door43.org/tCore-test-data/fr_ulb_tit_book');

      searchResults = await tCore.getSearchResults();
      // log("searchResults: " + JSON.stringify(searchResults, null, 2));

      await tCore.navigateDialog(TCORE.onlineImportDialog, 'cancel');
      await tCore.verifyOnSpecificPage(TCORE.projectsPage);
      utils.testFinished();
    });

    it('do online import with cancel on Project Info', async () => {
      const newTargetLangId = "zzzz";
      const sourceProject = 'https://git.door43.org/tCore-test-data/AlignedUlt_en';
      const languageId = "en";
      const bookId = "tit";
      const projectInfoSettings = {
        targetLangId: "algn",
        languageName: "English",
        languageId,
        resourceId: "",
        languageDirectionLtr: true,
        bookName: "Titus (tit)",
        newTargetLangId
      };
      const continueOnProjectInfo = false;
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
      utils.testFinished();
    });

  });

  describe('Import Tests', () => {
    it('online import tCore should succeed - https://git.door43.org/tCore-test-data/AlignedUlt_en', async () => {
      const newTargetLangId = "zzzz";
      const sourceProject = 'https://git.door43.org/tCore-test-data/AlignedUlt_en';
      const languageId = "en";
      const bookId = "tit";
      const projectInfoSettings = {
        targetLangId: "algn",
        languageName: "English",
        languageId,
        resourceId: "",
        languageDirectionLtr: true,
        bookName: "Titus (tit)",
        newTargetLangId
      };
      const continueOnProjectInfo = true;
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
      utils.testFinished();
    });

    it('online import USFM should error - https://git.door43.org/tCore-test-data/AlignedUlb_hi', async () => {
      const newTargetLangId = "zzzy";
      const sourceProject = "https://git.door43.org/tCore-test-data/AlignedUlb_hi";
      const languageId = "hi";
      const bookId = "tit";
      const projectInfoSettings = {
        newLanguageId: languageId,
        newBookName: "57-TIT",
        newTargetLangId,
        preProjectInfoErrorMessage: "Error occurred while importing your project.\nCould not download the project from https://git.door43.org/tCore-test-data/AlignedUlb_hi to "
      };
      const continueOnProjectInfo = true;
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
      utils.testFinished();
    });

    it('online import ts-desktop should succeed - https://git.door43.org/tCore-test-data/es-419_eph_text_ulb', async () => {
      const newTargetLangId = "zzzx";
      const sourceProject = "https://git.door43.org/tCore-test-data/es-419_eph_text_ulb";
      const languageId = "es-419";
      const bookId = "eph";
      const projectInfoSettings = {
        targetLangId: "ulb",
        languageName: "Español Latin America",
        languageId,
        resourceId: "Unlocked Literal Bible",
        languageDirectionLtr: true,
        bookName: "Ephesians (eph)",
        newTargetLangId
      };
      const continueOnProjectInfo = true;
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
      utils.testFinished();
    });
    
    it('online import tc-desktop 0.7.0 with checking should error - https://git.door43.org/tCore-test-data/sw_tit_text_ulb_L3', async () => {
      const newTargetLangId = "zzzw";
      const sourceProject = "https://git.door43.org/tCore-test-data/sw_tit_text_ulb_L3";
      const languageId = "sw";
      const bookId = "tit";
      const projectInfoSettings = {
        preProjectInfoErrorMessage: "This project contains data from an old version of translationCore which is not supported in this release. For help opening this project or to restart checking, please contact help@door43.org."
      };
      const continueOnProjectInfo = true;
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
      utils.testFinished();
    });

    it('online import tc-desktop pre-0.7.0 with checking should error - https://git.door43.org/tCore-test-data/ceb_jas_text_ulb_L-', async () => {
      const newTargetLangId = "zzzv";
      const sourceProject = "https://git.door43.org/tCore-test-data/ceb_jas_text_ulb_L-";
      const languageId = "ceb";
      const bookId = "jas";
      const projectInfoSettings = {
        preProjectInfoErrorMessage: "This project contains data from an old version of translationCore which is not supported in this release. For help opening this project or to restart checking, please contact help@door43.org."
      };
      const continueOnProjectInfo = true;
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
      utils.testFinished();
    });

    it('online import tc-desktop 0.7.0 no checking should succeed - https://git.door43.org/tCore-test-data/ar_mat_text_ulb', async () => {
      const newTargetLangId = "zzzu";
      const sourceProject = "https://git.door43.org/tCore-test-data/ar_mat_text_ulb";
      const languageId = "ar";
      const bookId = "mat";
      const projectInfoSettings = {
        targetLangId: "ulb",
        languageName: "العربية",
        languageId,
        resourceId: "Unlocked Literal Bible",
        languageDirectionLtr: false,
        bookName: "Matthew (mat)",
        newTargetLangId
      };
      const continueOnProjectInfo = true;
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
      utils.testFinished();
    });
    
    it('online import tc-desktop 0.8.0 no checking should succeed - https://git.door43.org/tCore-test-data/es-419_luk', async () => {
      const newTargetLangId = "zzzt";
      const sourceProject = "https://git.door43.org/tCore-test-data/es-419_luk";
      const languageId = "es-419";
      const bookId = "luk";
      const projectInfoSettings = {
        targetLangId: "ulb",
        languageName: "es-419",
        languageId,
        resourceId: "Unlocked Literal Bible",
        languageDirectionLtr: true,
        bookName: "Luke (luk)",
        newTargetLangId,
        missingVerses: true
      };
      const continueOnProjectInfo = true;
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
      utils.testFinished();
    });

    it('online import tc-desktop 0.8.0 with checking should succeed - https://git.door43.org/tCore-test-data/es-419_tit_ulb', async () => {
      const newTargetLangId = "zzzs";
      const sourceProject = "https://git.door43.org/tCore-test-data/es-419_tit_ulb";
      const languageId = "es-419";
      const bookId = "tit";
      const projectInfoSettings = {
        targetLangId: "ulb",
        languageName: "Español Latin America",
        languageId,
        resourceId: "Unlocked Literal Bible",
        languageDirectionLtr: true,
        bookName: "Titus (tit)",
        newTargetLangId,
        missingVerses: true
      };
      const continueOnProjectInfo = true;
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
      utils.testFinished();
    });
    
    it('online import tc-desktop 0.8.1 with alignment, no checking should succeed - https://git.door43.org/tCore-test-data/English_tit', async () => {
      const newTargetLangId = "zzzs";
      const sourceProject = "https://git.door43.org/tCore-test-data/English_tit";
      const languageId = "en";
      const bookId = "tit";
      const projectInfoSettings = {
        languageName: "English",
        languageId,
        languageDirectionLtr: true,
        bookName: "Titus (tit)",
        newTargetLangId
      };
      const continueOnProjectInfo = true;
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
      utils.testFinished();
    });

    it('online import tc-desktop 0.9.0 no checking should succeed - https://git.door43.org/tCore-test-data/am_1co_ulb', async () => {
      const newTargetLangId = "zzzr";
      const sourceProject = "https://git.door43.org/tCore-test-data/am_1co_ulb";
      const languageId = "am";
      const bookId = "1co";
      const projectInfoSettings = {
        targetLangId: "ulb",
        languageName: "አማርኛ",
        languageId,
        resourceId: "Unlocked Literal Bible",
        languageDirectionLtr: true,
        bookName: "1 Corinthians (1co)",
        newTargetLangId
      };
      const continueOnProjectInfo = true;
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
      utils.testFinished();
    });

    it('online import tc-desktop 0.9.0 with checking should succeed - https://git.door43.org/tCore-test-data/el_tit', async () => {
      const newTargetLangId = "zzzq";
      const sourceProject = "https://git.door43.org/tCore-test-data/el_tit";
      const languageId = "el";
      const bookId = "tit";
      const projectInfoSettings = {
        languageName: "ελληνικά",
        languageId,
        languageDirectionLtr: true,
        bookName: "Titus (tit)",
        newTargetLangId
      };
      const continueOnProjectInfo = true;
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
      utils.testFinished();
    });

    it('online import tc-desktop should succeed - https://git.door43.org/tCore-test-data/fr_test_tit_book', async () => {
      const newTargetLangId = "zzzp";
      const sourceProject = "https://git.door43.org/tCore-test-data/fr_test_tit_book";
      const languageId = "fr";
      const bookId = "tit";
      const projectInfoSettings = {
        languageName: "français",
        languageId,
        resourceId: "Unlocked Literal Bible",
        targetLangId: "test",
        languageDirectionLtr: true,
        bookName: "Titus (tit)",
        newTargetLangId
      };
      const continueOnProjectInfo = true;
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
      utils.testFinished();
    });

    it('online import tc-desktop should succeed - https://git.door43.org/tCore-test-data/AlignedUlt_en', async () => {
      const newTargetLangId = "zzzo";
      const sourceProject = "https://git.door43.org/tCore-test-data/AlignedUlt_en";
      const languageId = "en";
      const bookId = "tit";
      const projectInfoSettings = {
        languageName: "English",
        languageId,
        targetLangId: "algn",
        languageDirectionLtr: true,
        bookName: "Titus (tit)",
        newTargetLangId
      };
      const continueOnProjectInfo = true;
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
      utils.testFinished();
    });

    it('online import tc-desktop should succeed, no rename - https://git.door43.org/tCore-test-data/fr_test_tit_book', async () => {
      const sourceProject = "https://git.door43.org/tCore-test-data/fr_test_tit_book";
      const languageId = "fr";
      const bookId = "tit";
      const projectInfoSettings = {
        languageName: "français",
        languageId,
        resourceId: "Unlocked Literal Bible",
        targetLangId: "test",
        languageDirectionLtr: true,
        bookName: "Titus (tit)",
        noRename: true
      };
      const continueOnProjectInfo = true;
      const projectName = `${languageId}_${projectInfoSettings.targetLangId}_${bookId}_book`;
      await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
      utils.testFinished();
    });

  });
  
});

//
// helpers
//

function log(text) {
  utils.log(text);
}
