/* eslint-disable quotes,no-console */
const fs = require('fs-extra');
const _ = require('lodash');
const tCore = require('./tCoreSupport');
const tCoreConnect = require('./tCoreConnect');
const BIBLE_SIZES = require('./fixtures/index.json');
const BooksOfTheBible = require('./BooksOfTheBible');

let testCount = 0;
const navigationDelay = 500; // TODO: for slowing down for demo
let finished = false;
let app;
let testName;
let testStartTime = 0;
let testEndTime = 0;
const maxMemory = 2624132; // this limit seems to be little different on each run.  Don't know how the limit is determined.
let initialMemoryUsage = 0;


//
// helpers
//

function log(text) {
  tCore.log(text);
}

function testFinished() {
  log("test finished");
  finished = true;
}

/**
 * look up size of book and name of book
 * @param bookId
 * @return {{chapters: *, bookName: string}}
 */
function getBibleData(bookId) {
  const chapters = _.cloneDeep(BIBLE_SIZES[bookId]);
  const bookName = BooksOfTheBible.getAllBibleBooks()[bookId] + " (" + bookId + ")";
  return {chapters, bookName};
}

function generateTargetLanguageID(testCount) {
  let major = 0;
  let minor = testCount;
  if (minor > 25) {
    major = minor / 26;
    minor = minor % 26;
  }
  const newTargetLangId = ("zt" + String.fromCharCode(97 + major) + String.fromCharCode(97 + minor)).toLowerCase();
  return newTargetLangId;
}

async function logMemoryUsage() {
  const usage = await app.rendererProcess.getProcessMemoryInfo();
  const memoryUsage = usage.privateBytes;
  if (!initialMemoryUsage) {
    initialMemoryUsage = memoryUsage;
  }
  log("Memory Usage: " + memoryUsage + ", pressure: " + Math.round(memoryUsage/maxMemory*100) + "%, growth: " + Math.round((memoryUsage/initialMemoryUsage-1)*100) + "%");
}

async function beforeAll() {
  tCore.initializeTest(app, testCount, navigationDelay);
  fs.removeSync(tCore.getLogFilePath());
  if (!app) {
    app = await tCoreConnect.startApp();
  }
  tCore.initializeTest(app, testCount, navigationDelay);
  log('Starting tCore');
  await tCore.startTcore();
  log('tCore started');
  await logMemoryUsage();
  return app;
}

async function afterAll() {
  try {
    await tCoreConnect.stopApp(app);
  } catch(e) {
    console.error("App shutdown failed: ", e);
    log("App shutdown failed: " + getSafeErrorMessage(e));
  }
  const cleanupFiles = tCore.getCleanupFileList();
  for (let file of cleanupFiles) {
    console.log("Cleaning out: " + file);
    fs.removeSync(file);
  }
}

async function beforeEachTest(testName_) {
  testName = testName_;
  testStartTime = new Date();
  // console.log('beforeEach', testName);
  tCore.initializeTest(app, ++testCount, navigationDelay);
  fs.removeSync(tCore.getLogFilePath());
  tCore.logVersion();
  log('Test ' + testCount + ' Name: "' + testName + '"');
  finished = false;
  await logMemoryUsage();
}

function getElapsedTestTime() {
  return (testEndTime - testStartTime) / 1000;
}

async function afterEachTest() {
  await logMemoryUsage();
  if (!finished) {
    log("#### Test " + testCount + " did not finish ####");
  } else {
    log("Test " + testCount + " Ended Successfully");
  }
  testEndTime = new Date();
  log("Test run time " + Math.round(getElapsedTestTime()) + " seconds");
}

function getSafeErrorMessage(error, defaultErrorMessage = "### Error message is empty ###") {
  let errorMessage = error || defaultErrorMessage;
  if (error && (error.type !== 'div')) {
    if (error.stack) {
      errorMessage = error.stack;
    } else {
      console.warn(error.toString()); // make message printable
    }
  }
  return errorMessage;
}

const utils = {
  beforeAll,
  beforeEachTest,
  afterEachTest,
  afterAll,
  generateTargetLanguageID,
  getBibleData,
  getElapsedTestTime,
  getSafeErrorMessage,
  log,
  logMemoryUsage,
  testFinished
};

module.exports = utils;