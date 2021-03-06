/* eslint-disable quotes,no-console */
const tCore = require('../src/helpers/tCoreSupport');
const utils = require('../src/helpers/utils');
const TCORE = require('./page-objects/elements');
const assert = require('assert');
const path = require('path');

let app;

/**
 * does USFM import of project and then opens WA.  Then using expanded scripture pane edits each verse in each chapter.
 * on memory usage it looks like privateBytes follows the size of the Electron Helper
 */

describe('WA Tests', () => {
  let TEST_FILE_PATH;
  
  before(async () => {
    app = await utils.beforeAll();
    TEST_FILE_PATH = await utils.getTestFiles();
  });

  beforeEach(async function() {
    await utils.beforeEachTest(this.currentTest);
  });

  afterEach(async () => {
    await utils.afterEachTest();
  });

  after(async() => {
    await utils.afterAll();
  });

  describe.skip('Scripture Pane testing', () => {
    const bookId = "jud", importFile = '66-JUD.usfm';
    const {chapters, bookName} = utils.getBibleData(bookId);

    it('does USFM import of ' + bookId + ' and opens WA', async () => {
      log("Loading '" + importFile + "' for testing");
      const newTargetLangId = 'zttt';
      const languageId = "en";
      const continueOnProjectInfo = true;
      const projectSettings = {
        importPath: path.join(TEST_FILE_PATH, importFile),
        license: 'ccShareAlike',
        bookName: bookName,
        newTargetLangId,
        newLanguageId: languageId
      };
      assert.ok(chapters);
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.doLocalProjectImport(projectSettings, continueOnProjectInfo, projectName);
      await tCore.launchWordAlignment();
      utils.testFinished();
    });

    it('test Scripture Pane', async () => {
      let success = true;
      await tCore.navigateRetry(TCORE.toolScripturePane);
      const panesCount = await tCore.getChildIndices(TCORE.toolScripturePane.panes);
      // log("Found " + panesCount.length + " panes in Scripture Panes");
      for (let i = 1, len = panesCount.length; i <= len; i++) {
        const paneText = await tCore.getText(TCORE.toolScripturePane.paneN(i));
        log("Pane " + i + ": " + paneText);
      }
      success = success && await tCore.validateScripturePane();
      await tCore.clickOnRetry(TCORE.toolScripturePane.closeN(1));
      await tCore.setToToolPage();
      await tCore.launchWordAlignment();
      // target language should be restored on restart
      success = success && await tCore.validateScripturePane();
      utils.testFinished(success);
    });
    
  });

  describe('Edit Tests', () => {
    const sources = [
      { bookId: "jud", importFile: '66-JUD.usfm' },
      { bookId: "tit", importFile: 'hi_test_tit.usfm' },
      { bookId: "act", importFile: '45-ACT.usfm' }
    ];

    const alignEachVerse = true; // alignment is still glitchy
    const closeOnEachEdit = true; // set this true for leak testing (makes it very slow)
    const testCount = 1; // set this count high to do leak testing
    let chapterCount = 0;
    let chapterFinished = 0;
    let verseAttemptedCount = 0;
    let versesFinished = 0;
    
    for (let testNum = 1; testNum <= testCount; testNum++) {
      const {bookId, importFile} = sources[(testNum - 1) % sources.length];
      const {chapters, bookName} = utils.getBibleData(bookId);
      const newTargetLangId = utils.generateTargetLanguageID(sources.length > 1 ? 0 : testNum % 2); // if repeatedly testing same project, alternate ids

      describe('Edit ' + bookId + ' in WA', () => {
        it('does USFM import of ' + bookId + ' and opens WA, Test run = ' + testNum, async () => {
          log("Loading '" + importFile + "' for testing");
          const languageId = "en";
          const continueOnProjectInfo = true;
          const projectSettings = {
            importPath: path.join(TEST_FILE_PATH, importFile),
            license: 'ccShareAlike',
            bookName: bookName,
            newTargetLangId,
            newLanguageId: languageId
          };
          assert.ok(chapters);
          const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
          await tCore.doLocalProjectImport(projectSettings, continueOnProjectInfo, projectName);
          await tCore.launchWordAlignment();
          utils.testFinished();
        });

        for (let chapter = 1; chapter <= chapters.chapters; chapter++) {

          it('edit chapter ' + chapter + ", Test run = " + testNum, async () => {
            log("Test run " + testNum + ", importFile '" + importFile + "'");
            chapterCount++;
            let success = true;
            await tCore.makeSureExpandedScripturePaneIsClosed();
            assert.ok(chapters);
            const verseCount = chapters[chapter];
            verseAttemptedCount += verseCount;
            assert.ok(verseCount);
            log("Chapter " + chapter + ", Number of verses= " + verseCount);
            await tCore.clickOnRetry(TCORE.groupMenuWA.chapterN(chapter, 'c' + chapter));
            let verseStartTime = new Date();
            let chapterStartTime = verseStartTime;
            const times = [];

            for (let verse = 1; verse <= verseCount; verse++) {
              log("Editing verse " + verse);
              
              if ((verse === 1) || closeOnEachEdit) {
                await tCore.clickOnRetry(TCORE.groupMenuWA.verseItemN(chapter, verse));
                const sourceCard = TCORE.wordAlignment.wordListCardN((verse % 3) + 1);
                await tCore.clickOnRetry(sourceCard);
                const cardOL = await tCore.getText(TCORE.wordAlignment.alignmentOL(3));
                log("cardOL= " + cardOL);
                
                // await app.client.dragAndDrop(sourceCard.selector,TCORE.wordAlignment.alignmentTargetDrop(1).selector);
                // await dragWordsToAlignment([2,3], 3);
                // await dragWordsToAlignment([1, 4], 2);
                // await dragWordsToAlignment([5, 6], 3);
                // await dragWordsToAlignment([7, 8], 1);
                // await app.client.pause(20000);
                // const visible = await tCore.isDialogVisible(TCORE.expandedScripturePane);

                await tCore.clickOnRetry(TCORE.wordAlignment.expandScripturePane);
                await app.client.pause(500);
                await tCore.navigateRetry(TCORE.expandedScripturePane);
                const scripturePaneTitle = await tCore.getText(TCORE.expandedScripturePane.title);
                log("scripturePaneTitle= " + scripturePaneTitle);
                await tCore.navigateRetry(TCORE.expandedScripturePane.verseRows);
              } else {
                await tCore.navigateRetry(TCORE.expandedScripturePane);
              }

              await tCore.navigateRetry(TCORE.expandedScripturePane.verseRowN(verse, "verseRow " + verse));
              const editReason = [TCORE.verseEditor.reasonSpelling, TCORE.verseEditor.reasonPunctuation,
                TCORE.verseEditor.reasonWordChoice, TCORE.verseEditor.reasonMeaning,
                TCORE.verseEditor.reasonGrammar, TCORE.verseEditor.reasonOther][verse % 6];
              await tCore.clickOnRetry(TCORE.expandedScripturePane.editN(verse, 'verse ' + verse));
              await tCore.navigateRetry(TCORE.verseEditor);
              const newText = chapter + ':' + verse + ' - verse text ' + verse;
              await tCore.setValue(TCORE.verseEditor, newText);
              await tCore.clickOnRetry(TCORE.verseEditor.next);
              await tCore.clickOnRetry(editReason);
              await tCore.clickOnRetry(TCORE.verseEditor.save);
              log("Done editing verse " + verse);
              const verifyText = await tCore.getText(TCORE.expandedScripturePane.verseTextN(verse, 1));
              const verseVerified = verifyText === newText;
              if (!verseVerified) {
                log("### verse miscompare ###");
                success = false;
              }

              if (alignEachVerse) {
                await tCore.clickOnRetry(TCORE.expandedScripturePane.close);
                await app.client.pause(500);
                await tCore.clickOnRetry(TCORE.groupMenu.verseItemN(chapter, verse));
                await app.client.pause(500);
                const sourceItems = [2];
                const destinationItem = 1;
                await dragWordsToAlignment(sourceItems, destinationItem);
                await app.client.pause(1000);
                await tCore.clickOnRetry(TCORE.wordAlignment.expandScripturePane);
                await app.client.pause(500);
                await tCore.navigateRetry(TCORE.expandedScripturePane);
              }

              if (closeOnEachEdit) {
                await tCore.clickOnRetry(TCORE.expandedScripturePane.close);
                await app.client.pause(500);
              }
              
              let verseEndTime = new Date();
              const elapsed = (verseEndTime - verseStartTime) / 1000;
              times.push(elapsed);
              log("Verse edit time " + elapsed + " seconds");
              verseStartTime = verseEndTime;
              await utils.logMemoryUsage();
              if (verseVerified) {
                versesFinished++;
              }
            }

            if (!closeOnEachEdit) {
              await tCore.clickOnRetry(TCORE.expandedScripturePane.close);
              await app.client.pause(500);
            }
            
            let averageVerseEditTime = ((new Date()) - chapterStartTime) / 1000 / verseCount;
            log("Chapter " + chapter + " finished, Number of verses= " + verseCount);
            log("Average verse edit time " + round1(averageVerseEditTime) + " seconds");
            const min = round1(Math.min(...times));
            const max = round1(Math.max(...times));
            log("min/max verse edit times " + min + "/" + max + " seconds");

            chapterFinished++;
            log("Completed " + chapterFinished + " of " + chapterCount + " total chapters");
            log("Completed " + versesFinished + " of " + verseAttemptedCount + " attempted verses");
            utils.testFinished(success);
          }).timeout(1000000);
        }

        it('closes WA and back to projects page', async () => {
          log("Test run '" + testNum + ", closing importFile '" + importFile + "'");
          // const logs = await app.client.getRenderProcessLogs();
          // log("Logs:\n" + JSON.stringify(logs, null, 2));
          const visible = await tCore.makeSureExpandedScripturePaneIsClosed();
          if (visible) {
            log("Expanded Scripture Pane left up");
          }
          await tCore.setToProjectPage();
          await app.client.pause(500);
          utils.testFinished(!visible);
        });
      });
    }
  });
});

