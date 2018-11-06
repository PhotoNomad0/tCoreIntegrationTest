/* eslint-disable quotes,no-console */
const fs = require('fs-extra');
const _ = require('lodash');
const tCore = require('./tCoreSupport');
const tCoreConnect = require('./tCoreConnect');

let testCount = 0;
const navigationDelay = 500; // TODO: for slowing down for demo
let finished = false;
let app;
let testName;

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

async function beforeAll() {
  tCore.initializeTest(app, testCount, navigationDelay);
  fs.removeSync(tCore.getLogFilePath());
  if (!app) {
    app = await tCoreConnect.startApp();
  }
  tCore.initializeTest(app, testCount, navigationDelay);
  await tCore.startTcore();
  return app;
}

async function afterAll() {
  await tCoreConnect.stopApp(app);
  const cleanupFiles = tCore.getCleanupFileList();
  for (let file of cleanupFiles) {
    console.log("Cleaning out: " + file);
    fs.removeSync(file);
  }
}

function beforeEachTest(testName_) {
  testName = testName_;
  // console.log('beforeEach', testName);
  tCore.initializeTest(app, ++testCount, navigationDelay);
  fs.removeSync(tCore.getLogFilePath());
  tCore.logVersion();
  log('Test ' + testCount + ' Name: "' + testName + '"');
  finished = false;
}

function afterEachTest() {
  if (!finished) {
    log("#### Test " + testCount + " did not finish ####");
  } else {
    log("Test " + testCount + " Ended Successfully");
  }
}

const utils = {
  beforeAll,
  beforeEachTest,
  afterEachTest,
  afterAll,
  log,
  testFinished
};

module.exports = utils;