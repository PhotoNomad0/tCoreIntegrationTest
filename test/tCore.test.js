/* eslint-disable quotes,no-console */
const fs = require('fs-extra');
const tCoreConnect = require('./tCoreConnect');
const Elements = require('./page-objects/elements');
const _ = require('lodash');
const assert = require('assert');
const tCore = require('./tCoreSupport');

let app;
let testCount = 0;
const navigationDelay = 500; // TODO: for slowing down for demo

describe('tCore Test', () => {
  let testName;
  
  before(async () => {
    tCore.initializeTest(app, testCount, navigationDelay);
    fs.removeSync(tCore.getLogFilePath());
    app = await tCoreConnect.startApp();
    tCore.initializeTest(app, testCount, navigationDelay);
    await tCore.startTcore();
  });

  beforeEach(function() {
    beforEachTest.call(this, testName);
  });

  afterEach(() => {
    afterEachTest();
  });

  after(async() => {
    await tCoreConnect.stopApp(app);
    const cleanupFiles = tCore.getCleanupFileList();
    for (let file of cleanupFiles) {
      console.log("Cleaning out: " + file);
      fs.removeSync(file);
    }
  });

  describe.skip('Misc. Tests', () => {
    it('do online import access cancel', async () => {
      await tCore.setToProjectPage();
      await tCore.openImportDialog(Elements.importTypeOptions.online);
      await tCore.navigateDialog(Elements.onlineDialog, 'cancel');
      await tCore.clickOn(Elements.importMenuButton.close);
      await tCore.verifyOnSpecificPage(Elements.projectsPage);
      log("#### Finished Test ####");
    });

    it('do online search', async () => {
      let searchResults;
      await tCore.setToProjectPage();
      await tCore.openImportDialog(Elements.importTypeOptions.online);
      await tCore.navigateDialog(Elements.onlineDialog, 'access_internet');

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

      await tCore.navigateDialog(Elements.onlineImportDialog, 'cancel');
      await tCore.verifyOnSpecificPage(Elements.projectsPage);
      log("#### Finished Test ####");
    });

    it('do online import with cancel on Project Info', async () => {
      const newTargetLangId = "zzzx";
      const sourceProject = 'https://git.door43.org/tCore-test-data/AlignedUlt_en';
      const projectInfoSettings = {
        targetLangId: "algn",
        languageName: "English",
        languageId: "en",
        resourceId: "",
        languageDirectionLtr: true,
        bookName: "Titus (tit)",
        newTargetLangId
      };
      const continueOnProjectInfo = false;
      const projectName = `${projectInfoSettings.languageId}_${newTargetLangId}_tit_book`;
      await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
      log("#### Finished Test ####");
    });
    
    // disabled because we don't have a way to interact with file system dialog
    it.skip('opens USFM import', async() => {
      await tCore.startTcore();
      await tCore.clickOn(Elements.projectNavigation);
      await tCore.clickOn(Elements.menuButton);
      await tCore.clickOn(Elements.localImportButton);

      log("showing search");
      await app.client.pause(10000);
    });
  });

  describe('Import Tests', () => {
    it('online import should succeed - https://git.door43.org/tCore-test-data/AlignedUlt_en', async () => {
      const newTargetLangId = "zzzz";
      const sourceProject = 'https://git.door43.org/tCore-test-data/AlignedUlt_en';
      const projectInfoSettings = {
        targetLangId: "algn",
        languageName: "English",
        languageId: "en",
        resourceId: "",
        languageDirectionLtr: true,
        bookName: "Titus (tit)",
        newTargetLangId
      };
      const continueOnProjectInfo = true;
      const projectName = `${projectInfoSettings.languageId}_${newTargetLangId}_tit_book`;
      await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
      log("#### Finished Test ####");
    });

    it('online import error - https://git.door43.org/tCore-test-data/AlignedUlb_hi', async () => {
      const newTargetLangId = "zzzy";
      const sourceProject = "https://git.door43.org/tCore-test-data/AlignedUlb_hi";
      const projectInfoSettings = {
        newLanguageId: "en",
        newBookName: "57-TIT",
        newTargetLangId,
        errorMessage: "Error occurred while importing your project.\nCould not download the project from https://git.door43.org/tCore-test-data/AlignedUlb_hi to "
      };
      const continueOnProjectInfo = true;
      const projectName = `${projectInfoSettings.newLanguageId}_${newTargetLangId}_tit_book`;
      await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
      log("#### Finished Test ####");
    });
  });

});

//
// helpers
//

function log(text) {
  tCore.log(text);
}

function beforEachTest(testName) {
  testName = this.currentTest.title;
  // console.log('beforeEach', testName);
  tCore.initializeTest(app, ++testCount, navigationDelay);
  fs.removeSync(tCore.getLogFilePath());
  tCore.logVersion();
  log('Test Name: "' + testName + '"');
}

function afterEachTest() {
  log("Test Ended");
}
