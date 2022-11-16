const svgNS = "http://www.w3.org/2000/svg";
const htmlNS = "http://www.w3.org/1999/xhtml";

const svgSketch = document.getElementById("sketch");

var componentCount = 0;
var abstractComponentList = [];

function getCurrentPage() {
  return projectData.pages[projectData.activePage];
}

function addComponent(comp) {
  abstractComponentList.push(comp);
}

function createComponent(name) {
  let comp, element, id;

  abstractComponentList.forEach(function (element) {
    if (element.name === name) {
      comp = element;
    }
  });
  if (typeof comp === "undefined") {
    alert("Error!, not found " + name);
    return;
  }

  id = "component-" + componentCount;
  const seq = componentCount;
  componentCount += 1;

  const currentPage = getCurrentPage();
  // console.log(comp);
  currentPage.children[seq] = {};
  currentPage.children[seq].name = comp.name;
  currentPage.children[seq].property = {};
  Object.keys(comp.property).forEach(function (propertyName) {
    // console.log(propertyName);
    let propertyValue;
    let property = comp.property[propertyName];
    if (typeof property === "object") {
      if (typeof property.default === "undefined") {
        if (property.type === "font") {
          propertyValue = projectData.fonts[0].name;
        } else if (property.type === "parent") {
          propertyValue = "";
        }
      } else if (typeof property.default === "function") {
        propertyValue = property.default();
      } else {
        propertyValue = property.default;
      }
    } else {
      propertyValue = property;
    }
    currentPage.children[seq].property[propertyName] = propertyValue;
  });

  // console.log(currentPage.children[seq]);

  element = comp.render.create();
  element.setAttribute("data-id", id);
  element.setAttribute("class", "component");
  comp.render.update.bind(currentPage.children[seq])(element);

  svgSketch.appendChild(element);

  reconfigDraggable();
}

function allPageToJson() {
  return JSON.stringify(
    {
      font: projectData.fonts,
      page: projectData.pages,
    },
    null,
    "\t"
  );
}

function allPageFromJson(json) {
  let parse = JSON.parse(json);
  projectData.fonts = parse.font;
  projectData.pages = parse.page;

  updateFontInArray();
  rerenderComponent();
  $("#sketch").click();
  $(".property").change();
}

function waitFor(selector) {
  return new Promise(function (res, rej) {
    console.log("Wait");
    setTimeout(() => {
      console.log("Load end");
      res();
    }, 10);
  });
}

async function rerenderComponent() {
  removeAllComponent();

  let nameToId = [];
  const currentPage = getCurrentPage();

  for (let i = 0; i < currentPage.children.length; i += 1) {
    nameToId[currentPage.children[i].property.name] = i;
  }

  let arrNumber = [];
  for (let i = 0; i < currentPage.children.length; i += 1) {
    let name = currentPage.children[i].name;
    const id = `component-${i}`;
    // console.log(id, id.match(/[0-9]+/));
    arrNumber.push(+id.match(/[0-9]+/)[0]);

    let comp, element;

    abstractComponentList.forEach(function (element) {
      if (element.name === name) {
        comp = element;
      }
    });
    if (typeof comp === "undefined") {
      alert("Error!, not found " + name);
      return;
    }

    element = comp.render.create();
    element.setAttribute("data-id", id);
    element.setAttribute("class", "component");

    if (!currentPage.children[i].property.parent) {
      svgSketch.appendChild(element);
    } else {
      $(svgSketch)
        .find(
          `[data-id='component-${
            nameToId[currentPage.children[i].property.parent]
          }']`
        )[0]
        .appendChild(element);
    }

    if (element.nodeName == "IMG") {
      element.onload = () => {
        comp.render.update.bind(currentPage.children[i])(element);
        element.onload = null;
      };
    }

    comp.render.update.bind(currentPage.children[i])(element);
  }

  if (arrNumber.length > 0) {
    componentCount = Math.max.apply(null, arrNumber) + 1;
  } else {
    componentCount = 0;
  }

  reconfigDraggable();
}