//
// helpers
//

/**
 * finds the center coordinates of an element
 * @param {Object} elementObj - item to use
 * @param {String} name - optional name to use
 * @return {Promise<{x: number, y: number}>}
 */
async function getElementCenter(elementObj, name = null) {
  name = name || tCore.elementDescription(elementObj);
  let location = await app.client.getLocation(elementObj.selector);
  log(name + " Location: " + JSON.stringify(location));
  let size = await app.client.getElementSize(elementObj.selector);
  log(name + " Size: " + JSON.stringify(size));
  return { x: Math.round(location.x + size.width/2), y:  Math.round(location.y + size.height/2) };
}

/**
 * drag words to make alignment
 * @param {Number|Number[]} sourceItems - index or array of indices to drag
 * @param {Number} destinationItem - index to drop elements
 * @return {Promise<void>}
 */
async function dragWordsToAlignment(sourceItems, destinationItem) {
  if (!Array.isArray(sourceItems)) {
    sourceItems = [sourceItems];
  }
  const firstItem = sourceItems[0];
  sourceItems = sourceItems.reverse();
  for (let sourceItem of sourceItems) {
    const sourceCard = TCORE.wordAlignment.wordListCardN(sourceItem);
    log("Selecting word " + tCore.elementDescription(sourceCard));
    await tCore.clickOnRetry(sourceCard);
  }
  const sourceCard = TCORE.wordAlignment.wordListCardN(firstItem);
  const cardOlText = await tCore.getText(TCORE.wordAlignment.alignmentOL(destinationItem));
  log("Destination Alignment Text= " + cardOlText);
  const alignmentTarget = TCORE.wordAlignment.alignmentTargetDrop(destinationItem);
  // log("Dragging '" + tCore.elementDescription(sourceCard) + "' to '" + tCore.elementDescription(alignmentTarget) + "'");
  // await app.client.dragAndDrop(sourceCard.selector, alignmentTarget.selector);

  // const childIndexesArray = await tCore.getChildIndices(TCORE.wordAlignment.alignmentGridChildren);
  // for (let i of childIndexesArray) {
  //   await getElementCenter(TCORE.wordAlignment.alignmentN(i), "Drop " + i);
  // }
  // log("Dragging '" + tCore.elementDescription(sourceCard) + "' to '" + tCore.elementDescription(alignmentTarget) + "'");
  // const sourceLocation = await getElementCenter(sourceCard, "Drag");
  // log("Drag Center: " + JSON.stringify(sourceLocation));
  // const dropLocation = await getElementCenter(alignmentTarget, "Drop");
  // log("Drop Center: " + JSON.stringify(dropLocation));
  await app.client.pause(1000);

  // await tCore.clickOnRetry(sourceCard);
  // await app.client.moveToObject(sourceCard.selector);
  // await app.client.buttonDown(sourceCard.selector);
  // await app.client.moveToObject(alignmentTarget.selector);
  // await app.client.buttonUp(alignmentTarget.selector);
  // await tCore.clickOnRetry(alignmentTarget);
  // await app.client.pause(1000);
  
  // await app.client.touchDown(sourceLocation.x, sourceLocation.y);
  // await app.client.touchMove(dropLocation.x, dropLocation.y);
  // await app.client.touchUp(dropLocation.x, dropLocation.y);

  await app.client.dragAndDrop(sourceCard.selector, alignmentTarget.selector);
}

function round1(value) {
  return Math.round(value * 10) / 10; 
}

function log(text) {
  utils.log(text);
}

