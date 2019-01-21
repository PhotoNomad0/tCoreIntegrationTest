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
  generalAlertDialog2: {
    selector: "body > div:nth-child(11) > div > div:nth-child(1) > div > div",
    id: "General Alert Dialog 2",
    prompt: {
      selector: "body > div:nth-child(11) > div > div:nth-child(1) > div > div > div:nth-child(2) > div > div",
      id: "Prompt"
    },
    title: {
      selector: "body > div:nth-child(11) > div > div:nth-child(1) > div > div > h3",
      id: "Title"
    },
    prime: {
      selector: "body > div:nth-child(11) > div > div:nth-child(1) > div > div > div:nth-child(3) > button.btn-prime",
    },
    secondary: {
      selector: "body > div:nth-child(11) > div > div:nth-child(1) > div > div > div:nth-child(3) > button.btn-second"
    }
  },
  projectStepperDialog: {
    selector: "body > div:nth-child(3) > div > div:nth-child(1) > div > div > div:nth-child(1)",
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
    id: "Version Label",
    selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div"
  },
  projectButton: {
    selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div:nth-child(2) > div > div > div > div > button",
    text: "Project"
  },
  userNavigation: {
    selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div:nth-child(1) > div > div > div:nth-child(1) > div:nth-child(3) > span",
    id: "User Navigation"
  },
  projectNavigation: {
    selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div:nth-child(1) > div > div > div:nth-child(1) > div:nth-child(5) > span",
    id: "Project Navigation"
  },
  toolNavigation: {
    selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div:nth-child(1) > div > div > div:nth-child(1) > div:nth-child(7) > span",
    id: "Project Navigation"
  },
  projectNavigationFromTool: {
    selector: "#content > div > div.container-fluid > div.row > div > div > div:nth-child(1) > button:nth-child(3)",
    id: "Project Navigation"
  },
  toolNavigationFromTool: {
    selector: "#content > div > div.container-fluid > div.row > div > div > div:nth-child(1) > button:nth-child(4)",
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
  alignmentsResetDialog: {
    ...TEMPLATES.generalAlertDialog2,
    id: "Alignments Reset Dialog",
    title: {
      selector: TEMPLATES.generalAlertDialog2.title.selector,
      text: "Alert",
      id: "Title"
    },
    prompt: {
      selector: TEMPLATES.generalAlertDialog2.prompt.selector,
      id: "Prompt",
      text: "Changes have been detected in your project which have invalidated some of your alignments. These verses display an icon of a broken chain next to the reference in the side menu.\nDo not show this warning again."
    },
    ok: {
      selector: TEMPLATES.generalAlertDialog2.prime.selector,
      text: "OK"
    }
  },
  overwriteProjectDialog: {
    ...TEMPLATES.generalAlertDialog,
    id: "Overwrite Project Warning Dialog",
    title: {
      selector: TEMPLATES.generalAlertDialog.title.selector,
      text: "Alert",
      id: "Title"
    },
    prompt: {
      selector: TEMPLATES.generalAlertDialog.prompt.selector,
      id: "Prompt",
      matchingText: function(projectName) {
        return  `The project you selected (${projectName}) already exists.\nSelect "Overwrite Project" if you would like to overwrite the text of your existing project with this import. All check data will be retained, except where the text has been changed. In this case, the check will be invalidated and have to be redone.`;
      }
    },
    cancel: {
      selector: TEMPLATES.generalAlertDialog.prime.selector,
      text: "Cancel Import"
    },
    overwrite: {
      selector: TEMPLATES.generalAlertDialog.secondary.selector,
      text: "Overwrite Project"
    }
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
    includeAlignmentsInputValue: {
      selector: TEMPLATES.generalAlertDialog.prompt.selector + " > div > div:nth-child(2) > div > div > input[type=\"checkbox\"]",
      id: "Include Alignment Data Checkbox"
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
      id: "Import Error Title"
    },
    ok: {
      selector: TEMPLATES.generalAlertDialog.single.selector,
      text: "OK",
      id: "Import Error OK Button"
    }
  },
  searchingWaitDialog: {
    ...TEMPLATES.generalAlertDialog,
    id: "Searching Please Wait Dialog",
    title: {
      selector: TEMPLATES.generalAlertDialog.title.selector,
      text: "Alert",
      id: "Searching Wait Dialog Title"
    },
    prompt: {
      ...TEMPLATES.generalAlertDialog.prompt,
      text: "General Alert Dialog Text",
      id: "Searching Wait Dialog Prompt"
    },
    ok: {
      selector: TEMPLATES.generalAlertDialog.single.selector,
      text: "OK",
      id: "Wait Dialog OK Button"
    }
  },
  importCancelDialog: {
    ...TEMPLATES.generalAlertDialog,
    id: "Cancel Dialog",
    title: {
      selector: TEMPLATES.generalAlertDialog.title.selector,
      text: "Alert",
      id: "Cancel Dialog Title"
    },
    prompt: {
      ...TEMPLATES.generalAlertDialog.prompt,
      text: "Canceling now will abort the import process and the project will need to be re-imported before it can be used.",
      id: "Cancel Dialog Prompt"
    },
    continueImport: {
      selector: TEMPLATES.generalAlertDialog.single.selector,
      text: "Continue Import",
      id: "Cancel Dialog Continue Import Button"
    },
    cancelImport: {
      selector: TEMPLATES.generalAlertDialog.secondary.selector,
      text: "Cancel Import",
      id: "Cancel Dialog Cancel Import Button"
    }
  },
  onlineAccessDialog: {
    selector: "body > div:nth-child(4) > div > div:nth-child(1) > div > div",
    id: "Online Access Dialog",
    noShowClick: {
      selector: "body > div:nth-child(4) > div > div:nth-child(1) > div > div > div:nth-child(1) > div:nth-child(4) > table > tbody > tr > td:nth-child(2) > div > div > div > div > input[type=\"checkbox\"]",
      id: "Online Dialog - Don't Show Again",
    },
    access_internet: {
      selector: "body > div:nth-child(4) > div > div:nth-child(1) > div > div > div:nth-child(2) > button.btn-prime",
      text: "Access Internet",
      id: "Online Dialog Access Internet Button",
    },
    cancel: {
      selector: "body > div:nth-child(4) > div > div:nth-child(1) > div > div > div:nth-child(2) > button.btn-second",
      text: "Cancel",
      id: "Online Dialog Cancel Button",
    }
  },
  onlineImportDialog: {
    selector: "body > div:nth-child(11) > div > div:nth-child(1) > div > div",
    id: "DCS Import Dialog",
    import: {
      selector: "body > div:nth-child(11) > div > div:nth-child(1) > div > div > div:nth-child(2) > button.btn-prime",
      text: "Import",
      id: "Import Button"
    },
    cancel: {
      selector: "body > div:nth-child(11) > div > div:nth-child(1) > div > div > div:nth-child(2) > button.btn-second",
      text: "Cancel",
      id: "Cancel Button"
    },
    search: {
      selector: "body > div:nth-child(11) > div > div:nth-child(1) > div > div > div:nth-child(1) > div:nth-child(5) > div > button",
      text: "Search",
      id: "Search Button"
    },
    searchResultN: function(item) {
      return {
        selector: "body > div:nth-child(11) > div > div:nth-child(1) > div > div > div:nth-child(1) > table > tbody > tr:nth-child(" + item + ")",
        id: "Search Result " + item
      };
    },
    searchResultCheckBoxN: function(item) {
      return {
        selector:     "body > div:nth-child(11) > div > div:nth-child(1) > div > div > div:nth-child(1) > table > tbody > tr:nth-child(" + item + ") > td:nth-child(1) > div > input[type=\"checkbox\"]",
        id: "Search Result CheckBox " + item
      };
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
    bookMenuItemN: function(pos) {
      return {
        selector: "body > div:nth-child(12) > div > div > div > div:nth-child(" + pos + ") > span",
        id: "Book Name " + pos
      };
    },
    bookMenuItems: {
      selector: "body > div:nth-child(12) > div > div > div > div",
      id: "Book Names"
    },
    bookDropDownButton: {
      selector: "body > div:nth-child(11) > div > div:nth-child(1) > div > div > div:nth-child(1) > div:nth-child(5) > div > div:nth-child(3) > div button"
    },
    enterURL: {
      selector: "body > div:nth-child(11) > div > div:nth-child(1) > div > div > div:nth-child(1) > div:nth-child(4) > div > input[type=\"text\"]",
      id: "Enter URL"
    }
  },
  copyrightDialog: {
    ...TEMPLATES.projectStepperDialog,
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
  mergeConflictCheckerDialog: {
    ...TEMPLATES.projectStepperDialog,
    id: "Merge Conflict Checker Dialog",
    mergeConflictLabel: {
      selector: "body > div:nth-child(3) > div > div:nth-child(1) > div > div > div:nth-child(1) > div > div:nth-child(2) > div:nth-child(2) > div",
      id: "Merge Conflict Label",
      text: "Merge Conflicts"
    },
    instructions: {
      selector: "body > div:nth-child(3) > div > div:nth-child(1) > div > div > div:nth-child(1) > div > div:nth-child(2) > div:nth-child(1) > div > div",
      id: "Instructions",
      text: "Some merge conflicts were found inside of your project. Please review and resolve these conflicts before continuing."
    },
    mergeConflicts: {
      selector: "body > div:nth-child(3) > div > div:nth-child(1) > div > div > div:nth-child(1) > div > div:nth-child(2) > div:nth-child(2) > div > div > div > div",
      id: "Merge Conflicts List"
    },
    mergeConflictN: function(position) {
      return {
        selector: "body > div:nth-child(3) > div > div:nth-child(1) > div > div > div:nth-child(1) > div > div:nth-child(2) > div:nth-child(2) > div > div > div > div:nth-child(" + position + ")",
        id: "Merge Conflict " + position,
        resolveButton: {
          selector: "body > div:nth-child(3) > div > div:nth-child(1) > div > div > div:nth-child(1) > div > div:nth-child(2) > div:nth-child(2) > div > div > div > div:nth-child(" + position + ") > div > div:nth-child(2)",
          id: "Resolve Button " + position
        },
        resolveOption: function(choice) {
          return {
            selector: "body > div:nth-child(3) > div > div:nth-child(1) > div > div > div:nth-child(1) > div > div:nth-child(2) > div:nth-child(2) > div > div > div > div:nth-child(" + position + ") > div:nth-child(" + (choice+1) + ") > div > div:nth-child(1) > input[type=\"radio\"]",
            id: "Resolve option " + choice + " for conflict " + position
          };
        }
      };
    }
  },
  projectInfoCheckerDialog: {
    ...TEMPLATES.projectStepperDialog,
    selector: "#project-information-card",
    id: "Project Info Checker Dialog",
    continue: {
      ...TEMPLATES.projectStepperDialog.continue,
      id: "Project Info Continue Button"
    },
    overwrite: {
      selector: TEMPLATES.projectStepperDialog.continue.selector,
      text: "Overwrite",
      id: "Project Info Overwrite Button"
    },
    saveChanges: {
      selector: TEMPLATES.projectStepperDialog.continue.selector,
      text: "Save Changes",
      id: "Project Info Save Changes Button"
    },
    targetLangId: {
      selector: "#resource_id",
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
      selector: "#nickname",
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
    text: "Select a tool and a gateway language from the list.\nIn this version of translationCore, the translationWords tool supports projects from the New Testament and the Word Alignment tool supports projects from the whole Bible.",
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
    projectCardN: function(position) {
      return {
        menu: {
          id: "Project Card Menu " + position,
          selector: TEMPLATES.projectCardN(position) + "> div > div > div > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(1)",
        },
        selectButton: {
          selector: TEMPLATES.projectCardN(position) + "> div > div > div > div > div:nth-child(2) > div:nth-child(2) > button",
          id: "Project Select Button " + position,
          text: "Select"
        }
      };
    },
    projectCardMenuExportUSB: {
      id: "Project Card Menu 'Export to USFM'",
      selector: TEMPLATES.projectCardMenuItemN(1)
    },
    projectCardMenuExportCSV: {
      id: "Project Card Menu 'Export to CSV'",
      selector: TEMPLATES.projectCardMenuItemN(3)
    },
    projectCardMenuUploadDCS: {
      id: "Project Card Menu 'Upload to Door43'",
      selector: TEMPLATES.projectCardMenuItemN(5)
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
  toolScripturePane: {
    id: "Scripture Pane Container",
    selector: "div.panes-container",
    panes: {
      id: "Scripture Panes",
      selector: "div.pane-container"
    },
    paneN: function(pos) {
      return {
        id: "Scripture Pane " + pos,
        selector: "div.pane-container:nth-child(" + pos + ")",
      };
    },
    closeN: function(pos) {
      return {
        id: "Scripture Pane " + pos,
        selector: "div.pane-container:nth-child(" + pos + ") > div.pane-title-container > span"
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
        launchButtonAtN: function(span) {
          return {
            id: label + " launch button",
            selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div > div:nth-child(" + position + ") > div > div:nth-child(" + span + ") > span > button"
          };
        },
        typeSelectorAtN: function(span) {
          return {
            id: label + " type selector",
            selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div > div:nth-child(" + position + ") > div > div:nth-child(5) > div:nth-child(" + span + ") > div:nth-child(1) > input[type=\"checkbox\"]"
          };
        },
        typeLabelAtN: function(span) {
          return {
            id: label + " type label",
            selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div > div:nth-child(" + position + ") > div > div:nth-child(5) > div:nth-child(" + span + ") > div:nth-child(2)"
          };
        }
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
    alignmentGridChildren: {
      id: "Alignment Grid",
      selector: "#AlignmentGrid > div"
    },
    alignmentN: function(position) {
      return {
        id: "Alignment Item " + position,
        selector: "#AlignmentGrid > div:nth-child(" + position + ")"
      };
    },
    alignmentOL: function(position) {
      return {
        id: "Alignment Item OL " + position,
        selector: "#AlignmentGrid > div:nth-child(" + (position*2-1) + ") > div > div > div:nth-child(1) > div > div"
      };
    },
    alignmentTargetDrop: function(position) {
      return {
        id: "Alignment Item Target " + position,
        selector: "#AlignmentGrid > div:nth-child(" + (position*2-1) + ") > div > div > div:nth-child(2)"
      };
    }
  },
  groupMenu: {
    id: "Group Menu",
    header: {
      id: "Group Menu Header",
      selector: "#groups-menu-header"
    },
    checkSectionN: function(position, section) {
      return {
        id: "Check Section " + section,
        selector: "#groups-menu-container > div.groups > div:nth-child(" + position + ") > div > div"
      };
    },
    checkVerseN: function(groupItem, verseItem, label="") {
      return {
        id: "Check Section " + groupItem + ", verse " + (label || verseItem),
        selector: "#groups-menu-container > div.groups > div:nth-child(" + groupItem + ") > div:nth-child(" + (verseItem+1) + ")"
      };
    },
    chapterN: function(position, chapter) {
      return {
        id: "Chapter " + chapter,
        selector: "#groups-menu-container > div.groups > div:nth-child(" + position + ") > div"
      };
    },
    verseItemN: function(groupItem, verseItem) {
      return {
        id: "Chapter " + groupItem + ", verse " + verseItem,
        selector: "#groups-menu-container > div.groups > div:nth-child(" + groupItem + ") > div:nth-child(" + (verseItem+1) + ")"
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
    verseTextN: function(position, column) {
      return {
        id: "Verse Text " + position + ', column' + column,
        selector: "div.verse-row-container > div:nth-child(" + position + ") > div:nth-child(" + column + ") > div > div.verse-content-ltr > span"
      };
    },
    close: {
      id: "Close",
      selector: "/html/body/div[8]/div[2]/div/div[3]/button",
      text: "Close"
    }
  },
  verseEditor: {
    id: "Verse Editor",
    selector: "#verse-editor-field",
    next: {
      id: "Verse Editor Next",
      selector: "body div.stepper-body > div.actions > button.btn-prime",
      text: "Next"
    },
    save: {
      id: "Verse Editor Save",
      selector: "body div.stepper-body > div.actions > button.btn-prime",
      text: "Save"
    },
    cancel: {
      id: "Verse Editor Cancel",
      selector: "body div.stepper-body > div.actions > button.btn-second",
      text: "Cancel"
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
  },
  translationWords: {
    instructions: {
      id: "translation Words Instructions",
      selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div > div:nth-child(2) > div.verse-check > div:nth-child(1) > div.verse-check-card > div.check-area > div:nth-child(2) > div > div"
    },
    selectionArea: {
      id: "translation Words Selection Area",
      selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div > div:nth-child(2) > div.verse-check > div:nth-child(1) > div.verse-check-card > div.check-area > div:nth-child(1) > div:nth-child(2) > div > div",
      currentSelections: {
        id: "Current Selections",
        selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div > div:nth-child(2) > div.verse-check > div:nth-child(1) > div.verse-check-card > div.check-area > div:nth-child(1) > div:nth-child(2) > div > div > span",
      },
      currentSelections2: {
        id: "Current Selections",
        selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div > div:nth-child(2) > div.verse-check > div:nth-child(1) > div.verse-check-card > div.check-area > div:nth-child(1) > div.ltr-content > div > span",
      }
    },
    cancel: {
      id: "Cancel Button",
      text: "Cancel",
      selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div > div:nth-child(2) > div.verse-check > div:nth-child(1) > div.verse-check-card > div.actions-area > button:nth-child(1)"
    },
    clearSelections: {
      id: "Clear Selection Button",
      text: "Clear Selection",
      selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div > div:nth-child(2) > div.verse-check > div:nth-child(1) > div.verse-check-card > div.actions-area > button:nth-child(2)"
    },
    save: {
      id: "Save Button",
      text: "Save",
      selector: "#content > div > div.container-fluid > div:nth-child(2) > div > div > div > div:nth-child(2) > div.verse-check > div:nth-child(1) > div.verse-check-card > div.actions-area > button:nth-child(3)"
    }
  }
};

module.exports = DEFINITIONS;