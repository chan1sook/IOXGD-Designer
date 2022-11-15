const { devLog, devError } = require("./loggers.js");
const LASTEST_VERSION = 2;

/**
 * Check if variable is Object
 * @param {Object} variable
 * @returns true if Object (not null); false elsewhere
 */
function _isObject(variable) {
  return Boolean(variable) && typeof variable === "object";
}

/**
 * Validate save data
 * @param {Object} json
 * @returns {Number | false} version number; false if not valid
 */
function validateSaveData(json) {
  if (!_isObject(json)) {
    return false;
  }

  if (
    Number.isInteger(json.version) &&
    json.version > 1 &&
    Array.isArray(json.fonts) &&
    Array.isArray(json.pages)
  ) {
    return json.version;
  }

  if (_isObject(json.font) && _isObject(json.page)) {
    return 1;
  }

  return false;
}

/**
 * Convert save data to lastest version
 * @param {Object} jsonData
 * @returns lastest version of save data
 */
function _convertSaveData(jsonData) {
  const version = validateSaveData(jsonData);

  switch (version) {
    case 1:
      return {
        fonts: jsonData.font,
        activePage: 0,
        pages: jsonData.page,
        version: LASTEST_VERSION,
      };
    case LASTEST_VERSION:
    default:
      return jsonData;
  }
}

/**
 * Convert font data
 * @param {Array} font
 * @returns {Promise<Array>} converted font data
 */
async function _convertFontData(font) {
  const fontData = font.map((font) => {
    if (!font.variable) {
      if (!path.isAbsolute(font.file)) {
        font.file = path.resolve(path.join(path.dirname(filePath), font.file));
      }
    }
    return font;
  });

  for (let inx in fontData) {
    let font = fontData[inx];
    if (font.variable) {
      continue;
    }
    if (!fs.existsSync(font.file)) {
      let result;
      result = await dialog.showMessageBox({
        type: "error",
        title: `${path.basename(font.file)} not found`,
        message: `font ${path.basename(
          font.file
        )} not found, please select ${path.basename(font.file)} font.`,
      });

      result = await dialog.showOpenDialog({
        title: `Select file ${path.basename(font.file)}`,
        properties: ["openFile"],
        filters: [{ name: "Font", extensions: ["ttf"] }],
      });

      if (result.canceled) {
        return [];
      }

      font.file = result.filePaths[0];
    }
  }

  return fontData;
}

/**
 * load data from file
 * @param {String} filePath
 * @returns project data object; null if can't load
 */
async function loadDataFromFile(filePath) {
  try {
    const rawData = await readFileAsync(filePath);
    let jsonData = JSON.parse(rawData);

    const version = validateSaveData(jsonData);
    devLog("Load File Version", version);

    switch (version) {
      case 1:
        jsonData.font = await _convertFontData(jsonData.font);
        break;
      case LASTEST_VERSION:
      default:
        jsonData.fonts = await _convertFontData(jsonData.fonts);
        break;
    }

    return _convertSaveData(jsonData);
  } catch (err) {
    devError(err);
    return null;
  }
}

/**
 * save data to file
 * @param {Object} projectData
 * @param {String} filePath
 * @param {Function?} cb
 */
async function saveDataToFile(projectData, filePath, cb) {
  try {
    let saveData = {
      ...projectData,
    };

    saveData.fonts = saveData.fonts.map((font) => {
      if (!font.variable) {
        if (path.isAbsolute(font.file)) {
          font.file = path.relative(path.dirname(filePath), font.file);
        }
      }
      return font;
    });

    const rawData = JSON.stringify(saveData, null, "");
    devLog("saveProject length", rawData.length);
    fs.writeFile(filePath, rawData, cb);
  } catch (err) {
    devError(err);
  }
}

module.exports = Object.freeze({
  validateSaveData,
  loadDataFromFile,
  saveDataToFile,
  LASTEST_VERSION,
});
