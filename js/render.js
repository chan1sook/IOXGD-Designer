const svgNS = "http://www.w3.org/2000/svg";
const htmlNS = "http://www.w3.org/1999/xhtml";
var svgSketch = document.getElementById("sketch");

var componentCount = 0;
var abstractComponentList = [];

var pageFocus = 0;
var pageAndComponent = [
  {
    name: 'index',
    background: {
      main_color: "#FFFFFF",
      grad_color: "#FFFFFF",
      grad_dir: "0"
    },
    component: {

    }
  } 
];

function addComponent(comp) {
  abstractComponentList.push(comp);
}

function createComponent(name) {
  let comp, element, id;
  
  abstractComponentList.forEach(function(element) {
    if (element.name === name) {
      comp = element;
    }
  });
  if (typeof comp === "undefined") {
    alert("Error!, not found " + name);
    return;
  }
  
  id = "component-" + componentCount;
  componentCount++;
  
  // console.log(comp);
  pageAndComponent[pageFocus].component[id] = {};
  pageAndComponent[pageFocus].component[id].name = comp.name;
  pageAndComponent[pageFocus].component[id].property = {};
  Object.keys(comp.property).forEach(function(propertyName) {
    // console.log(propertyName);
    let propertyValue;
    let property = comp.property[propertyName];
    if (typeof property === "object") {
      if (typeof property.default === "undefined") {
        if (property.type === "font") {
          propertyValue = listFont[0].name;
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
    pageAndComponent[pageFocus].component[id].property[propertyName] = propertyValue;
  });
  
  // console.log(pageAndComponent[pageFocus].component[id]);
  
  element = comp.render.create();
  element.setAttribute("data-id", id);
  element.setAttribute("class", "component");
  comp.render.update.bind(pageAndComponent[pageFocus].component[id])(element);
  

  svgSketch.appendChild(element);
  
  reconfigDraggable();
}

function allPageToJson() {
  return JSON.stringify({
    font: listFont,
    page: pageAndComponent
  }, null, '\t');
}

function saveProject(filepath, cb) {
  let dataObject = {
    font: {},
    page: pageAndComponent
  };

  dataObject.font = JSON.parse(JSON.stringify(listFont)).map((font) => {
    if (!font.variable) {
      if (path.isAbsolute(font.file)) {
        font.file = path.relative(path.dirname(filepath), font.file);
      }
    }
    return font;
  });

  json = JSON.stringify(dataObject, null, '\t');
  // console.log(json);

  fs.writeFile(OpenfilePath, json, cb);
}

async function loadProject(file, cb) {
  let json = await readFileAsync(file);
  let parse = JSON.parse(json);
  parse.font = parse.font.map((font) => {
    if (!font.variable) {
      if (!path.isAbsolute(font.file)) {
        font.file = path.resolve(path.join(path.dirname(file), font.file));
      }
    }
    return font;
  });
  // console.log(parse.font);
  for (let inx in parse.font) {
    let font = parse.font[inx];
    if (font.variable) {
      continue;
    }
    if (!fs.existsSync(font.file)) {
      let result;
      result = await dialog.showMessageBox({
        type: 'error',
        title: `${path.basename(font.file)} not found`,
        message: `font ${path.basename(font.file)} not found, please select ${path.basename(font.file)} font.`
      });

      result = await dialog.showOpenDialog({
        title: `Select file ${path.basename(font.file)}`,
        properties: [ 'openFile' ],
        filters: [
          { name: 'Font', extensions: ['ttf'] }
        ]
      });

      if (result.canceled) {
        return;
      }
      
      font.file = result.filePaths[0];
    }
  }
  listFont = parse.font;
  pageAndComponent = parse.page;

  await updateFontInArray();
  rerenderComponent();
  $("#sketch").click();
  $(".property").change();

  if (typeof cb === "function") cb();
}

function allPageFromJson(json) {
  let parse = JSON.parse(json);
  listFont = parse.font;
  pageAndComponent = parse.page;

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
  // $(svgSketch).find(".component").remove();
  removeAllComponent();

  let nameToId = [];
  for (let ObjName of Object.keys(pageAndComponent[pageFocus].component)) {
    nameToId[pageAndComponent[pageFocus].component[ObjName].property.name] = ObjName;
  }

  let arrNumber = [];
  for (let id in pageAndComponent[pageFocus].component) {
    let name = pageAndComponent[pageFocus].component[id].name;
	// console.log(id, id.match(/[0-9]+/));
    arrNumber.push(+(id.match(/[0-9]+/)[0]));
	
    let comp, element;

    abstractComponentList.forEach(function(element) {
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

    if (!pageAndComponent[pageFocus].component[id].property.parent) {
      svgSketch.appendChild(element);
    } else {
      $(svgSketch).find(`[data-id='${nameToId[pageAndComponent[pageFocus].component[id].property.parent]}']`)[0].appendChild(element);
    }

    if (element.nodeName == 'IMG') {
      element.onload = () => {
        comp.render.update.bind(pageAndComponent[pageFocus].component[id])(element);
        element.onload = null;
      }
    }

    comp.render.update.bind(pageAndComponent[pageFocus].component[id])(element);
  }
  
  if (arrNumber.length > 0) {
    componentCount = Math.max.apply(null, arrNumber) + 1;
  } else {
    componentCount = 0;
  }
  
  reconfigDraggable();
}

function updateComponentPosition(id, x, y) {
  let name = pageAndComponent[pageFocus].component[id].name;
      
  let comp;
      
  // Find component name in list
  abstractComponentList.forEach(function(element) {
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
  comp.render.move.bind(pageAndComponent[pageFocus].component[id])(x, y, box.width, box.height);
  comp.render.update.bind(pageAndComponent[pageFocus].component[id])(element);
}

function updateComponentProperty(id) {
  let name = pageAndComponent[pageFocus].component[id].name;
      
  let comp;
      
  // Find component name in list
  abstractComponentList.forEach(function(element) {
    if (element.name === name) {
      comp = element;
    }
  });
  if (typeof comp === "undefined") {
    alert("Error!, not found " + name);
    return;
  }

  comp.render.update.bind(pageAndComponent[pageFocus].component[id])($(svgSketch).find("[data-id='" + id + "']")[0]);
}

function getAbstractComponent() {
  return abstractComponentList;
}

function updatePropertyTable() {
  let focus = $(".focus").last()[0];
  let id = focus.getAttribute("data-id");
  let name = pageAndComponent[pageFocus].component[id].name;
  
  let comp;
  
  abstractComponentList.forEach(function(element) {
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
  Object.keys(comp.property).forEach(function(propertyName) {
    
    let property = comp.property[propertyName];
    if (typeof property === "object") {
      html += "<li>";
      html += `<div class="label">${(typeof property.label !== "undefined" ? property.label : propertyName)}</div>`;
      html += `<div class="value">`;
      
      if (property.type === "text") {
        html += "<input type=\"text\" class=\"property\" data-property=\"" + propertyName + "\" value=\"" + pageAndComponent[pageFocus].component[id].property[propertyName] + "\">";
      } else if (property.type === "number") {
        html += `<input type="number" class="property${(typeof property.inputOffset !== "undefined" ? ` input-${property.inputOffset}-offset` : '')}" data-property="${propertyName}" value="${pageAndComponent[pageFocus].component[id].property[propertyName]}">`;
      } else if (property.type === "color") {
        html += "<input type=\"text\" class=\"input-color property\" data-property=\"" + propertyName + "\" value=\"" + pageAndComponent[pageFocus].component[id].property[propertyName] + "\">";
      } else if (property.type === "choice") {
        html += "<select class=\"property\" data-property=\"" + propertyName + "\">";
        for (let i=0;i<property.choice.length;i++) {
          html += "<option value=\"" + property.choice[i].value + "\"" + (property.choice[i].value === pageAndComponent[pageFocus].component[id].property[propertyName] ? " selected" : "") + ">" + property.choice[i].label + "</option>";
        }
        html += "</select>";
      } else if (property.type === "file") {
        html += "<button class=\"property file-select\" data-property=\"" + propertyName + "\" value=\"" + pageAndComponent[pageFocus].component[id].property[propertyName] + "\">Choose</button>";
      } else if (property.type === "font") {
        html += "<select class=\"property\" data-property=\"" + propertyName + "\">";
        for (let item of listFont) {
          html += "<option value=\"" + item.name + "\"" + (item.name === pageAndComponent[pageFocus].component[id].property[propertyName] ? " selected" : "") + ">" + item.name + "</option>";
        }
        html += "</select>";
      } else if (property.type === "parent") {
        html += "<select class=\"property\" data-property=\"" + propertyName + "\">";
        html += `<option value="">N/A</option>`;
        for (let item of Object.values(pageAndComponent[pageFocus].component).filter((item) => item.name === "Object")) {
          if (item.property.name === pageAndComponent[pageFocus].component[id].property.name) continue; // ?
          html += `<option value="${item.property.name}"${item.property.name === pageAndComponent[pageFocus].component[id].property[propertyName] ? ' selected' : ''}>${item.property.name}</option>`;
        }
        html += "</select>";
      }
      
      html += "</div>";
      html += "</li>";
    } else {
      /* html += pageAndComponent[pageFocus].component[id].property[propertyName]; */
    }
    
  });

  $("#property-box").html(html);
  
  $(".input-color").each(function() {
    // console.log(this);
    let a = new jscolor(this, { hash:true });
  });
  
  $(".property").change(async function(e) {
    // console.log("Hi2");
    let propertyName = e.target.getAttribute("data-property");
    let propertyValue = e.target.value;
                               
    let focus = $(".focus")[0];
    let id = focus.getAttribute("data-id");
    
    let name = pageAndComponent[pageFocus].component[id].name;
  
    let comp;

    abstractComponentList.forEach(function(element) {
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
          min = property.min.bind(pageAndComponent[pageFocus].component[id])();
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
          max = property.max.bind(pageAndComponent[pageFocus].component[id])();
        }
        if (propertyValue > max) {
          alert("Error, Maximum value of this property is " + max);
          e.target.value = max;
          return;
        }
      }
      pageAndComponent[pageFocus].component[id].property[propertyName] = propertyValue;
    } else if (property.type === "choice") {
      if (typeof comp.property[propertyName].choice[0].value === "number") {
        pageAndComponent[pageFocus].component[id].property[propertyName] = +propertyValue;
      } else {
        pageAndComponent[pageFocus].component[id].property[propertyName] = propertyValue;
      }
    } else if (property.type === "text") {
      if (typeof property.pattern === "object") {
        if (property.pattern.test(propertyValue) === false) {
          alert("Error, Value not match");
          e.target.value = pageAndComponent[pageFocus].component[id].property[propertyName];
          return;
        }
      }
/*       if (typeof property.validate !== "undefined") {
        if (property.validate === "font") {
          propertyValue = textFilter(propertyValue, getFontFromName(pageAndComponent[pageFocus].component[id].property.font).range);
        }
      } */
      pageAndComponent[pageFocus].component[id].property[propertyName] = propertyValue;
    } else if (property.type === "color") {
      if (/^#[0-9a-fA-F]{6}$/.test(propertyValue) === false) {
        alert("Error, Value not match of #RGB");
        e.target.value = pageAndComponent[pageFocus].component[id].property[propertyName];
        return;
      }
      pageAndComponent[pageFocus].component[id].property[propertyName] = propertyValue;
    } else if (property.type === "file") {
      pageAndComponent[pageFocus].component[id].property[propertyName] = propertyValue;
    } else if (property.type === "font") {
      pageAndComponent[pageFocus].component[id].property[propertyName] = propertyValue;
    } else if (property.type === "parent") {
      let newParent = false;
      if (propertyValue === "") {
        newParent = svgSketch;
      } else {
        for (let objId of Object.keys(pageAndComponent[pageFocus].component)) {
          if (pageAndComponent[pageFocus].component[objId].property.name === propertyValue) {
            newParent = $(svgSketch).find(`[data-id='${objId}'`)[0];
            break;
          }
        }
      }
      if (newParent) {
        try {
          newParent.appendChild(focus);
          pageAndComponent[pageFocus].component[id].property[propertyName] = propertyValue;
        } catch (msg) {
          alert("Error, loop parent");
        }
      }
    }
    
    if (typeof property.change === "function") {
      await property.change.bind(pageAndComponent[pageFocus].component[id])();
      updatePropertyTable();
    }
    
    updateComponentProperty(id);
    updateComponentFrame();
  });
  
  $(".file-select").click(async function(e) {
    let result = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: "Image", extensions: ["png", "jpg", "jpeg"] }] });
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

  let indexGradDir2Var = [ 'LV_GRAD_DIR_NONE', 'LV_GRAD_DIR_HOR', 'LV_GRAD_DIR_VER' ];

  code += `lv_obj_set_style_local_bg_color(lv_scr_act(), LV_OBJ_PART_MAIN, LV_STATE_DEFAULT, lv_color_hex(0x${pageAndComponent[pageFocus].background.main_color.substring(1)}));\n`;
  code += `lv_obj_set_style_local_bg_grad_color(lv_scr_act(), LV_OBJ_PART_MAIN, LV_STATE_DEFAULT, lv_color_hex(0x${pageAndComponent[pageFocus].background.grad_color.substring(1)}));\n`;
  code += `lv_obj_set_style_local_bg_grad_dir(lv_scr_act(), LV_OBJ_PART_MAIN, LV_STATE_DEFAULT, ${indexGradDir2Var[+pageAndComponent[pageFocus].background.grad_dir]});\n`;
  code += "\n";
  
  for (const id of Object.keys(pageAndComponent[pageFocus].component)) {
    let name = pageAndComponent[pageFocus].component[id].name;
  
    let comp;

    abstractComponentList.forEach(function(element) {
      if (element.name === name) {
        comp = element;
      }
    });
    
    if (typeof comp === "undefined") {
      return;
    }

    let compCode = await comp.build.bind(pageAndComponent[pageFocus].component[id])(simulator, pageAndComponent[pageFocus].name, output_path);

    code += `/* ========== ${pageAndComponent[pageFocus].component[id].property.name} ========== */\n`;
    code += typeof compCode === "object" ? compCode.content : compCode;
    code += `/* ====== END of ${pageAndComponent[pageFocus].component[id].property.name} ====== */\n`;
    code += "\n";

    if (typeof compCode === "object") {
      if (compCode.header.length > 0) {
        header += `/* ========== ${pageAndComponent[pageFocus].component[id].property.name} header ========== */\n`;
        header += compCode.header;
        header += `/* ====== END of ${pageAndComponent[pageFocus].component[id].property.name} header ====== */\n`;
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

async function buildFontSaveFileGetCode(path, callback, repalceInclude, repalceFile) {
  if (typeof repalceInclude === "undefined") repalceInclude = false;
  if (typeof repalceFile === "undefined") repalceFile = 'Y';

  let code = "";

  for (let font of listFont) {
    if (typeof font.variable !== "undefined") {
      continue;
    }
    if (typeof callback === "function") callback(`Convarting ${font.name} to C Array`);
    try {
      let output = `${path}\\${font.name}.c`;
      if (fs.existsSync(output) && repalceFile === 'ASK') {
        let result =  await dialog.showMessageBox({
          type: "question",
          title: "Confirm File Replace",
          message: `This folder already contains a file named '${font.name}'. Would you like to replace file ?`,
          buttons: [ "Skip", "Replace" ]
        });
        if (result === 0) {
          continue;
        }
      } else if (fs.existsSync(output) && repalceFile === 'N') {
        continue;
      }
      let cmd = `"${__dirname}\\bin\\lv_font_conv_v0.3.1_x64.exe" --font "${font.file}" --bpp 4 --size ${font.size} -r ${font.range} --format lvgl --no-compress -o "${output}"`;
      await execShellCommand(cmd);
      code += `LV_FONT_DECLARE(${font.name});\n`;
      if (repalceInclude) {
        const data = await readFileAsync(output, 'utf8');
        var result = data.replace(/#include \"lvgl\/lvgl.h\"/g, '#include "lvgl.h"');
        writeFileAsync(output, result, 'utf8');
      }
    } catch(e) {
      dialog.showErrorBox('Oops! Something went wrong!', `${font.name} can't convert to C array`);
    }
  }

  return code;
}

