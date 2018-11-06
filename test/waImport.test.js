/* eslint-disable quotes,no-console */
const tCore = require('./tCoreSupport');
const utils = require('./utils');
const TCORE = require('./page-objects/elements');

let app;

describe('tCore Test', () => {
  
  before(async () => {
    app = await utils.beforeAll();
  });

  beforeEach(function() {
    utils.beforeEachTest(this.currentTest.title);
  });

  afterEach(() => {
    utils.afterEachTest();
  });

  after(async() => {
    await utils.afterAll();
  });

  describe('WA Tests', () => {
    it('opens USFM import', async () => {
      const newTargetLangId = "zzyz";
      const languageId = "hi";
      const bookId = "tit";
      const continueOnProjectInfo = true;
      const projectSettings = {
        importPath: './test/fixtures/hi_test_tit.usfm',
        license: 'ccShareAlike',
        languageName: "Hindi",
        languageId,
        languageDirectionLtr: true,
        bookName: "Titus (tit)",
        newTargetLangId,
      };
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.doLocalProjectImport(projectSettings, continueOnProjectInfo, projectName);
      await tCore.clickOn(TCORE.wordAlignment.launchButton);
      await app.client.pause(6000);
      await tCore.navigateDialog(TCORE.groupMenu.header);
      await retryStep(10, async () => {
        tCore.clickOn(TCORE.wordAlignment.expandScripturePane);
      }, "clicking expandScripturePane");
      await app.client.pause(3000);
      await tCore.navigateDialog(TCORE.expandedScripturePane);
      const scripturePaneTitle = await tCore.getText(TCORE.expandedScripturePane.title);
      log("scripturePaneTitle= " + scripturePaneTitle);
      await tCore.navigateDialog(TCORE.expandedScripturePane.verseRows);
      await tCore.navigateDialog(TCORE.expandedScripturePane.verseRowN(1, "verseRow 1"));
      await tCore.clickOn(TCORE.expandedScripturePane.editN(2, 'v2'));
      await app.client.pause(7000);
      utils.testFinished();
    });
  });
});

//
// helpers
//

async function retryStep(count, operation, name) {
  let success = false;
  for (let i = 0; i < count; i++) {
    log(name + ", step= " + (i + 1));
    success = false;
    try {
      await operation();
      success = true;
    } catch (e) {
      success = false;
    }
    if (success) {
      log(name + ", finished in step " + (i + 1));
      break;
    }
  }
  if (!success) {
    log(name + ", Failed!");
  }
}

function log(text) {
  utils.log(text);
}

