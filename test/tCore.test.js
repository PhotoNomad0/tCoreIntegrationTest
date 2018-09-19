/* eslint-disable quotes,no-console */
const fs = require('fs-extra');
const tCoreConnect = require('./tCoreConnect');
const Elements = require('./page-objects/elements');
var assert = require('assert');

let app;
let testCount = 0;
const navigationDelay = 500; // TODO: for slowing down for demo

describe('tCore Test', () => {
  beforeEach(async () => {
    testCount++;
    fs.removeSync(getLogFilePath());
    app = await tCoreConnect.startApp();
  });

  afterEach(async() => {
    await tCoreConnect.stopApp(app);
  });

  it('opens USFM import', async() => {
    await startTcore();
    await clickOn(Elements.projectNavigation);
    await clickOn(Elements.menuButton);
    // await clickOn(Elements.localImportButton);
    await clickOn(Elements.onlineImportButton);
    await navigateDialog(Elements.onlineDialog, 'cancel');

    await clickOn(Elements.onlineImportButton);
    await navigateDialog(Elements.onlineDialog, 'access_internet');

    await navigateDialog(Elements.onlineImportDialog, null); // make sure dialog shown
    // await setValue(Elements.onlineImportDialog.user, ''); // seems to be issue with setting to empty string
    await setValue(Elements.onlineImportDialog.user, 'tCore-test-data'); // seems to be issue with setting to empty string
    await setValue(Elements.onlineImportDialog.languageID, 'fr');
    // await navigateDialog(Elements.onlineImportDialog, 'search');
    await setValue(Elements.onlineImportDialog.enterURL, 'https://git.door43.org/tCore-test-data/fr_eph_text_ulb');
    await navigateDialog(Elements.onlineImportDialog, 'import', false);
    await navigateDialog(Elements.onlineDialog, 'access_internet');

    log("showing search");
    await app.client.pause(10000);
    await app.client.getTitle().should.equal('Five');
  });
});

//
// helpers
//

async function startTcore() {
  log("starting tCore");
  await app.client.pause(5000).waitUntilWindowLoaded()
    .getWindowCount()
    .should.eventually.have.at.least(1);
  await app.client.browserWindow.isVisible().should.eventually.equal(true);
  await app.client.windowByIndex(1).waitUntilWindowLoaded().getText(Elements.getStartedButton.selector).then(text => {
    log('The button text content is "' + text + '"');
  });
  await app.client.getText(Elements.versionLabel.selector).then(text => {
    log('**** App version "' + text + '" ****');
  });  
  await clickOn(Elements.getStartedButton);
}

/**
 * set value in input
 * @param {Object} elementObj - item to set
 * @param text
 * @return {Promise<void>}
 */
async function setValue(elementObj, text) {
  await app.client.pause(navigationDelay);
  log('setting "' + (elementObj.text || elementObj.id) + '" to "' + text + '"');
  //TODO: seems to fail with empty string
  await app.client.element(elementObj.selector).setValue(text);
  await app.client.pause(200);
  await app.client.getValue(elementObj.selector).should.eventually.equal(text);
}

/**
 * click on element
 * @param {Object} elementObj - item to click on
 * @param {boolean} exact - if true then do exact match, otherwise trim
 * @return {Promise<void>}
 */
async function clickOn(elementObj, exact = true) {
  await app.client.pause(navigationDelay);
  if (elementObj.text) {
    if (exact) {
      await app.client.getText(elementObj.selector).should.eventually.equal(elementObj.text);
    } else {
      await app.client.getText(elementObj.selector).then(text => { assert.equal((text || "").trim(), elementObj.text.trim());});
    }
  }
  log('clicking on "' + (elementObj.text || elementObj.id) + '"');
  await app.client.click(elementObj.selector);
}

async function waitForDialog(elementObj) {
  log('navigating "' + (elementObj.id) + '"');
  await app.client.pause(navigationDelay);
  await app.client.isVisible(elementObj.selector).should.eventually.equal(true);
  log('"' + (elementObj.id) + '" is visible');
}

/**
 * click on dialog button
 * @param {Object} elementObj - dialog element
 * @param {String} clickOn_ - selector to click on
 * @param {boolean} exact - if true then do exact match, otherwise trim
 * @return {Promise<void>}
 */
async function navigateDialog(elementObj, clickOn_, exact = true) {
  await waitForDialog(elementObj);
  if (clickOn_) {
    await clickOn(elementObj[clickOn_], exact);
  }
}

function getLogFilePath() {
  return `./log${testCount}.txt`;
}

function log(text) {
  const output = (new Date().toUTCString()) + ": " + text;
  console.log(output);
  const logPath = getLogFilePath();
  const current = fs.existsSync(logPath) ? fs.readFileSync(logPath) : "";
  fs.writeFileSync(logPath, current + output + "\n");
}

// /**
//  * Recursive function to ensure the correct text.
//  *
//  * This command is created in order to compensate the setValue() bug.
//  * The method (setValue) does not always set the correct value,
//  * sometimes it just misses some characters.
//  * This function sets each character at a time and recursively validates
//  * that the character is actually entered.
//  *
//  * @param {String} selector
//  *   The selector string to grab the element by.
//  * @param {String} text
//  *   The text that we want to set as a value.
//  */
// browser.addCommand('setValueSafe', (selector, text) => {
//
//   let
//
//     /**
//      * Tackle the even weirder decision of WebDriver.io trim the spaces
//      * of every property value. Even the "value" property's value.
//      * I understand this for class or href properties but not for value.
//      * You can see it here : https://github.com/webdriverio/webdriverio/blob/acdd79bff797b295d2196b3616facc9005b6f17d/lib/webdriverio.js#L463
//      *
//      * @param {String} elementId
//      *   ID of a WebElement JSON object of the current element.
//      *
//      * @return {String}
//      *   The value of the `value` attribute.
//      */
//     getActualText = elementId =>
//       browser
//         .elementIdAttribute(elementId, 'value')
//         .value
//     ,
//
//     /**
//      * Recursively sets the specified character.
//      *
//      * @param {String} elementId
//      *   ID of a WebElement JSON object of the current element.
//      * @param {String} text
//      *   The entire text to set.
//      * @param {Number} i
//      *   The index of the current iteration over the string.
//      */
//     setChar = (elementId, text, i) => {
//       const
//         currentChar  = text[i],
//         expectedText = text.slice(0, i + 1);
//
//       // Send keystroke.
//       browser.elementIdValue(elementId, currentChar);
//
//       // Wait for text to be actually entered. If fails - Recurse.
//       // When fails after 1000ms we assume the request was somehow destroyed
//       // so we activate again.
//       try {
//         browser
//           .waitUntil(() => getActualText(elementId) == expectedText, 1000, "failed", 16)
//       } catch (e) {
//         setChar(elementId, text, i);
//       }
//     };
//
//   // Get the ID of the selected elements WebElement JSON object.
//   const elementId = browser.element(selector).value.ELEMENT;
//
//   // Clear the input before entering new value.
//   browser.elementIdClear(elementId);
//   browser.waitUntil(() => getActualText(elementId) == '');
//
//   // Set each character of the text separately with setChar().
//   for (let i = 0; i < text.length; i++) {
//     setChar(elementId, text, i);
//   }
// });
