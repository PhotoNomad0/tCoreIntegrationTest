/* eslint-disable quotes,no-console */
const fs = require('fs-extra');
const _ = require('lodash');
const ospath = require('ospath');
const path = require('path');
const tCore = require('./tCoreSupport');
const tCoreConnect = require('./tCoreConnect');
const BIBLE_SIZES = require('../../test/fixtures/index.json');
const BooksOfTheBible = require('./BooksOfTheBible');
const downloadHelpers = require('./downloadHelpers');
const zipFileHelpers = require('./zipFileHelpers');

const TEST_PROJECTS_URL = "https://git.door43.org/tCore-test-data/Test_Projects/archive/master.zip";
const TEST_PATH = path.join(ospath.home(), 'translationCore', 'testing');

let testCount = 0;
const navigationDelay = 500; // TODO: for slowing down for demo
let finished = false;
let app;
let testName;
let testStartTime = 0;
let testEndTime = 0;
const maxMemory = 2624132; // this limit seems to be little different on each run.  Don't know how the limit is determined.
let initialMemoryUsage = 0;

function log(text) {
  tCore.log(text);
}

function testFinished() {
  log("test finished");
  finished = true;
}

function getTestCount() {
  return testCount;
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

/**
 * 
 * @param testCount_
 * @return {string}
 */
function generateTargetLanguageID(testCount_ = -1) {
  let major = 0;
  let minor = (testCount_ >= 0) ? testCount_ : testCount; // if text count not given, use internal test count
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
    log("Cleaning out project: " + file);
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

/**
 * downloads test files if not present
 * @return {Promise<String>} - returns path to test files
 */
async function getTestFiles() {
  const  ZIP_DESTINATION = path.join(TEST_PATH, 'master.zip');
  if (!fs.existsSync(ZIP_DESTINATION)) {
    fs.ensureDirSync(TEST_PATH);
    await downloadHelpers.download(TEST_PROJECTS_URL, ZIP_DESTINATION);
  }
  if (fs.existsSync(ZIP_DESTINATION)) {
    const  UNZIP_DESTINATION = path.join(TEST_PATH, 'master');
    const  TEST_PROJECTS_FILES = path.join(UNZIP_DESTINATION, 'test_projects');
    if (!fs.existsSync(TEST_PROJECTS_FILES)) {
      fs.ensureDirSync(UNZIP_DESTINATION);
      await zipFileHelpers.extractZipFile(ZIP_DESTINATION, UNZIP_DESTINATION);
    }
    if (fs.existsSync(TEST_PROJECTS_FILES)) {
      return TEST_PROJECTS_FILES;
    }
  }
  return null;
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
  getTestCount,
  getTestFiles,
  log,
  logMemoryUsage,
  testFinished
};

module.exports = utils;