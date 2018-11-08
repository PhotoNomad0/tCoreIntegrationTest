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

describe('WA Tests', () => {
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

  beforeEach(function() {
    utils.beforeEachTest(this.currentTest.title);
  });

  afterEach(() => {
    utils.afterEachTest();
  });

  after(async() => {
    await utils.afterAll();
  });

  for (let testNum = 1; testNum <= testCount; testNum++) {
    const baseTargetLangId = "zzx";
    const newTargetLangId = (baseTargetLangId + String.fromCharCode(64 + testNum)).toLowerCase();

    describe('WA ' + bookId, () => {
      it('does USFM import and opens WA', async () => {
        await logMemoryUsage();
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
        await logMemoryUsage();
        utils.testFinished();
      });

      for (let chapter = 1; chapter <= chapters.chapters; chapter++) {

        it('edit chapter ' + chapter, async () => {
          assert.ok(chapters);
          const verseCount = chapters[chapter];
          assert.ok(verseCount);
          await logMemoryUsage();
          log("Chapter " + chapter + ", Number of verses= " + verseCount);
          await clickOnRetry(TCORE.groupMenu.chapterN(chapter, 'c' + chapter));
          await clickOnRetry(TCORE.wordAlignment.expandScripturePane);
          await app.client.pause(500);
          await navigateRetry(TCORE.expandedScripturePane);
          const scripturePaneTitle = await tCore.getText(TCORE.expandedScripturePane.title);
          log("scripturePaneTitle= " + scripturePaneTitle);
          await navigateRetry(TCORE.expandedScripturePane.verseRows);
          await navigateRetry(TCORE.expandedScripturePane.verseRowN(1, "verseRow 1"));
          let verseStartTime = new Date();
          let chapterStartTime = verseStartTime;
          const times = [];

          for (let verse = 1; verse <= verseCount; verse++) {
            log("Editing verse " + verse);
            const editReason = [TCORE.verseEditor.reasonSpelling, TCORE.verseEditor.reasonPunctuation,
              TCORE.verseEditor.reasonWordChoice, TCORE.verseEditor.reasonMeaning,
              TCORE.verseEditor.reasonGrammar, TCORE.verseEditor.reasonOther][verse % 6];
            await clickOnRetry(TCORE.expandedScripturePane.editN(verse, 'verse ' + verse));
            await navigateRetry(TCORE.verseEditor);
            await tCore.setValue(TCORE.verseEditor, chapter + ':' + verse + ' - verse text ' + verse);
            await clickOnRetry(TCORE.verseEditor.next);
            await clickOnRetry(editReason);
            await clickOnRetry(TCORE.verseEditor.save);
            log("Done editing verse " + verse);
            let verseEndTime = new Date();
            const elapsed = (verseEndTime - verseStartTime) / 1000;
            times.push(elapsed);
            log("Verse edit time " + elapsed + " seconds");
            verseStartTime = verseEndTime;
          }

          await clickOnRetry(TCORE.expandedScripturePane.close);
          let averageVerseEditTime = ((new Date()) - chapterStartTime) / 1000 / verseCount;
          log("Chapter " + chapter + " finished, Number of verses= " + verseCount);
          log("Average verse edit time " + round1(averageVerseEditTime) + " seconds");
          const min = round1(Math.min(...times));
          const max = round1(Math.max(...times));
          log("min/max verse edit times " + min + "/" + max + " seconds");
          await logMemoryUsage();

          utils.testFinished();
        }).timeout(1000000);
      }

      it('closes WA and back to projects page', async () => {
        await logMemoryUsage();
        await tCore.setToProjectPage(true);
        await app.client.pause(6000);
        await logMemoryUsage();
        utils.testFinished();
      });
    });
  }
});

//
// helpers
//

async function logMemoryUsage() {
  const usage = await app.rendererProcess.getProcessMemoryInfo();
  log("Memory Usage: " + JSON.stringify(usage, null, 2));
}

function round1(value) {
  return Math.round(value * 10) / 10; 
}

async function clickOnRetry(elementObj, count = 10, delay = 500) {
  await retryStep(count, async () => {
    await tCore.clickOn(elementObj);
  }, "clicking on " + (elementObj.text || elementObj.id),
  delay);
}

async function navigateRetry(elementObj, count = 10, delay = 500) {
  await retryStep(count, async () => {
    app.client.waitForExist(elementObj.selector, 5000);
  }, "waiting for " + (elementObj.text || elementObj.id),
  delay);
  await tCore.navigateDialog(elementObj);
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

