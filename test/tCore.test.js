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
    testName = this.currentTest.title;
    // console.log('beforeEach', testName);
    tCore.initializeTest(app, ++testCount, navigationDelay);
    fs.removeSync(tCore.getLogFilePath());
    tCore.logVersion();
    log('Test Name: "' + testName + '"');
  });

  afterEach(async() => {
    log("Test Ended");
  });
  
  after(async() => {
    await tCoreConnect.stopApp(app);
  });

  it('do online import access cancel', async() => {
    await tCore.setToProjectPage();
    await tCore.openImportDialog(Elements.importTypeOptions.online);
    await tCore.navigateDialog(Elements.onlineDialog, 'cancel');
    await tCore.clickOn(Elements.importMenuButton.close);
    await tCore.verifyOnSpecificPage(Elements.projectsPage);
    log("#### Finished Test ####");
  });

  it('do online search', async() => {
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

  it('do online import with cancel', async() => {
    const newTargetLangId = "zzzz";
    const sourceProject = 'https://git.door43.org/tCore-test-data/AlignedUlt_en';
    const settings_en_tit_algn = {
      targetLangId: "algn",
      languageName: "English",
      languageId: "en",
      resourceId: "",
      languageDirectionLtr: true,
      bookName: "Titus (tit)"
    };
    const continueOnProjectInfo = false;
    const projectName = `${settings_en_tit_algn.languageId}_${newTargetLangId}_tit_book`;
    await tCore.doOnlineProjectImport(projectName, sourceProject, newTargetLangId, continueOnProjectInfo, settings_en_tit_algn);
    log("#### Finished Test ####");
  });

  it('do online import', async() => {
    const newTargetLangId = "zzzz";
    const sourceProject = 'https://git.door43.org/tCore-test-data/AlignedUlt_en';
    const settings_en_tit_algn = {
      targetLangId: "algn",
      languageName: "English",
      languageId: "en",
      resourceId: "",
      languageDirectionLtr: true,
      bookName: "Titus (tit)"
    };
    const continueOnProjectInfo = true;
    const projectName = `${settings_en_tit_algn.languageId}_${newTargetLangId}_tit_book`;
    await tCore.doOnlineProjectImport(projectName, sourceProject, newTargetLangId, continueOnProjectInfo, settings_en_tit_algn);
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

//
// helpers
//

function log(text) {
  tCore.log(text);
}
