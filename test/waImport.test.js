/* eslint-disable quotes,no-console */
const tCore = require('./tCoreSupport');
const utils = require('./utils');
const TCORE = require('./page-objects/elements');
const assert = require('assert');
const BIBLE_SIZES = require('./fixtures/index.json');
const BooksOfTheBible = require('./BooksOfTheBible');

let app;

describe('WA Tests', () => {
  // const bookId = "act";
  // const importFile = '45-ACT.usfm';
  const bookId = "tit";
  const importFile = 'hi_test_tit.usfm';
  
  const chapters = BIBLE_SIZES[bookId];
  const bookName = BooksOfTheBible.getAllBibleBooks()[bookId] + " (" + bookId + ")";
  console.log("bookName = " + bookName);

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

  describe('WA ' + bookId, () => {
    it('does USFM import and opens WA', async () => {
      const newTargetLangId = "zzyz";
      const languageId = "en";
      const continueOnProjectInfo = true;
      const projectSettings = {
        importPath: './test/fixtures/' + importFile,
        license: 'ccShareAlike',
        bookName: bookName,
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
        await clickOnRetry(TCORE.groupMenu.chapterN(chapter, 'c' + chapter));
        await clickOnRetry(TCORE.wordAlignment.expandScripturePane);
        await app.client.pause(500);
        await tCore.navigateDialog(TCORE.expandedScripturePane);
        const scripturePaneTitle = await tCore.getText(TCORE.expandedScripturePane.title);
        log("scripturePaneTitle= " + scripturePaneTitle);
        await tCore.navigateDialog(TCORE.expandedScripturePane.verseRows);
        await tCore.navigateDialog(TCORE.expandedScripturePane.verseRowN(1, "verseRow 1"));
        let verseStartTime = new Date();
        let chapterStartTime = verseStartTime;

        for (let verse = 1; verse <= verseCount; verse++) {
          log("Editing verse " + verse);
          const editReason = [TCORE.verseEditor.reasonSpelling, TCORE.verseEditor.reasonPunctuation,
            TCORE.verseEditor.reasonWordChoice, TCORE.verseEditor.reasonMeaning,
            TCORE.verseEditor.reasonGrammar, TCORE.verseEditor.reasonOther][verse % 6];
          await clickOnRetry(TCORE.expandedScripturePane.editN(verse, 'verse ' + verse));
          await tCore.navigateDialog(TCORE.verseEditor);
          await tCore.setValue(TCORE.verseEditor, chapter + ':' + verse +' - verse text ' + verse);
          await clickOnRetry(TCORE.verseEditor.next);
          await clickOnRetry(editReason);
          await clickOnRetry(TCORE.verseEditor.save);
          log("Done editing verse " + verse);
          let verseEndTime = new Date();
          log("Verse edit time " + (verseEndTime - verseStartTime) / 1000 + " seconds");
          verseStartTime = verseEndTime;
        }  

        await clickOnRetry(TCORE.expandedScripturePane.close);
        let averageVerseEditTime = ((new Date()) - chapterStartTime) / 1000 / verseCount;
        log("Average verse edit time " + Math.round(averageVerseEditTime) + " seconds");

        utils.testFinished();
      }).timeout(250000);
    }
  });
});

//
// helpers
//

async function clickOnRetry(elementObj, count = 10, delay = 500) {
  await retryStep(count, async () => {
    await tCore.clickOn(elementObj);
  }, "clicking on " + (elementObj.text || elementObj.id), 
  delay);
}

async function retryStep(count, operation, name, delay = 500) {
  let success = false;
  for (let i = 0; i < count; i++) {
    log(name + ", step= " + (i + 1));
    success = false;
    try {
      await operation();
      success = true;
    } catch (e) {
      log(name + ", failed step " + (i + 1));
      success = false;
      await app.client.pause(delay);
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

