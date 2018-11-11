/* eslint-disable quotes */
const _ = require('lodash');

const TEMPLATES = {
  generalAlertDialog: {
    selector: "body > div:nth-child(4) > div > div:nth-child(1) > div > div",
    id: "General Alert Dialog",
    prompt: {
      selector: "body > div:nth-child(4) > div > div:nth-child(1) > div > div > div:nth-child(1) > div:nth-child(4) > table > tbody > tr > td:nth-child(2) > div",
      id: "Prompt"
    },
    title: {
      selector: "body > div:nth-child(4) > div > div:nth-child(1) > div > div > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > span:nth-child(1)",
      id: "Title"
    },
    single: {
      selector: "body > div:nth-child(4) > div > div:nth-child(1) > div > div > div:nth-child(2) > button"
    },
    prime: {
      selector: "body > div:nth-child(4) > div > div:nth-child(1) > div > div > div:nth-child(2) > button.btn-prime"
    },
    secondary: {
      selector: "body > div:nth-child(4) > div > div:nth-child(1) > div > div > div:nth-child(2) > button.btn-second"
    }
  },
  projectStepperDialog: {
    continue: {
      selector: "body > div:nth-child(3) > div > div:nth-child(1) > div > div > div:nth-child(2) > div > button.btn-prime",
      text: "Continue"
    },
    cancel: {
      selector: "body > div:nth-child(3) > div > div:nth-child(1) > div > div > div:nth-child(2) > div > button.btn-second",
      text: "Cancel"
    }
  },
  projectCardN: function(position) {
    return "#content > div > div.container-fluid > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div:nth-child(1) > div > div:nth-child(" + position + ") ";
  },
  projectCardMenuItemN: function(item) {
    return "body > div:nth-child(12) > div > div > div > div > div:nth-child(" + item + ")";
  }
};

