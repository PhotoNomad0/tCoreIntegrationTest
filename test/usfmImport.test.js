/* eslint-disable quotes,no-console */
const tCore = require('./tCoreSupport');
const utils = require('./utils');

let app;

describe('tCore Test', () => {
  
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

  describe('Import Tests', () => {
    it('opens USFM import', async () => {
      const newTargetLangId = "zzxz";
      const languageId = "hi";
      const bookId = "tit";
      const continueOnProjectInfo = true;
      const projectSettings = {
        importPath: './test/fixtures/57-TIT-AlignedHI.usfm',
        license: 'ccShareAlike',
        languageName: "Hindi",
        languageId,
        languageDirectionLtr: true,
        bookName: "Titus (tit)",
        newTargetLangId,
      };
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.doLocalProjectImport(projectSettings, continueOnProjectInfo, projectName);
    });
  });
});

//
// helpers
//

function log(text) {
  utils.log(text);
}

