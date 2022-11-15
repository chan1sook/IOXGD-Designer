function updateComponentFrame() {
  let n = $(".focus").length;
  if (n >= 1) {
    let x = 0,
      y = 0,
      width = 0,
      height = 0;
    let focus = $(".focus")[n - 1];
    // let offset = $("#sketch").offset();
    let id = focus.getAttribute("data-id");
    let name = projectData.pages[projectData.activePage].component[id].name;

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

    let move = comp.render.frame.bind(
      projectData.pages[projectData.activePage].component[id]
    )();
    if (move.length === 4) {
      x = move[0];
      y = move[1];
      width = move[2];
      height = move[3];
    } else if (move.length == 2) {
      x = move[0];
      y = move[1];
      width = focus.offsetWidth;
      height = focus.offsetHeight;
    } else {
      x = focus.offsetLeft;
      y = focus.offsetTop;
      width = focus.offsetWidth;
      height = focus.offsetHeight;
    }

    if (
      typeof projectData.pages[projectData.activePage].component[id].property
        .parent !== "undefined"
    ) {
      if (
        projectData.pages[projectData.activePage].component[id].property
          .parent !== ""
      ) {
        let parentName =
          projectData.pages[projectData.activePage].component[id].property
            .parent;
        let nameToId = [];
        for (let ObjName of Object.keys(
          projectData.pages[projectData.activePage].component
        )) {
          nameToId[
            projectData.pages[projectData.activePage].component[
              ObjName
            ].property.name
          ] = ObjName;
        }
        while (1) {
          // loop find last parent
          let parentId = nameToId[parentName];
          let parent = $(svgSketch).find(`[data-id='${parentId}']`)[0];
          x += parent.offsetLeft;
          y += parent.offsetTop;
          parentName =
            projectData.pages[projectData.activePage].component[parentId]
              .property.parent || "";
          if (parentName === "") {
            break;
          }
        }
      }
    }

    // Top
    $("#component-frame1").css({ left: x - 1, top: y - 1, width: width + 2 });

    // Right
    $("#component-frame2").css({
      left: x + width,
      top: y - 1,
      height: height + 2,
    });

    // Bottom
    $("#component-frame3").css({
      left: x - 1,
      top: y + height,
      width: width + 2,
    });

    // Left
    $("#component-frame4").css({ left: x - 1, top: y - 1, height: height + 2 });

    $(
      "#component-frame1, #component-frame2, #component-frame3, #component-frame4"
    ).show();
  } else {
    $(
      "#component-frame1, #component-frame2, #component-frame3, #component-frame4"
    ).hide();
  }
}

function savePageAndProject() {
  let pagePath = path.resolve(project.path + "/" + project.name);

  if (!fs.existsSync(pagePath)) {
    try {
      fs.mkdirSync(pagePath);
    } catch (err) {
      alert("Can't create project directory, Plz close File Explorer");
      return;
    }
  }

  let projectFile = pagePath + "/" + project.name + ".kd";
  let projectFileContent = JSON.stringify({
    pages: project.pages,
  });
  try {
    fs.writeFileSync(projectFile, projectFileContent); // Write page file
  } catch (err) {
    alert("Can't write project file, Your disk is full ?");
    return;
  }

  let contentFile = componentToJson();

  try {
    fs.writeFileSync(
      pagePath + "/" + project.activePageName + ".json",
      contentFile
    ); // Write page file
  } catch (err) {
    alert("Can't write page file, Your disk is full ?");
    return;
  }
}

function removeAllComponent() {
  $(svgSketch).find(".component").remove();
  componentList = {};
}

function updatePageListAndActiveOld() {
  let html = "";
  for (var i = 0; i < project.pages.length; i++) {
    html +=
      "<li" +
      (project.activePageName === project.pages[i] ? ' class="active"' : "") +
      ">";
    html += project.pages[i];
    html += "</li>";
  }
  $("#page-list").html(html);

  $("#page-list > li").click(function () {
    if ($(this).text() === project.activePageName) {
      return;
    }
    if (project.activePageName !== null) savePageAndProject(); // Save old page
    removeAllComponent();

    project.activePageName = $(this).text();
    $("#page-list > li").removeClass("active");
    $(this).addClass("active");

    let filePath = path.resolve(
      project.path + "/" + project.name + "/" + project.activePageName + ".json"
    );

    let contentFile;
    try {
      contentFile = fs.readFileSync(filePath);
    } catch (err) {
      console.log("Can't open file " + project.activePageName + ".json !");
      return;
    }

    loadComponentFromJson(contentFile);
  });
}