function updateComponentPosition(id, x, y) {
  const currentPage = getCurrentPage();
  const seq = parseInt(id.replace("component-", ""), 10);
  let name = currentPage.children[seq].name;

  let comp;

  // Find component name in list
  abstractComponentList.forEach(function (element) {
    if (element.name === name) {
      comp = element;
    }
  });
  if (typeof comp === "undefined") {
    alert("Error!, not found " + name);
    return;
  }

  let element = $(svgSketch).find("[data-id='" + id + "']")[0];
  let box = element.getBBox();
  comp.render.move.bind(currentPage.children[seq])(x, y, box.width, box.height);
  comp.render.update.bind(currentPage.children[seq])(element);
}

function updateComponentProperty(id) {
  const currentPage = getCurrentPage();
  const seq = parseInt(id.replace("component-", ""), 10);
  let name = currentPage.children[seq].name;

  let comp;

  // Find component name in list
  abstractComponentList.forEach(function (element) {
    if (element.name === name) {
      comp = element;
    }
  });
  if (typeof comp === "undefined") {
    alert("Error!, not found " + name);
    return;
  }

  comp.render.update.bind(currentPage.children[seq])(
    $(svgSketch).find("[data-id='" + id + "']")[0]
  );
}

function getAbstractComponent() {
  return abstractComponentList;
}

