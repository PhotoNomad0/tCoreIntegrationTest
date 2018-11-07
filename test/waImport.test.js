/* eslint-disable quotes,no-console */
const tCore = require('./tCoreSupport');
const utils = require('./utils');
const TCORE = require('./page-objects/elements');
const assert = require('assert');
const BIBLES = require('./fixtures/index.json');

let app;

describe('WA Acts', () => {
  const bookId = "act";
  let chapters = BIBLES[bookId];

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
      const languageId = "en";
      const continueOnProjectInfo = true;
      const projectSettings = {
        importPath: './test/fixtures/45-ACT.usfm',
        license: 'ccShareAlike',
        bookName: "Acts (act)",
        newTargetLangId,
        newLanguageId: languageId
      };
      assert.ok(chapters);
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.doLocalProjectImport(projectSettings, continueOnProjectInfo, projectName);
      await tCore.clickOn(TCORE.wordAlignment.launchButton);
      await app.client.pause(6000);
      await tCore.navigateDialog(TCORE.groupMenu.header);
      utils.testFinished();
    });
    
    for (let chapter = 1; chapter <= chapters.chapters; chapter++) {
      
      it('edit chapter ' + chapter, async () => {
        assert.ok(chapters);
        const verseCount = chapters[chapter];
        assert.ok(verseCount);
        await tCore.clickOn(TCORE.groupMenu.chapterN(chapter, 'c' + chapter));
        await app.client.pause(500);
        await tCore.clickOn(TCORE.wordAlignment.expandScripturePane);
        await app.client.pause(500);
        await tCore.navigateDialog(TCORE.expandedScripturePane);
        const scripturePaneTitle = await tCore.getText(TCORE.expandedScripturePane.title);
        log("scripturePaneTitle= " + scripturePaneTitle);
        await tCore.navigateDialog(TCORE.expandedScripturePane.verseRows);
        await tCore.navigateDialog(TCORE.expandedScripturePane.verseRowN(1, "verseRow 1"));

        for (let verse = 1; verse <= verseCount; verse++) {
          await app.client.pause(500);
          log("Editing verse " + verse);
          const editReason = [TCORE.verseEditor.reasonSpelling, TCORE.verseEditor.reasonPunctuation,
            TCORE.verseEditor.reasonWordChoice, TCORE.verseEditor.reasonMeaning,
            TCORE.verseEditor.reasonGrammar, TCORE.verseEditor.reasonOther][verse % 6];
          await tCore.clickOn(TCORE.expandedScripturePane.editN(verse, 'verse ' + verse));
          await tCore.navigateDialog(TCORE.verseEditor);
          await tCore.setValue(TCORE.verseEditor, chapter + ':' + verse +' - verse text ' + verse);
          await tCore.clickOn(TCORE.verseEditor.next);
          await tCore.clickOn(editReason);
          await tCore.clickOn(TCORE.verseEditor.save);
          log("Done editing verse " + verse);
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

