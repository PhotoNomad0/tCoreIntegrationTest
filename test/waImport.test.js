/* eslint-disable quotes,no-console */
const tCore = require('./tCoreSupport');
const utils = require('./utils');
const TCORE = require('./page-objects/elements');

let app;

describe('tCore Test', () => {
  const verses = [16, 15, 15];
  
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
    it('does USFM import and opens WA', async () => {
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
      utils.testFinished();
    });
    
    for (let chapter = 1; chapter <= verses.length; chapter++) {
      it('edit chapter ' + chapter, async () => {
        await tCore.clickOn(TCORE.groupMenu.chapterN(chapter, 'c' + chapter));
        await app.client.pause(500);
        await tCore.clickOn(TCORE.wordAlignment.expandScripturePane);
        await app.client.pause(500);
        await tCore.navigateDialog(TCORE.expandedScripturePane);
        const scripturePaneTitle = await tCore.getText(TCORE.expandedScripturePane.title);
        log("scripturePaneTitle= " + scripturePaneTitle);
        await tCore.navigateDialog(TCORE.expandedScripturePane.verseRows);
        await tCore.navigateDialog(TCORE.expandedScripturePane.verseRowN(1, "verseRow 1"));
        const verseCount = verses[chapter - 1];
        for (let verse = 1; verse <= verseCount; verse++) {
          await app.client.pause(500);
          const editReason = [TCORE.verseEditor.reasonSpelling, TCORE.verseEditor.reasonPunctuation,
            TCORE.verseEditor.reasonWordChoice, TCORE.verseEditor.reasonMeaning,
            TCORE.verseEditor.reasonGrammar, TCORE.verseEditor.reasonOther][verse % 6];
          await tCore.clickOn(TCORE.expandedScripturePane.editN(verse, 'verse ' + verse));
          await tCore.setValue(TCORE.verseEditor, chapter + ':' + verse +' - verse text ' + verse);
          await tCore.clickOn(TCORE.verseEditor.next);
          await tCore.clickOn(editReason);
          await tCore.clickOn(TCORE.verseEditor.save);
        }
        await tCore.clickOn(TCORE.expandedScripturePane.close);
        utils.testFinished();
      }).timeout(100000);
    }
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

