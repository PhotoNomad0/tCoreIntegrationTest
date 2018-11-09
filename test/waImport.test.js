/* eslint-disable quotes,no-console */
const tCore = require('./tCoreSupport');
const utils = require('./utils');
const TCORE = require('./page-objects/elements');
const assert = require('assert');
const BIBLE_SIZES = require('./fixtures/index.json');
const BooksOfTheBible = require('./BooksOfTheBible');

let app;

/**
 * does USFM import of project and then opens WA.  Then using expanded scripture pane edits each verse in each chapter.
 * on memory usage it looks like privateBytes follows the size of the Electron Helper
 */

describe.skip('WA Tests', () => {
  // const bookId = "act";
  // const importFile = '45-ACT.usfm';
  // const bookId = "tit";
  // const importFile = 'hi_test_tit.usfm';
  // const bookId = "act";
  // const importFile = '45-ACT.usfm';
  const bookId = "jud";
  const importFile = '66-JUD.usfm';
  const testCount = 2;
  
  const chapters = BIBLE_SIZES[bookId];
  const bookName = BooksOfTheBible.getAllBibleBooks()[bookId] + " (" + bookId + ")";
  console.log("bookName = " + bookName);
  
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

  for (let testNum = 1; testNum <= testCount; testNum++) {
    const baseTargetLangId = "zzx";
    const newTargetLangId = (baseTargetLangId + String.fromCharCode(64 + testNum)).toLowerCase();

    describe('WA ' + bookId, () => {
      it('does USFM import of ' + bookId + ' and opens WA, Test run = ' + testNum, async () => {
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

        it('edit chapter ' + chapter + ", Test run = " + testNum, async () => {
          log("Test run = " + testNum);
          assert.ok(chapters);
          const verseCount = chapters[chapter];
          assert.ok(verseCount);
          log("Chapter " + chapter + ", Number of verses= " + verseCount);
          await tCore.clickOnRetry(TCORE.groupMenu.chapterN(chapter, 'c' + chapter));
          await tCore.clickOnRetry(TCORE.wordAlignment.expandScripturePane);
          await app.client.pause(500);
          await tCore.navigateRetry(TCORE.expandedScripturePane);
          const scripturePaneTitle = await tCore.getText(TCORE.expandedScripturePane.title);
          log("scripturePaneTitle= " + scripturePaneTitle);
          await tCore.navigateRetry(TCORE.expandedScripturePane.verseRows);
          await tCore.navigateRetry(TCORE.expandedScripturePane.verseRowN(1, "verseRow 1"));
          let verseStartTime = new Date();
          let chapterStartTime = verseStartTime;
          const times = [];

          for (let verse = 1; verse <= verseCount; verse++) {
            log("Editing verse " + verse);
            const editReason = [TCORE.verseEditor.reasonSpelling, TCORE.verseEditor.reasonPunctuation,
              TCORE.verseEditor.reasonWordChoice, TCORE.verseEditor.reasonMeaning,
              TCORE.verseEditor.reasonGrammar, TCORE.verseEditor.reasonOther][verse % 6];
            await tCore.clickOnRetry(TCORE.expandedScripturePane.editN(verse, 'verse ' + verse));
            await tCore.navigateRetry(TCORE.verseEditor);
            await tCore.setValue(TCORE.verseEditor, chapter + ':' + verse + ' - verse text ' + verse);
            await tCore.clickOnRetry(TCORE.verseEditor.next);
            await tCore.clickOnRetry(editReason);
            await tCore.clickOnRetry(TCORE.verseEditor.save);
            log("Done editing verse " + verse);
            let verseEndTime = new Date();
            const elapsed = (verseEndTime - verseStartTime) / 1000;
            times.push(elapsed);
            log("Verse edit time " + elapsed + " seconds");
            verseStartTime = verseEndTime;
          }

          await tCore.clickOnRetry(TCORE.expandedScripturePane.close);
          let averageVerseEditTime = ((new Date()) - chapterStartTime) / 1000 / verseCount;
          log("Chapter " + chapter + " finished, Number of verses= " + verseCount);
          log("Average verse edit time " + round1(averageVerseEditTime) + " seconds");
          const min = round1(Math.min(...times));
          const max = round1(Math.max(...times));
          log("min/max verse edit times " + min + "/" + max + " seconds");

          utils.testFinished();
        }).timeout(1000000);
      }

      it('closes WA and back to projects page', async () => {
        await tCore.setToProjectPage(true);
        await app.client.pause(6000);
        utils.testFinished();
      });
    });
  }
});

//
// helpers
//

function round1(value) {
  return Math.round(value * 10) / 10; 
}

function log(text) {
  utils.log(text);
}