function updatePropertyTable() {
  let focus = $(".focus").last()[0];
  let id = focus.getAttribute("data-id");
  const currentPage = getCurrentPage();
  const seq = parseInt(id.replace("component-", ""), 10);
  let name = currentPage.children[seq].name;

  let comp;

  abstractComponentList.forEach(function (element) {
    if (element.name === name) {
      comp = element;
    }
  });
  if (typeof comp === "undefined") {
    alert("Error!, not found " + name);
    return;
  }

  $(".property").unbind();

  var html = "";
  Object.keys(comp.property).forEach(function (propertyName) {
    let property = comp.property[propertyName];
    if (typeof property === "object") {
      html += "<li>";
      html += `<div class="label">${
        typeof property.label !== "undefined" ? property.label : propertyName
      }</div>`;
      html += `<div class="value">`;

      if (property.type === "text") {
        html +=
          '<input type="text" class="property" data-property="' +
          propertyName +
          '" value="' +
          currentPage.children[seq].property[propertyName] +
          '">';
      } else if (property.type === "number") {
        html += `<input type="number" class="property${
          typeof property.inputOffset !== "undefined"
            ? ` input-${property.inputOffset}-offset`
            : ""
        }" data-property="${propertyName}" value="${
          currentPage.children[seq].property[propertyName]
        }">`;
      } else if (property.type === "color") {
        html +=
          '<input type="text" class="input-color property" data-property="' +
          propertyName +
          '" value="' +
          currentPage.children[seq].property[propertyName] +
          '">';
      } else if (property.type === "choice") {
        html +=
          '<select class="property" data-property="' + propertyName + '">';
        for (let i = 0; i < property.choice.length; i++) {
          html +=
            '<option value="' +
            property.choice[i].value +
            '"' +
            (property.choice[i].value ===
            currentPage.children[seq].property[propertyName]
              ? " selected"
              : "") +
            ">" +
            property.choice[i].label +
            "</option>";
        }
        html += "</select>";
      } else if (property.type === "file") {
        html +=
          '<button class="property file-select" data-property="' +
          propertyName +
          '" value="' +
          currentPage.children[seq].property[propertyName] +
          '">Choose</button>';
      } else if (property.type === "font") {
        html +=
          '<select class="property" data-property="' + propertyName + '">';
        for (let item of projectData.fonts) {
          html +=
            '<option value="' +
            item.name +
            '"' +
            (item.name === currentPage.children[seq].property[propertyName]
              ? " selected"
              : "") +
            ">" +
            item.name +
            "</option>";
        }
        html += "</select>";
      } else if (property.type === "parent") {
        html +=
          '<select class="property" data-property="' + propertyName + '">';
        html += `<option value="">N/A</option>`;
        for (let item of Object.values(currentPage.children).filter(
          (item) => item.name === "Object"
        )) {
          if (item.property.name === currentPage.children[seq].property.name)
            continue; // ?
          html += `<option value="${item.property.name}"${
            item.property.name ===
            currentPage.children[seq].property[propertyName]
              ? " selected"
              : ""
          }>${item.property.name}</option>`;
        }
        html += "</select>";
      }

      html += "</div>";
      html += "</li>";
    } else {
      /* html += currentPage.children[seq].property[propertyName]; */
    }
  });

  $("#property-box").html(html);

  $(".input-color").each(function () {
    // console.log(this);
    let a = new jscolor(this, { hash: true });
  });

  $(".property").change(async function (e) {
    // console.log("Hi2");
    let propertyName = e.target.getAttribute("data-property");
    let propertyValue = e.target.value;

    let focus = $(".focus")[0];
    let id = focus.getAttribute("data-id");
    const currentPage = getCurrentPage();
    const seq = parseInt(id.replace("component-", ""), 10);

    let name = currentPage.children[seq].name;

    let comp;

    abstractComponentList.forEach(function (element) {
      if (element.name === name) {
        comp = element;
      }
    });

    if (typeof comp === "undefined") {
      alert("Error!, not found " + name);
      return;
    }

    let property = comp.property[propertyName];
    if (property.type === "number") {
      propertyValue = +propertyValue;
      if (typeof property.min !== "undefined") {
        let min;
        if (typeof property.min !== "function") {
          min = property.min;
        } else {
          min = property.min.bind(currentPage.children[seq])();
        }
        if (propertyValue < min) {
          alert("Error, Minimum value of this property is " + min);
          e.target.value = min;
          return;
        }
      }
      if (typeof property.max !== "undefined") {
        let max;
        if (typeof property.max !== "function") {
          max = property.max;
        } else {
          max = property.max.bind(currentPage.children[seq])();
        }
        if (propertyValue > max) {
          alert("Error, Maximum value of this property is " + max);
          e.target.value = max;
          return;
        }
      }
      currentPage.children[seq].property[propertyName] = propertyValue;
    } else if (property.type === "choice") {
      if (typeof comp.property[propertyName].choice[0].value === "number") {
        currentPage.children[seq].property[propertyName] = +propertyValue;
      } else {
        currentPage.children[seq].property[propertyName] = propertyValue;
      }
    } else if (property.type === "text") {
      if (typeof property.pattern === "object") {
        if (property.pattern.test(propertyValue) === false) {
          alert("Error, Value not match");
          e.target.value = currentPage.children[seq].property[propertyName];
          return;
        }
      }
      /*       if (typeof property.validate !== "undefined") {
        if (property.validate === "font") {
          propertyValue = textFilter(propertyValue, getFontFromName(currentPage.children[seq].property.font).range);
        }
      } */
      currentPage.children[seq].property[propertyName] = propertyValue;
    } else if (property.type === "color") {
      if (/^#[0-9a-fA-F]{6}$/.test(propertyValue) === false) {
        alert("Error, Value not match of #RGB");
        e.target.value = currentPage.children[seq].property[propertyName];
        return;
      }
      currentPage.children[seq].property[propertyName] = propertyValue;
    } else if (property.type === "file") {
      currentPage.children[seq].property[propertyName] = propertyValue;
    } else if (property.type === "font") {
      currentPage.children[seq].property[propertyName] = propertyValue;
    } else if (property.type === "parent") {
      let newParent = false;
      if (propertyValue === "") {
        newParent = svgSketch;
      } else {
        for (let i = 0; i < currentPage.children.length; i += 1) {
          if (currentPage.children[i].property.name === propertyValue) {
            newParent = $(svgSketch).find(`[data-id='component-${i}'`)[0];
            break;
          }
        }
      }
      if (newParent) {
        try {
          newParent.appendChild(focus);
          currentPage.children[seq].property[propertyName] = propertyValue;
        } catch (msg) {
          alert("Error, loop parent");
        }
      }
    }

    if (typeof property.change === "function") {
      await property.change.bind(currentPage.children[seq])();
      updatePropertyTable();
    }

    updateComponentProperty(id);
    updateComponentFrame();
  });

  $(".file-select").click(async function (e) {
    let result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Image", extensions: ["png", "jpg", "jpeg"] }],
    });
    if (!result.canceled) {
      $(this).attr("value", result.filePaths).trigger("change");
    }
  });
}