let show_grid = false;
let grid_size = 100;

let updateSketchBackground = () => {
  let canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 480;
  let ctx = canvas.getContext("2d");

  if (+projectData.pages[projectData.activePage].background.grad_dir === 0) {
    ctx.fillStyle =
      projectData.pages[projectData.activePage].background.main_color;
  } else {
    let gradient;
    if (+projectData.pages[projectData.activePage].background.grad_dir === 1) {
      gradient = ctx.createLinearGradient(0, 0, 800, 0);
    } else if (
      +projectData.pages[projectData.activePage].background.grad_dir === 2
    ) {
      gradient = ctx.createLinearGradient(0, 0, 0, 480);
    }
    gradient.addColorStop(
      0,
      projectData.pages[projectData.activePage].background.main_color
    );
    gradient.addColorStop(
      1,
      projectData.pages[projectData.activePage].background.grad_color
    );
    ctx.fillStyle = gradient;
  }

  ctx.fillRect(0, 0, 800, 480);

  if (show_grid) {
    for (let x = grid_size; x < 800; x += grid_size) {
      ctx.beginPath();
      ctx.setLineDash([10, 10]);
      ctx.moveTo(x, 5);
      ctx.lineTo(x, 480);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    for (let y = grid_size; y < 480; y += grid_size) {
      ctx.beginPath();
      ctx.setLineDash([10, 10]);
      ctx.moveTo(5, y);
      ctx.lineTo(800, y);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  svgSketch.style.background = `url(${canvas.toDataURL()})`;
};

var ctrlDown = false;

$(function () {
  // Hot key
  document.onkeydown = function (e) {
    if (e.which === 46) {
      // Delete
      let focus = $(".focus");
      let id = focus.attr("data-id");
      focus.remove();
      delete projectData.pages[projectData.activePage].component[id];

      // Hide frame
      updateComponentFrame();

      $("#property-box").html("");
    } else if ($(":focus").length === 0 && e.which === 38) {
      // Up
      $(".input-y-offset")
        .val(parseInt($(".input-y-offset").val()) - 10)
        .change();
    } else if ($(":focus").length === 0 && e.which === 40) {
      // Down
      $(".input-y-offset")
        .val(parseInt($(".input-y-offset").val()) + 10)
        .change();
    } else if ($(":focus").length === 0 && e.which === 37) {
      // Left
      $(".input-x-offset")
        .val(parseInt($(".input-x-offset").val()) - 10)
        .change();
    } else if ($(":focus").length === 0 && e.which === 39) {
      // Right
      $(".input-x-offset")
        .val(parseInt($(".input-x-offset").val()) + 10)
        .change();
    }
  };

  // Update component list
  var html = "";
  let comps = getAbstractComponent();
  comps.forEach(function (element) {
    html += `<li data-name="${element.name}">`;
    html += `<span class="icon">${element.icon}</span>`;
    html += `<span class="label">${element.name}</span>`;
    html += "</li>";
  });
  $("#object-list").html(html);

  $("#object-list > li").click(function (e) {
    createComponent($(this).attr("data-name"));
  });

  // No focus
  $("#sketch").on("click", function (e) {
    if (e.target !== this) return;

    // console.log('clicked');
    $(".focus").removeClass("focus");

    updateComponentFrame();

    let code = "";
    code += `<li>`;
    code += `<div class="label">Main color</div>`;
    code += `<div class="value"><input type="text" class="input-color property" data-property="main_color" value="${
      projectData.pages[projectData.activePage].background.main_color
    }"></div>`;
    code += `</li>`;
    code += `<li>`;
    code += `<div class="label">Gradient color</div>`;
    code += `<div class="value"><input type="text" class="input-color property" data-property="grad_color" value="${
      projectData.pages[projectData.activePage].background.grad_color
    }"></div>`;
    code += `</li>`;
    code += `<li>`;
    code += `<div class="label">Gradient direction</div>`;
    code += `<div class="value">`;
    code += `<select class="property" data-property="grad_dir">`;
    code += `<option value="0"${
      +projectData.pages[projectData.activePage].background.grad_dir === 0
        ? " selected"
        : ""
    }>None</option>`;
    code += `<option value="1"${
      +projectData.pages[projectData.activePage].background.grad_dir === 1
        ? " selected"
        : ""
    }>Horizontal</option>`;
    code += `<option value="2"${
      +projectData.pages[projectData.activePage].background.grad_dir === 2
        ? " selected"
        : ""
    }>Vertical</option>`;
    code += `</select>`;
    code += `</div>`;
    code += `</li>`;
    $("#property-box").html(code);

    $(".input-color").each(function () {
      // console.log(this);
      let a = new jscolor(this, { hash: true });
    });

    $(".property").off();
    $(".property").change(async function (e) {
      let propertyName = e.target.getAttribute("data-property");
      projectData.pages[projectData.activePage].background[propertyName] =
        e.target.value;

      /*
      $("#sketch").css({
        background: `linear-gradient(180deg, ${projectData.pages[projectData.activePage].background.main_color} 0%, ${projectData.pages[projectData.activePage].background.grad_color} 100%)`,
      });
      */
      updateSketchBackground();
    });
  });

  $(document)
    .keydown((e) => {
      if (e.keyCode === 17 || e.keyCode === 91) ctrlDown = true;
    })
    .keyup((e) => {
      if (e.keyCode === 17 || e.keyCode === 91) ctrlDown = false;
    });

  let copyID = "";

  let duplicateComponent = async (sourceID) => {
    if (!sourceID) sourceID = $(".focus").attr("data-id");

    let sourceComponent =
      projectData.pages[projectData.activePage].component[sourceID];

    if (!sourceComponent) {
      return;
    }

    let comp = abstractComponentList.find(
      (e) => e.name === sourceComponent.name
    );

    if (typeof comp === "undefined") {
      alert("Error!, not found " + name);
      return;
    }

    let newID = `component-${componentCount++}`;

    projectData.pages[projectData.activePage].component[newID] = JSON.parse(
      JSON.stringify(sourceComponent)
    );
    projectData.pages[projectData.activePage].component[newID].property.name =
      comp.property.name.default();
    projectData.pages[projectData.activePage].component[newID].property.x += 10;
    projectData.pages[projectData.activePage].component[newID].property.y += 10;

    let element = comp.render.create();
    element.setAttribute("data-id", newID);
    element.setAttribute("class", "component");

    if (
      !projectData.pages[projectData.activePage].component[newID].property
        .parent
    ) {
      svgSketch.appendChild(element);
    } else {
      let nameToId = [];
      for (let ObjName of Object.keys(
        projectData.pages[projectData.activePage].component
      )) {
        nameToId[
          projectData.pages[projectData.activePage].component[
            ObjName
          ].property.name
        ] = ObjName;
      }

      $(svgSketch)
        .find(
          `[data-id='${
            nameToId[
              projectData.pages[projectData.activePage].component[newID]
                .property.parent
            ]
          }']`
        )[0]
        .appendChild(element);
    }

    comp.render.update.bind(
      projectData.pages[projectData.activePage].component[newID]
    )(element);

    reconfigDraggable();

    $(`.component[data-id='${newID}']`).click().mousedown().mouseup();

    copyID = newID;
  };

  $(document).keydown((e) => {
    if (ctrlDown && e.keyCode === 68) {
      // Ctrl+D (D is 68)
      duplicateComponent();
    } /*else if (ctrlDown && e.keyCode === 67) { // Ctrl+C (C is 67)
      copyID = $(".focus").attr("data-id");
    } else if (ctrlDown && e.keyCode === 86) { // Ctrl+V (C is 86)
      if (copyID !== "") {
        duplicateComponent(copyID);
      }
    } */
  });

  grid_size = 100;
  updateSketchBackground();

  simulator_clean();

  $("#sketch").click();
});
