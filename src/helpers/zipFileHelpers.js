const AdmZip = require('adm-zip');

/**
 * @description unzips a zip file into the destination path.
 * @param {String} zipFilePath Path to zip file
 * @param {String} dest Destination path
 */
function extractZipFile(zipFilePath, dest) {
  const zip = new AdmZip(zipFilePath);
  zip.extractAllTo(dest, true);
}

const zipFileHelpers = {
  extractZipFile
};

module.exports = zipFileHelpers;