const DEFINITIONS = {
  getStartedButton: {
    selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > button",
    text: "Get Started!"
  },
  versionLabel: {
    selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div"
  },
  projectButton: {
    selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div:nth-child(2) > div > div > div > div > button",
    text: "Project"
  },
  projectNavigation: {
    selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div:nth-child(1) > div > div > div:nth-child(1) > div:nth-child(5) > span",
    id: "Project Navigation"
  },
  projectNavigationFromTool: {
    selector: "#content > div > div.container-fluid > div.row > div > div > div:nth-child(1) > button:nth-child(3)",
    id: "Project Navigation"
  },
  importMenuButton: {
    selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div:nth-child(2) > div > div > div > button",
    id: "Menu Button",
    localImportButton: {
      selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(2) > button",
      id: "Local Import Button"
    },
    onlineImportButton: {
      selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div:nth-child(2) > div > div > div:nth-child(3) > div:nth-child(2) > button",
      id: "Online Import Button"
    },
    close: {
      selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div:nth-child(2) > div > div > div:nth-child(4) > div:nth-child(2) > button",
      id: "Close"
    }
  },
  importTypeOptions: {
    local: 'localImportButton',
    online: 'onlineImportButton',
    close: 'close'
  },
  renamedDialog: {
    ...TEMPLATES.generalAlertDialog,
    id: "Renamed Dialog",
    title: {
      selector: TEMPLATES.generalAlertDialog.title.selector,
      text: "Alert",
      id: "Title"
    },
    ok: {
      selector: TEMPLATES.generalAlertDialog.single.selector,
      text: "OK"
    }
  },
  usfmExport: {
    ...TEMPLATES.generalAlertDialog,
    id: "USFM Export Dialog",
    title: {
      selector: TEMPLATES.generalAlertDialog.title.selector,
      text: "Alert",
      id: "Title"
    },
    selectUsfm2: {
      id: "USFM 2",
      selector: TEMPLATES.generalAlertDialog.prompt.selector + " > div > div:nth-child(2) > div:nth-child(1)"
    },
    selectUsfm3: {
      id: "USFM 3",
      selector: TEMPLATES.generalAlertDialog.prompt.selector + " > div > div:nth-child(2) > div:nth-child(2)"
    },
    export: {
      selector: TEMPLATES.generalAlertDialog.prime.selector,
      text: "Export"
    },
    cancel: {
      selector: TEMPLATES.generalAlertDialog.secondary.selector,
      text: "Cancel"
    }
  },
  exportResultsDialog: {
    ...TEMPLATES.generalAlertDialog,
    id: "Export Results Dialog",
    title: {
      selector: TEMPLATES.generalAlertDialog.title.selector,
      text: "Alert",
      id: "Title"
    },
    ok: {
      selector: TEMPLATES.generalAlertDialog.single.selector,
      text: "OK"
    }
  },
  importErrorDialog: {
    ...TEMPLATES.generalAlertDialog,
    id: "Import Error Dialog",
    title: {
      selector: TEMPLATES.generalAlertDialog.title.selector,
      text: "Alert",
      id: "Title"
    },
    ok: {
      selector: TEMPLATES.generalAlertDialog.single.selector,
      text: "OK"
    }
  },
  searchingWaitDialog: {
    ...TEMPLATES.generalAlertDialog,
    id: "Searching Please Wait Dialog",
    title: {
      selector: TEMPLATES.generalAlertDialog.title.selector,
      text: "Alert",
      id: "Title"
    },
    prompt: {
      ...TEMPLATES.generalAlertDialog.prompt,
      text: "Searching, please wait..."
    },
    ok: {
      selector: TEMPLATES.generalAlertDialog.single.selector,
      text: "OK"
    }
  },
  importCancelDialog: {
    ...TEMPLATES.generalAlertDialog,
    id: "Cancel Dialog",
    title: {
      selector: TEMPLATES.generalAlertDialog.title.selector,
      text: "Alert",
      id: "Title"
    },
    prompt: {
      ...TEMPLATES.generalAlertDialog.prompt,
      text: "Canceling now will abort the import process and the project will need to be re-imported before it can be used."
    },
    continueImport: {
      selector: TEMPLATES.generalAlertDialog.single.selector,
      text: "Continue Import"
    },
    cancelImport: {
      selector: TEMPLATES.generalAlertDialog.secondary.selector,
      text: "Cancel Import"
    }
  },
  onlineDialog: {
    selector: "body > div:nth-child(4) > div > div:nth-child(1) > div > div",
    id: "Online Dialog",
    noShowClick: {
      selector: "body > div:nth-child(4) > div > div:nth-child(1) > div > div > div:nth-child(1) > div:nth-child(4) > table > tbody > tr > td:nth-child(2) > div > div > div > div > input[type=\"checkbox\"]"
    },
    access_internet: {
      selector: "body > div:nth-child(4) > div > div:nth-child(1) > div > div > div:nth-child(2) > button.btn-prime",
      text: "Access Internet"
    },
    cancel: {
      selector: "body > div:nth-child(4) > div > div:nth-child(1) > div > div > div:nth-child(2) > button.btn-second",
      text: "Cancel"
    }
  },
  onlineImportDialog: {
    selector: "body > div:nth-child(11) > div > div:nth-child(1) > div > div",
    id: "DCS Import Dialog",
    import: {
      selector: "body > div:nth-child(11) > div > div:nth-child(1) > div > div > div:nth-child(2) > button.btn-prime",
      text: "Import"
    },
    cancel: {
      selector: "body > div:nth-child(11) > div > div:nth-child(1) > div > div > div:nth-child(2) > button.btn-second",
      text: "Cancel"
    },
    search: {
      selector: "body > div:nth-child(11) > div > div:nth-child(1) > div > div > div:nth-child(1) > div:nth-child(5) > div > button",
      text: "Search"
    },
    searchResultN: {
      selector: "body > div:nth-child(11) > div > div:nth-child(1) > div > div > div:nth-child(1) > table > tbody > tr:nth-child($N)",
      id: "Search Result N"
    },
    searchResultCheckBoxN: {
      selector:     "body > div:nth-child(11) > div > div:nth-child(1) > div > div > div:nth-child(1) > table > tbody > tr:nth-child($N) > td:nth-child(1) > div > input[type=\"checkbox\"]",
      id: "Search Result CheckBox N"
    },
    searchResults: {
      selector: "body > div:nth-child(11) > div > div:nth-child(1) > div > div > div:nth-child(1) > table > tbody > tr",
      id: "Search Results"
    },
    user: {
      selector: "body > div:nth-child(11) > div > div:nth-child(1) > div > div > div:nth-child(1) > div:nth-child(5) > div > div:nth-child(1) > input[type=\"text\"]",
      id: "User"
    },
    languageID: {
      selector: "body > div:nth-child(11) > div > div:nth-child(1) > div > div > div:nth-child(1) > div:nth-child(5) > div > div:nth-child(2) > input[type=\"text\"]",
      id: "Language ID"
    },
    enterURL: {
      selector: "body > div:nth-child(11) > div > div:nth-child(1) > div > div > div:nth-child(1) > div:nth-child(4) > div > input[type=\"text\"]",
      id: "Enter URL"
    }
  },
  copyrightDialog: {
    ...TEMPLATES.projectStepperDialog,
    selector: "body > div:nth-child(3) > div > div:nth-child(1) > div > div > div:nth-child(1)",
    id: "Copyright Dialog",
    licensesLabel: {
      selector: "body > div:nth-child(3) > div > div:nth-child(1) > div > div > div:nth-child(1) > div > div:nth-child(2) > div:nth-child(2) > div",
      id: "Licenses Label",
      text: "Licenses"
    },
    instructions: {
      selector: "body > div:nth-child(3) > div > div:nth-child(1) > div > div > div:nth-child(1) > div > div:nth-child(2) > div:nth-child(1) > div > div > div > div > div",
      id: "Instructions",
      text: "Please select the copyright status for this project."
    },
    cc0PublicDomain: {
      selector: "body > div:nth-child(3) > div > div:nth-child(1) > div > div > div:nth-child(1) > div > div:nth-child(2) > div:nth-child(2) > div > div > div > div:nth-child(1) > div:nth-child(2) > div > input[type=\"checkbox\"]",
      id: "Public Domain"
    },
    creativeCommons: {
      selector: "body > div:nth-child(3) > div > div:nth-child(1) > div > div > div:nth-child(1) > div > div:nth-child(2) > div:nth-child(2) > div > div > div > div:nth-child(2) > div:nth-child(2) > div > input[type=\"checkbox\"]",
      id: "Creative Commons"
    },
    ccShareAlike: {
      selector: "body > div:nth-child(3) > div > div:nth-child(1) > div > div > div:nth-child(1) > div > div:nth-child(2) > div:nth-child(2) > div > div > div > div:nth-child(3) > div:nth-child(2) > div > input[type=\"checkbox\"]",
      id: "Share Alike"
    },
    noneOfTheAbove: {
      selector: "body > div:nth-child(3) > div > div:nth-child(1) > div > div > div:nth-child(1) > div > div:nth-child(2) > div:nth-child(2) > div > div > div > div:nth-child(4) > div:nth-child(2) > div > input[type=\"checkbox\"]",
      id: "None Of The Above"
    }
  },
  missingVersesCheckerDialog: {
    ...TEMPLATES.projectStepperDialog,
    selector: "body > div:nth-child(3) > div > div:nth-child(1) > div > div > div:nth-child(1)",
    id: "Missing Verses Checker Dialog",
    missingVersesLabel: {
      selector: "body > div:nth-child(3) > div > div:nth-child(1) > div > div > div:nth-child(1) > div > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(1)",
      id: "Missing Verses Label",
      text: "Missing Verses"
    },
    instructions: {
      selector: "body > div:nth-child(3) > div > div:nth-child(1) > div > div > div:nth-child(1) > div > div:nth-child(2) > div:nth-child(1) > div > div",
      id: "Instructions",
      text: "Some verses are missing from your project."
    }
  },
  projectInfoCheckerDialog: {
    ...TEMPLATES.projectStepperDialog,
    selector: "#project-information-card",
    id: "Project Info Checker Dialog",
    targetLangId: {
      selector: "#project-information-card > div > table > tbody > tr:nth-child(1) > td:nth-child(2) > div > div:nth-child(2) > input[type=\"text\"]",
      id: "Target Language Identifier"
    },
    languageName: {
      selector: "#Language-Name-TextBox-AutoComplete",
      id: "Language Name"
    },
    languageId: {
      selector: "#Language-Id-TextBox-AutoComplete",
      id: "Language ID"
    },
    resourceId: {
      selector: "#project-information-card > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > div > div:nth-child(2) > input[type=\"text\"]",
      id: "Resource ID"
    },
    languageDirection: {
      selector: "#language-direction-SelectField > div:nth-child(1) > div:nth-child(2)",
      id: "Language Direction"
    },
    bookName: {
      selector: "#book-dropdown-menu-selectField > div:nth-child(1) > div:nth-child(2)",
      id: "Book Name"
    },
    bookDropDownButton: {
      selector: "#book-dropdown-menu-selectField > div:nth-child(1) > button",
      id: "Book Drop Down"
    },
    bookNameN: {
      selector: "body > div:nth-child(12) > div > div > div > div:nth-child($N) > span",
      id: "Book Name N"
    } 
  },
  toolsPage: {
    selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(1) > div > div > div > div > div",
    text: "Select a tool and a gateway language from the list.\nIn this version of translationCore, the translationWords tool and the Word Alignment tool support New Testament projects.",
    id: "Tools Page"
  },
  projectsPage: {
    selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(1) > div > div > div > div > div > p:nth-child(1)",
    text: "Select a project from the list.",
    id: "Projects Page"
  },
  projectsList: {
    id: "Project Cards",
    selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div:nth-child(1) > div > div",
    projectCardMenuN: function(position) {
      return {
        id: "Project Card Menu " + position,
        selector: TEMPLATES.projectCardN(position) + "> div > div > div > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(1)",
      };
    },
    projectCardMenuExportUSB: {
      id: "Project Card Menu 'Export to USFM'",
      selector: TEMPLATES.projectCardMenuItemN(1)
    },
    projectCards: {
      selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div:nth-child(1) > div > div"
    },
    projectCardTitleN: function(position) {
      return {
        id: "Project Card Title " + position,
        selector: TEMPLATES.projectCardN(position) + "> div > div > div > div > div:nth-child(1) > span",
      };
    },
  },
  toolsList: {
    id: "Tool Cards",
    selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div > div",
    toolN: function(position, label) {
      return {
        id: label,
        title: {
          id: label + " title",
          selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div > div:nth-child(" + position + ") > div > div:nth-child(2) > div:nth-child(1) > span:nth-child(1)",
        },
        launchButton: {
          id: label + " launch button",
          selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div > div:nth-child(" + position + ") > div > div:nth-child(6) > span > button"
        },
      };
    }
  },
  wordAlignment: {
    expandScripturePane: {
      id: "wordAlignment expand scripture pane",
      selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div > div:nth-child(4) > div:nth-child(1) > div > div.inner-container > div.title-bar > span.glyphicon.glyphicon-fullscreen"
    },
    wordList: {
      id: "Word Alignment Word List",
      selector: "#wordList"
    },
    wordListCardN: function(position) {
      return {
        id: "Word Card " + position,
        selector: "#wordList > div:nth-child(" + position + ")"
      };
    },
    alignmentGrid: {
      id: "Alignment Grid",
      selector: "#AlignmentGrid"
    },
    alignment: {
      id: "Alignment Item",
      selector: "#AlignmentGrid > div:nth-child(1)"
    }
  },
  groupMenu: {
    id: "Group Menu",
    header: {
      id: "Group Menu Header",
      selector: "#groups-menu-header"
    },
    chapterN: function(position, chapter) {
      return {
        id: "Chapter " + chapter,
        selector: "#groups-menu-container > div.groups > div:nth-child(" + position + ") > div"
      };
    }
  },
  expandedScripturePane: {
    id: "Expanded Scripture Pane",
    selector: "//body/div[8]/div[2]",
    title: {
      id: "Expanded Scripture Pane Title",
      selector: "//body/div[8]/div[2]/div[1]/div"
    },
    verseRows: {
      id: "verse rows",
      selector: "div.verse-row-container"
    },
    verseRowN: function(position, verse) {
      return {
        id: "Verse " + verse,
        selector: "div.verse-row-container > div:nth-child(" + position + ")"
      };
    },
    editN: function(position, verse) {
      return {
        id: "Edit Verse " + verse,
        selector: "div.verse-row-container > div:nth-child(" + position + ") button"
      };
    },
    close: {
      id: "Close",
      selector: "//body/div[8]/div[2]/div[3]/button"
    }
  },
  verseEditor: {
    id: "Verse Editor",
    selector: "#verse-editor-field",
    next: {
      id: "Verse Editor Next",
      selector: "body div.stepper-body > div.actions > button.btn-prime"
    },
    save: {
      id: "Verse Editor Save",
      selector: "body div.stepper-body > div.actions > button.btn-prime"
    },
    cancel: {
      id: "Verse Editor Cancel",
      selector: "body div.stepper-body > div.actions > button.btn-second"
    },
    reasonSpelling: {
      id: "Reason Spelling",
      selector: "body div.stepper-body > div.screen > div > div:nth-child(1) > label:nth-child(1) input"
    },
    reasonPunctuation: {
      id: "Reason Punctuation",
      selector: "body div.stepper-body > div.screen > div > div:nth-child(1) > label:nth-child(2) input"
    },
    reasonWordChoice: {
      id: "Reason Word Choice",
      selector: "body div.stepper-body > div.screen > div > div:nth-child(1) > label:nth-child(3) input"
    },
    reasonMeaning: {
      id: "Reason Meaning",
      selector: "body div.stepper-body > div.screen > div > div:nth-child(2) > label:nth-child(1) input"
    },
    reasonGrammar: {
      id: "Reason Grammar",
      selector: "body div.stepper-body > div.screen > div > div:nth-child(2) > label:nth-child(2) input"
    },
    reasonOther: {
      id: "Reason Other",
      selector: "body div.stepper-body > div.screen > div > div:nth-child(2) > label:nth-child(3) input"
    }
  }
};

module.exports = DEFINITIONS;