async function buildComponentsGetCode(simulator, output_path) {
  if (typeof simulator === "undefined") simulator = false;
  if (typeof output_path === "undefined") output_path = false;

  var code = "";
  var header = "";

  let indexGradDir2Var = [
    "LV_GRAD_DIR_NONE",
    "LV_GRAD_DIR_HOR",
    "LV_GRAD_DIR_VER",
  ];

  const currentPage = getCurrentPage();
  code += `lv_obj_set_style_local_bg_color(lv_scr_act(), LV_OBJ_PART_MAIN, LV_STATE_DEFAULT, lv_color_hex(0x${projectData.pages[
    projectData.activePage
  ].options.main_color.substring(1)}));\n`;
  code += `lv_obj_set_style_local_bg_grad_color(lv_scr_act(), LV_OBJ_PART_MAIN, LV_STATE_DEFAULT, lv_color_hex(0x${projectData.pages[
    projectData.activePage
  ].options.grad_color.substring(1)}));\n`;
  code += `lv_obj_set_style_local_bg_grad_dir(lv_scr_act(), LV_OBJ_PART_MAIN, LV_STATE_DEFAULT, ${
    indexGradDir2Var[+currentPage.options.grad_dir]
  });\n`;
  code += "\n";

  for (let i = 0; i < currentPage.children.length; i += 1) {
    let name = currentPage.children[i].name;

    let comp;

    abstractComponentList.forEach(function (element) {
      if (element.name === name) {
        comp = element;
      }
    });

    if (typeof comp === "undefined") {
      return;
    }

    let compCode = await comp.build.bind(currentPage.children[i])(
      simulator,
      currentPage.name,
      output_path
    );

    code += `/* ========== ${currentPage.children[i].property.name} ========== */\n`;
    code += typeof compCode === "object" ? compCode.content : compCode;
    code += `/* ====== END of ${currentPage.children[i].property.name} ====== */\n`;
    code += "\n";

    if (typeof compCode === "object") {
      if (compCode.header.length > 0) {
        header += `/* ========== ${currentPage.children[i].property.name} header ========== */\n`;
        header += compCode.header;
        header += `/* ====== END of ${currentPage.children[i].property.name} header ====== */\n`;
        header += "\n";
      }
    }
  }

  return { header, content: code };
}

function execShellCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
}

async function buildFontSaveFileGetCode(
  path,
  callback,
  repalceInclude,
  repalceFile
) {
  if (typeof repalceInclude === "undefined") repalceInclude = false;
  if (typeof repalceFile === "undefined") repalceFile = "Y";

  let code = "";

  for (let font of projectData.fonts) {
    if (typeof font.variable !== "undefined") {
      continue;
    }
    if (typeof callback === "function")
      callback(`Convarting ${font.name} to C Array`);
    try {
      let output = `${path}\\${font.name}.c`;
      if (fs.existsSync(output) && repalceFile === "ASK") {
        let result = await dialog.showMessageBox({
          type: "question",
          title: "Confirm File Replace",
          message: `This folder already contains a file named '${font.name}'. Would you like to replace file ?`,
          buttons: ["Skip", "Replace"],
        });
        if (result === 0) {
          continue;
        }
      } else if (fs.existsSync(output) && repalceFile === "N") {
        continue;
      }
      let cmd = `"${__dirname}\\bin\\lv_font_conv_v0.3.1_x64.exe" --font "${font.file}" --bpp 4 --size ${font.size} -r ${font.range} --format lvgl --no-compress -o "${output}"`;
      await execShellCommand(cmd);
      code += `LV_FONT_DECLARE(${font.name});\n`;
      if (repalceInclude) {
        const data = await readFileAsync(output, "utf8");
        var result = data.replace(
          /#include \"lvgl\/lvgl.h\"/g,
          '#include "lvgl.h"'
        );
        writeFileAsync(output, result, "utf8");
      }
    } catch (e) {
      dialog.showErrorBox(
        "Oops! Something went wrong!",
        `${font.name} can't convert to C array`
      );
    }
  }

  return code;
}
