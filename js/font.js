const { EventEmitter } = require("events");

const cacheCanvas = document.createElement("canvas");
const fontPreviewImgDOM = document.getElementById("img-preview");
const fontFileDOM = document.getElementById("font-file");
const fontSizeDOM = document.getElementById("font-size");
const fontRangeDOM = document.getElementById("font-char");
const fontPreviewTextDOM = document.getElementById("font-preview-text");

function _previewFontShow(fontPath, size, text) {
  const f = new FontFace(
    "previewFontFamily",
    `url('${fontPath.replace(/\\/g, "/")}')`
  );

  f.load().then(function () {
    document.fonts.add(f);
    // console.log("Load end");

    cacheCanvas.width = 800;
    cacheCanvas.height = 480;
    const ctx = cacheCanvas.getContext("2d");

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, cacheCanvas.width, cacheCanvas.height);

    ctx.fillStyle = "#000000";
    ctx.font = `${size}px previewFontFamily`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, cacheCanvas.width / 2, cacheCanvas.height / 2);

    fontPreviewImgDOM.src = cacheCanvas.toDataURL("image/png");
  });
}

function _hexToUTF8(hex) {
  return String.fromCodePoint(parseInt(hex, 16));
}

/**
 * filterDisplayText
 * @param {String} text
 * @param {String} range
 * @returns string that filters
 */
function filterDisplayText(text, range) {
  if (range.length > 0) {
    let regexStr = "";
    regexStr += "[^";
    let m;

    const rangeRegex =
      /((0x[0-9a-fA-F]{4})-(0x[0-9a-fA-F]{4})|(0x[0-9a-fA-F]{4}))/gm;
    while ((m = rangeRegex.exec(range)) !== null) {
      if (m.index === rangeRegex.lastIndex) {
        rangeRegex.lastIndex++;
      }

      if (typeof m[2] !== "undefined" && typeof m[3] !== "undefined") {
        regexStr += `${_hexToUTF8(m[2])}-${_hexToUTF8(m[3])}`;
      } else if (typeof m[4] !== "undefined") {
        regexStr += `${_hexToUTF8(m[4])}`;
      }
      regexStr += "|";
    }
    regexStr = regexStr.substring(0, regexStr.length - 1);
    regexStr += "]";

    text = text.replace(RegExp(regexStr, "g"), "");
  } else {
    text = "";
  }

  return text;
}

function _renderPreviewFont() {
  const filePath = fontFileDOM.files[0]
    ? fontFileDOM.files[0].path
    : "font/Montserrat-Regular.ttf";

  const size = fontSizeDOM ? parseInt(fontSizeDOM.value, 10) : 16;

  const range = fontRangeDOM ? fontRangeDOM.value.trim() : "0x0020-0x007F";

  let text = fontPreviewTextDOM ? fontPreviewTextDOM.value : "ABCD";
  text = filterDisplayText(text, range);

  _previewFontShow(filePath, size, text);
}

function updateFontList() {
  let html = "";
  projectData.fonts.forEach(function (item, index) {
    html += `<li data-font-index="${index}">`;
    html += '<div class="text">';
    html += `<p class="name">${item.name}</p>`;

    if (typeof item.variable !== "undefined") {
      html += `<p class="alt">Variable: ${item.variable}</p>`;
    } else if (typeof item.file !== "undefined") {
      html += `<p class="alt">File: ${item.file}</p>`;
    }

    html += "</div>";
    if (typeof item.variable === "undefined") {
      html += `<div class="delete">`;
      html += '<i class="fas fa-trash"></i>';
      html += "</div>";
    }
    html += "</li>";
  });
  $("#font-list").html(html);

  $("#font-list > li").mouseenter(function () {
    let index = parseInt($(this).attr("data-font-index"));

    let font = projectData.fonts[index];
    let text = $("#font-preview-text").val();

    text = filterDisplayText(text, font.range);
    _previewFontShow(font.file, font.size, text);
  });

  $("#font-list > li .delete").click(function () {
    let index = parseInt($(this).parents("li").attr("data-font-index"));

    projectData.fonts.splice(index, 1);
    updateFontList();
  });
}

async function _updateFontInArray() {
  for (let font of projectData.fonts) {
    let f = new FontFace(
      font.name,
      `url('${font.file.replace(/\\/g, "\\\\")}')`
    );
    await f.load();
    document.fonts.add(f);
  }
}

function getFontFromName(name) {
  return projectData.fonts.find((item) => item.name === name);
}

$(function () {
  fontFileDOM.addEventListener("change", _renderPreviewFont);
  fontSizeDOM.addEventListener("keyup", _renderPreviewFont);
  fontRangeDOM.addEventListener("keyup", _renderPreviewFont);
  fontPreviewTextDOM.addEventListener("keyup", _renderPreviewFont);

  $(".help-box > span").click(function () {
    let nowRange = fontRangeDOM.value.trim();
    let addRange = $(this).attr("data-range");

    if (nowRange.indexOf(addRange) < 0) {
      if (!nowRange.endsWith(",") && nowRange.length != 0) {
        nowRange += ",";
      }
      nowRange += addRange;
      fontRangeDOM.value = nowRange;
      _renderPreviewFont();
    }
  });

  $("#font-add-form").submit(function (e) {
    e.preventDefault();

    if (fontFileDOM.files.length == 0) {
      dialog.showErrorBox(
        "Oops! Something went wrong!",
        ".ttf/.woff file not select"
      );
      return;
    }

    if (parseInt(fontSizeDOM.value, 10) <= 0) {
      dialog.showErrorBox(
        "Oops! Something went wrong!",
        "please enter font size more then 0"
      );
      return;
    }

    if (
      !/((0x[0-9a-fA-F]{4})-(0x[0-9a-fA-F]{4})|(0x[0-9a-fA-F]{4}))/gm.test(
        fontRangeDOM.value.trim()
      )
    ) {
      dialog.showErrorBox(
        "Oops! Something went wrong!",
        "Range not validation"
      );
      return;
    }

    const file = fontFileDOM.files[0].path;
    const size = parseInt(fontSizeDOM.value, 10);
    const range = fontRangeDOM.value.trim();
    const name = `${fontFileDOM.files[0].name.replace(/\..*$/, "")}_${size}`;

    projectData.fonts.push({
      name,
      file,
      size,
      range,
    });

    const f = new FontFace(name, `url('${file.replace(/\\/g, "\\\\")}')`);

    f.load().then(function () {
      document.fonts.add(f);
    });

    $("#text-add-status").text(`Add ${name} to font list.`).show();
    setTimeout(() => $("#text-add-status").fadeOut(1000), 3000);
    $("#font-add-form")[0].reset();
  });

  $(".tabs > li").click(function () {
    $(".box-manage > article").hide();
    $(
      `.box-manage > article[data-name='${$(this).attr("data-content")}']`
    ).show();

    $(".tabs > li").removeClass("active");
    $(this).addClass("active");
    updateFontList();
  });
});

/**
 * Init font module
 * @param {EventEmitter} eventEmiiter
 * @param {Object} projectData
 */
function init(eventEmiiter, projectData) {
  projectData.fonts.push({
    name: "Montserrat_16",
    size: 16,
    range: "0x0020-0x007F",
    variable: "lv_font_montserrat_16",
    file: "font/Montserrat-Regular.ttf",
  });

  eventEmiiter.on("updateFontInArray", _updateFontInArray);
}

module.exports = Object.freeze({
  init,
  getFontFromName,
  filterDisplayText,
});
