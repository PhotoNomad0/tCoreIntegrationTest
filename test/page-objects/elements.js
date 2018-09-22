/* eslint-disable quotes */

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
    primary: {
      selector: "body > div:nth-child(4) > div > div:nth-child(1) > div > div > div:nth-child(2) > button"
    },
    secondary: {
      selector: "body > div:nth-child(4) > div > div:nth-child(1) > div > div > div:nth-child(2) > button.btn-second"
    }
  },
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
      selector: TEMPLATES.generalAlertDialog.primary.selector,
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
      selector: TEMPLATES.generalAlertDialog.primary.selector,
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
      selector: TEMPLATES.generalAlertDialog.primary.selector,
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
      selector: TEMPLATES.generalAlertDialog.primary.selector,
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
  projectCheckerDialog: {
    selector: "#project-information-card",
    id: "Project Info Checker Dialog",
    continue: {
      selector: "body > div:nth-child(3) > div > div:nth-child(1) > div > div > div:nth-child(2) > div > button.btn-prime",
      text: "Continue"
    },
    cancel: {
      selector: "body > div:nth-child(3) > div > div:nth-child(1) > div > div > div:nth-child(2) > div > button.btn-second",
      text: "Cancel"
    },
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
  }
};

module.exports = DEFINITIONS;