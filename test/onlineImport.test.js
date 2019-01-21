/* eslint-disable quotes,no-console, no-unused-vars */
const TCORE = require('./page-objects/elements');
const tCore = require('../src/helpers/tCoreSupport');
const utils = require('../src/helpers/utils');
const UNSUPPORTED_PROJECT_MESSAGE = "This project contains data from an old version of translationCore which is not supported in this release. For help opening this project or to restart checking, please contact help@door43.org.";

let app;
const testCount = 1; // number of time to repeat import tests

describe('Online Import Tests', () => {
  const expectedUser = "photonomad1";
  
  before(async () => {
    app = await utils.beforeAll();
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
  
  describe('DCS Rename Tests', () => {
    let availableTypes;
    let currentProject;

    afterEach(async () => {
      await utils.afterEachTest(false);
    });
    
    it('do online import access cancel', async () => {
      const success = await verifyUserName(expectedUser, true);

      const searchConfig = {
        user: expectedUser,
        languageID: 'el',
        bookID: "tit",
        import: false,
        search: true,
        cancel: false
      };
      const results = await tCore.doOnlineSearch(searchConfig);
      availableTypes = getUnusedIdentifiers(results.searchResults, 2);
      log("availableTypes: " + JSON.stringify(availableTypes, null, 2));
      utils.testFinished();
    });

    it('online import tc-desktop should succeed https://git.door43.org/tCore-test-data/el_tit', async () => {
      const sourceProject = "https://git.door43.org/tCore-test-data/el_tit";
      const languageId = "el";
      const newTargetLangId = availableTypes[0];
      const bookId = "tit";
      const projectInfoSettings = {
        languageId,
        newTargetLangId,
        sourceProject,
        brokenAlignments: true,
        import: true
      };
      const continueOnProjectInfo = true;
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.projectRemoval(projectName);
      await tCore.navigateOnlineImportDialog(projectInfoSettings);
      await tCore.doNavigateImport(projectInfoSettings, continueOnProjectInfo, projectName);
      currentProject = projectName;
      await tCore.dismissOldDialogs(true, true);
      utils.testFinished();
    });

    it('do upload to DCS', async () => {
      const results = await testUploadToDCS(currentProject, expectedUser);
      utils.testFinished();
    });
  });

  describe('Misc. Tests', () => {
    it('do online import access cancel', async () => {
      await tCore.setToProjectPage();
      await tCore.openImportDialog(TCORE.importTypeOptions.online);
      await tCore.navigateDialog(TCORE.onlineAccessDialog, 'cancel');
      await tCore.clickOn(TCORE.importMenuButton.close);
      await tCore.verifyOnSpecificPage(TCORE.projectsPage);
      utils.testFinished();
    });

    it('do online search', async () => {
      const searchConfig = {
        user: 'tCore-test-data',
        languageID: 'fr',
        bookID: "tit",
        import: false,
        search: true,
        select: 'fr_ulb_tit_book',
        cancel: true
      };
      const results = await tCore.doOnlineSearch(searchConfig);
      log("searchResults: " + JSON.stringify(results.searchResults, null, 2));
      utils.testFinished(results.success);
    });

    it('do online import with cancel on Project Info', async () => {
      const newTargetLangId = generateTargetLangId();
      const sourceProject = 'https://git.door43.org/tCore-test-data/AlignedUlt_en';
      const languageId = "en";
      const bookId = "tit";
      const projectInfoSettings = {
        targetLangId: "algn",
        languageName: "English",
        languageId,
        resourceId: "",
        languageDirectionLtr: true,
        bookName: "Titus (tit)",
        newTargetLangId
      };
      const continueOnProjectInfo = false;
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
      utils.testFinished();
    });
  });

  describe('Invalid Paths', () => {
    it('should not import import invalid project https://git.door43.org/richmahn/en_tit_ulb.git', async () => {
      const newTargetLangId = generateTargetLangId();
      const sourceProject = 'https://git.door43.org/richmahn/en_tit_ulb.git';
      const languageId = "en";
      const bookId = "tit";
      const projectInfoSettings = {
        targetLangId: "algn",
        languageName: "English",
        languageId,
        resourceId: "",
        languageDirectionLtr: true,
        bookName: "Titus (tit)",
        preProjectInfoErrorMessage: getPreProjectInfoErrorMessage(sourceProject)
      };
      const continueOnProjectInfo = false;
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
      utils.testFinished();
    });

    it('should not import import invalid project https://git.door43.org/richmahn/en_tit_ulb', async () => {
      const newTargetLangId = generateTargetLangId();
      const sourceProject = 'https://git.door43.org/richmahn/en_tit_ulb';
      const languageId = "en";
      const bookId = "tit";
      const projectInfoSettings = {
        targetLangId: "algn",
        languageName: "English",
        languageId,
        resourceId: "",
        languageDirectionLtr: true,
        bookName: "Titus (tit)",
        preProjectInfoErrorMessage: getPreProjectInfoErrorMessage(sourceProject)
      };
      const continueOnProjectInfo = false;
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
      utils.testFinished();
    });

    it('should not import import invalid project https://git.door43.org/richmahn/en_tit_ulb/stuff', async () => {
      const newTargetLangId = generateTargetLangId();
      const sourceProject = 'https://git.door43.org/richmahn/en_tit_ulb/stuff';
      const languageId = "en";
      const bookId = "tit";
      const projectInfoSettings = {
        targetLangId: "algn",
        languageName: "English",
        languageId,
        resourceId: "",
        languageDirectionLtr: true,
        bookName: "Titus (tit)",
        preProjectInfoErrorMessage: getPreProjectInfoErrorMessage(sourceProject)
      };
      const continueOnProjectInfo = false;
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
      utils.testFinished();
    });

    it('should not import import invalid project https://git.door43.org/Door43-Catalog/en_ulb/src/branch/master/43-LUK.usfm', async () => {
      const newTargetLangId = generateTargetLangId();
      const sourceProject = 'https://git.door43.org/Door43-Catalog/en_ulb/src/branch/master/43-LUK.usfm';
      const languageId = "en";
      const bookId = "tit";
      const projectInfoSettings = {
        targetLangId: "algn",
        languageName: "English",
        languageId,
        resourceId: "",
        languageDirectionLtr: true,
        bookName: "Titus (tit)",
        preProjectInfoErrorMessage: getPreProjectInfoErrorMessage(sourceProject)
      };
      const continueOnProjectInfo = false;
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
      utils.testFinished();
    });

    it('should not import import invalid project https://git.door43.org/Door43-Catalog/en_ulb/raw/branch/master/43-LUK.usfm', async () => {
      const newTargetLangId = generateTargetLangId();
      const sourceProject = 'https://git.door43.org/Door43-Catalog/en_ulb/raw/branch/master/43-LUK.usfm';
      const languageId = "en";
      const bookId = "tit";
      const projectInfoSettings = {
        targetLangId: "algn",
        languageName: "English",
        languageId,
        resourceId: "",
        languageDirectionLtr: true,
        bookName: "Titus (tit)",
        preProjectInfoErrorMessage: getPreProjectInfoErrorMessage(sourceProject)
      };
      const continueOnProjectInfo = false;
      const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
      await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
      utils.testFinished();
    });
  });

  describe('Import Tests', () => {
    for (let testNum = 1; testNum <= testCount; testNum++) {

      describe('Pass ' + testNum, () => {
        it('online import tCore should succeed - https://git.door43.org/tCore-test-data/ceb_psa_text_udb_L3', async () => {
          const newTargetLangId = generateTargetLangId();
          const sourceProject = 'https://git.door43.org/tCore-test-data/ceb_psa_text_udb_L3';
          const languageId = "ceb";
          const bookId = "psa";
          const projectInfoSettings = {
            targetLangId: "ulb",
            languageName: "Cebuano",
            languageId,
            resourceId: "",
            languageDirectionLtr: true,
            bookName: "Psalms (psa)",
            newTargetLangId
          };
          const continueOnProjectInfo = true;
          const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
          await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
          utils.testFinished();
        });

        it('online import tCore should succeed - https://git.door43.org/tCore-test-data/AlignedUlt_en', async () => {
          const newTargetLangId = generateTargetLangId();
          const sourceProject = 'https://git.door43.org/tCore-test-data/AlignedUlt_en';
          const languageId = "en";
          const bookId = "tit";
          const projectInfoSettings = {
            targetLangId: "algn",
            languageName: "English",
            languageId,
            resourceId: "",
            languageDirectionLtr: true,
            bookName: "Titus (tit)",
            newTargetLangId
          };
          const continueOnProjectInfo = true;
          const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
          await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
          utils.testFinished();
        });

        it('online import USFM should error - https://git.door43.org/tCore-test-data/AlignedUlb_hi', async () => {
          const newTargetLangId = generateTargetLangId();
          const sourceProject = "https://git.door43.org/tCore-test-data/AlignedUlb_hi";
          const languageId = "hi";
          const bookId = "tit";
          const projectInfoSettings = {
            newLanguageId: languageId,
            newBookName: "57-TIT",
            newTargetLangId,
            preProjectInfoErrorMessage: getPreProjectInfoErrorMessage(sourceProject)
          };
          const continueOnProjectInfo = true;
          const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
          await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
          utils.testFinished();
        });

        it('online import ts-desktop should succeed - https://git.door43.org/tCore-test-data/es-419_eph_text_ulb', async () => {
          const newTargetLangId = generateTargetLangId();
          const sourceProject = "https://git.door43.org/tCore-test-data/es-419_eph_text_ulb";
          const languageId = "es-419";
          const bookId = "eph";
          const projectInfoSettings = {
            targetLangId: "ulb",
            languageName: "Español Latin America",
            languageId,
            resourceId: "Unlocked Literal Bible",
            languageDirectionLtr: true,
            bookName: "Ephesians (eph)",
            newTargetLangId
          };
          const continueOnProjectInfo = true;
          const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
          await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
          utils.testFinished();
        });

        it('online import tc-desktop 0.7.0 with checking should error - https://git.door43.org/tCore-test-data/sw_tit_text_ulb_L3', async () => {
          const newTargetLangId = generateTargetLangId();
          const sourceProject = "https://git.door43.org/tCore-test-data/sw_tit_text_ulb_L3";
          const languageId = "sw";
          const bookId = "tit";
          const projectInfoSettings = {
            preProjectInfoErrorMessage: UNSUPPORTED_PROJECT_MESSAGE
          };
          const continueOnProjectInfo = true;
          const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
          await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
          utils.testFinished();
        });

        it('online import tc-desktop pre-0.7.0 with checking should error - https://git.door43.org/tCore-test-data/ceb_jas_text_ulb_L-', async () => {
          const newTargetLangId = generateTargetLangId();
          const sourceProject = "https://git.door43.org/tCore-test-data/ceb_jas_text_ulb_L-";
          const languageId = "ceb";
          const bookId = "jas";
          const projectInfoSettings = {
            preProjectInfoErrorMessage: UNSUPPORTED_PROJECT_MESSAGE
          };
          const continueOnProjectInfo = true;
          const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
          await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
          utils.testFinished();
        });

        it('online import tc-desktop 0.7.0 no checking should succeed - https://git.door43.org/tCore-test-data/ar_mat_text_ulb', async () => {
          const newTargetLangId = generateTargetLangId();
          const sourceProject = "https://git.door43.org/tCore-test-data/ar_mat_text_ulb";
          const languageId = "ar";
          const bookId = "mat";
          const projectInfoSettings = {
            targetLangId: "ulb",
            languageName: "العربية",
            languageId,
            resourceId: "Unlocked Literal Bible",
            languageDirectionLtr: false,
            bookName: "Matthew (mat)",
            newTargetLangId
          };
          const continueOnProjectInfo = true;
          const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
          await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
          utils.testFinished();
        });

        it('online import tc-desktop 0.8.0 no checking should succeed - https://git.door43.org/tCore-test-data/es-419_luk', async () => {
          const newTargetLangId = generateTargetLangId();
          const sourceProject = "https://git.door43.org/tCore-test-data/es-419_luk";
          const languageId = "es-419";
          const bookId = "luk";
          const projectInfoSettings = {
            targetLangId: "ulb",
            languageName: "es-419",
            languageId,
            resourceId: "Unlocked Literal Bible",
            languageDirectionLtr: true,
            bookName: "Luke (luk)",
            newTargetLangId,
            missingVerses: true
          };
          const continueOnProjectInfo = true;
          const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
          await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
          utils.testFinished();
        });

        it('online import tc-desktop 0.8.0 with checking should succeed - https://git.door43.org/tCore-test-data/es-419_tit_ulb', async () => {
          const newTargetLangId = generateTargetLangId();
          const sourceProject = "https://git.door43.org/tCore-test-data/es-419_tit_ulb";
          const languageId = "es-419";
          const bookId = "tit";
          const projectInfoSettings = {
            targetLangId: "ulb",
            languageName: "Español Latin America",
            languageId,
            resourceId: "Unlocked Literal Bible",
            languageDirectionLtr: true,
            bookName: "Titus (tit)",
            newTargetLangId,
            missingVerses: true
          };
          const continueOnProjectInfo = true;
          const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
          await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
          utils.testFinished();
        });

        it('online import tc-desktop 0.8.1 with alignment, no checking should succeed - https://git.door43.org/tCore-test-data/English_tit', async () => {
          const newTargetLangId = generateTargetLangId();
          const sourceProject = "https://git.door43.org/tCore-test-data/English_tit";
          const languageId = "en";
          const bookId = "tit";
          const projectInfoSettings = {
            languageName: "English",
            languageId,
            languageDirectionLtr: true,
            bookName: "Titus (tit)",
            newTargetLangId,
            brokenAlignments: true
          };
          const continueOnProjectInfo = true;
          const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
          await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
          utils.testFinished();
        });

        it('online import tc-desktop 0.9.0 no checking should succeed - https://git.door43.org/tCore-test-data/am_1co_ulb', async () => {
          const newTargetLangId = generateTargetLangId();
          const sourceProject = "https://git.door43.org/tCore-test-data/am_1co_ulb";
          const languageId = "am";
          const bookId = "1co";
          const projectInfoSettings = {
            targetLangId: "ulb",
            languageName: "አማርኛ",
            languageId,
            resourceId: "Unlocked Literal Bible",
            languageDirectionLtr: true,
            bookName: "1 Corinthians (1co)",
            newTargetLangId
          };
          const continueOnProjectInfo = true;
          const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
          await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
          utils.testFinished();
        });

        it('online import tc-desktop 0.9.0 with checking should succeed - https://git.door43.org/tCore-test-data/el_tit', async () => {
          const newTargetLangId = generateTargetLangId();
          const sourceProject = "https://git.door43.org/tCore-test-data/el_tit";
          const languageId = "el";
          const bookId = "tit";
          const projectInfoSettings = {
            languageName: "ελληνικά",
            languageId,
            languageDirectionLtr: true,
            bookName: "Titus (tit)",
            newTargetLangId,
            brokenAlignments: true
          };
          const continueOnProjectInfo = true;
          const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
          await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
          utils.testFinished();
        });

        it('online import tc-desktop should succeed - https://git.door43.org/tCore-test-data/fr_test_tit_book', async () => {
          const newTargetLangId = generateTargetLangId();
          const sourceProject = "https://git.door43.org/tCore-test-data/fr_test_tit_book";
          const languageId = "fr";
          const bookId = "tit";
          const projectInfoSettings = {
            languageName: "français",
            languageId,
            resourceId: "Unlocked Literal Bible",
            targetLangId: "test",
            languageDirectionLtr: true,
            bookName: "Titus (tit)",
            newTargetLangId
          };
          const continueOnProjectInfo = true;
          const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
          await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
          utils.testFinished();
        });

        it('online import tc-desktop should succeed - https://git.door43.org/tCore-test-data/AlignedUlt_en', async () => {
          const newTargetLangId = generateTargetLangId();
          const sourceProject = "https://git.door43.org/tCore-test-data/AlignedUlt_en";
          const languageId = "en";
          const bookId = "tit";
          const projectInfoSettings = {
            languageName: "English",
            languageId,
            targetLangId: "algn",
            languageDirectionLtr: true,
            bookName: "Titus (tit)",
            newTargetLangId
          };
          const continueOnProjectInfo = true;
          const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
          await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
          utils.testFinished();
        });

        it('second online import tc-desktop should succeed - https://git.door43.org/tCore-test-data/AlignedUlt_en', async () => {
          const newTargetLangId = generateTargetLangId();
          const sourceProject = "https://git.door43.org/tCore-test-data/AlignedUlt_en";
          const languageId = "en";
          const bookId = "tit";
          const projectInfoSettings = {
            languageName: "English",
            languageId,
            targetLangId: "algn",
            languageDirectionLtr: true,
            bookName: "Titus (tit)",
            newTargetLangId
          };
          const continueOnProjectInfo = true;
          const projectName = `${languageId}_${newTargetLangId}_${bookId}_book`;
          await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
          utils.testFinished();
        });

        it('online import tc-desktop should succeed, no rename - https://git.door43.org/tCore-test-data/fr_test_tit_book', async () => {
          const sourceProject = "https://git.door43.org/tCore-test-data/fr_test_tit_book";
          const languageId = "fr";
          const bookId = "tit";
          const projectInfoSettings = {
            languageName: "français",
            languageId,
            resourceId: "Unlocked Literal Bible",
            targetLangId: "test",
            languageDirectionLtr: true,
            bookName: "Titus (tit)",
            noRename: true
          };
          const continueOnProjectInfo = true;
          const projectName = `${languageId}_${projectInfoSettings.targetLangId}_${bookId}_book`;
          await tCore.doOnlineProjectImport(projectName, sourceProject, continueOnProjectInfo, projectInfoSettings);
          utils.testFinished();
        });
      });
    }
  });
}).timeout(1000000);

//
// helpers
//

async function testUploadToDCS(projectName, userName) {
  const success = true;
  await tCore.doUploadToDCS(projectName, userName);
  return success;
}

/**
 * finds identifiers that don't match current repos
 * @param {Array} searchResults
 * @param {Number} count - how many identifiers needed
 * @return {Array}
 */
function getUnusedIdentifiers(searchResults, count) {
  log("searchResults: " + JSON.stringify(searchResults, null, 2));
  const availableTypes = [];
  for (let i = 100; i < 400; i++) {
    const newTargetLangId = utils.generateTargetLanguageID(i);
    let matchFound = false;
    for (let repo of searchResults) {
      const repoName = repo[0];
      const split = repoName.split('_');
      const match = split.find(part => (part.toLowerCase() === newTargetLangId));
      if (match) {
        matchFound = true;
        break;
      }
    }
    if (!matchFound) {
      availableTypes.push(newTargetLangId);
    }
    if (availableTypes.length >= count) {
      break;
    }
  }
  return availableTypes;
}

/**
 * make sure we are using correct user
 * @param {String} expectedUser
 * @param {Boolean} throwException - if true will throw expection if current user is not expectedUser
 * @return {Promise<boolean>} true if correct user
 */
async function verifyUserName(expectedUser, throwException = true) {
  const currentUser = await tCore.getText(TCORE.userNavigation);
  const success = (expectedUser === currentUser);
  if (!success) {
    const message = "Configured user should be '" + expectedUser + "' not '" + currentUser + "'\nEither login as '" +
      expectedUser + "' or change test to use '" + currentUser + "'";
    log(message);
    if (throwException) {
      throw(message);
    }
  }
  return success;
}

function log(text) {
  utils.log(text);
}

function generateTargetLangId() {
  const testCount = utils.getTestCount();
  return utils.generateTargetLanguageID(testCount % 2);
}

function getPreProjectInfoErrorMessage(sourceProject) {
  return "Error occurred while importing your project.\nCould not download the project from " + sourceProject + " to";
}
