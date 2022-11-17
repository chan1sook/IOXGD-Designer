function getCurrentPage() {
  return projectData.pages[projectData.activePage];
}

function updateComponentFrame() {
  const componentFramesDOM = Array.from(
    document.getElementsByClassName("component-frame")
  );
  const focusDOMs = document.getElementsByClassName("focus");

  if (focusDOMs.length > 0) {
    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;
    const focusDOM = focusDOMs.item(0);
    const id = focusDOM.getAttribute("data-id");
    const seq = parseInt(id.replace("component-", ""), 10);

    const currentPage = getCurrentPage();
    const currentComponent = currentPage.children[seq];
    let name = currentComponent.name;

    let comp = abstractComponentList.find((ele) => ele.name === name);
    if (typeof comp === "undefined") {
      alert("Error!, not found " + name);
      return;
    }

    let move = comp.render.frame.bind(currentComponent)();
    if (move.length === 4) {
      x = move[0];
      y = move[1];
      width = move[2];
      height = move[3];
    } else if (move.length == 2) {
      x = move[0];
      y = move[1];
      width = focusDOM.offsetWidth;
      height = focusDOM.offsetHeight;
    } else {
      x = focusDOM.offsetLeft;
      y = focusDOM.offsetTop;
      width = focusDOM.offsetWidth;
      height = focusDOM.offsetHeight;
    }

    if (typeof currentComponent.property.parent !== "undefined") {
      if (currentComponent.property.parent !== "") {
        let parentName = currentComponent.property.parent;
        let nameToId = {};

        for (let i = 0; i < currentPage.children.length; i += 1) {
          nameToId[currentPage.children[i].property.name] = i;
        }

        while (1) {
          // loop find last parent
          let parentId = nameToId[parentName];
          let parent = $(svgSketch).find(
            `[data-id='component-${parentId}']`
          )[0];
          x += parent.offsetLeft;
          y += parent.offsetTop;
          parentName = currentPage.children[parentId].property.parent || "";
          if (parentName === "") {
            break;
          }
        }
      }
    }

    // Top
    const topFrameDom = componentFramesDOM.find((ele) =>
      ele.classList.contains("top")
    );
    topFrameDom.style.left = `${x - 1}px`;
    topFrameDom.style.top = `${y - 1}px`;
    topFrameDom.style.width = `${width + 2}px`;

    // Right
    const rightFrameDom = componentFramesDOM.find((ele) =>
      ele.classList.contains("right")
    );
    rightFrameDom.style.left = `${x + width}px`;
    rightFrameDom.style.top = `${y - 1}px`;
    rightFrameDom.style.height = `${height + 2}px`;

    // Bottom
    const bottomFrameDom = componentFramesDOM.find((ele) =>
      ele.classList.contains("bottom")
    );
    bottomFrameDom.style.left = `${x - 1}px`;
    bottomFrameDom.style.top = `${y + height}px`;
    bottomFrameDom.style.width = `${width + 2}px`;

    // Left
    const leftFrameDom = componentFramesDOM.find((ele) =>
      ele.classList.contains("left")
    );
    leftFrameDom.style.left = `${x - 1}px`;
    leftFrameDom.style.top = `${y - 1}px`;
    leftFrameDom.style.height = `${height + 2}px`;

    for (const dom of componentFramesDOM) {
      dom.style.display = "block";
    }
  } else {
    for (const dom of componentFramesDOM) {
      dom.style.display = "none";
    }
  }
}

function removeAllComponent() {
  $(svgSketch).find(".component").remove();
  componentList = {};
}

let show_grid = false;
let grid_size = 100;

let updateSketchBackground = () => {
  let canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 480;
  let ctx = canvas.getContext("2d");

  const currentPage = getCurrentPage();

  if (+currentPage.options.grad_dir === 0) {
    ctx.fillStyle = currentPage.options.main_color;
  } else {
    let gradient;
    if (+currentPage.options.grad_dir === 1) {
      gradient = ctx.createLinearGradient(0, 0, 800, 0);
    } else if (+currentPage.options.grad_dir === 2) {
      gradient = ctx.createLinearGradient(0, 0, 0, 480);
    }
    gradient.addColorStop(0, currentPage.options.main_color);
    gradient.addColorStop(1, currentPage.options.grad_color);
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
      const seq = parseInt(id.replace("component-", ""), 10);
      focus.remove();
      delete getCurrentPage().children[seq];

      appEventEmitter.emit("updateProjectTree");
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

    const currentPage = getCurrentPage();

    let code = "";
    code += `<li>`;
    code += `<div class="label">Main color</div>`;
    code += `<div class="value"><input type="text" class="input-color property" data-property="main_color" value="${currentPage.options.main_color}"></div>`;
    code += `</li>`;
    code += `<li>`;
    code += `<div class="label">Gradient color</div>`;
    code += `<div class="value"><input type="text" class="input-color property" data-property="grad_color" value="${currentPage.options.grad_color}"></div>`;
    code += `</li>`;
    code += `<li>`;
    code += `<div class="label">Gradient direction</div>`;
    code += `<div class="value">`;
    code += `<select class="property" data-property="grad_dir">`;
    code += `<option value="0"${
      +currentPage.options.grad_dir === 0 ? " selected" : ""
    }>None</option>`;
    code += `<option value="1"${
      +currentPage.options.grad_dir === 1 ? " selected" : ""
    }>Horizontal</option>`;
    code += `<option value="2"${
      +currentPage.options.grad_dir === 2 ? " selected" : ""
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
      currentPage.options[propertyName] = e.target.value;

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

    const seq = parseInt(sourceID.replace("component-", ""), 10);
    const currentPage = getCurrentPage();
    let sourceComponent = currentPage.children[seq];

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

    componentCount += 1;
    let newID = `component-${componentCount}`;
    const newSeq = componentCount;

    currentPage.children[newSeq] = JSON.parse(JSON.stringify(sourceComponent));
    currentPage.children[newSeq].property.name = comp.property.name.default();
    currentPage.children[newSeq].property.x += 10;
    currentPage.children[newSeq].property.y += 10;

    let element = comp.render.create();
    element.setAttribute("data-id", newID);
    element.setAttribute("class", "component");

    if (!currentPage.children[newSeq].property.parent) {
      svgSketch.appendChild(element);
    } else {
      let nameToId = {};
      for (let i = 0; i < currentPage.children.length; i += 1) {
        nameToId[currentPage.children[i].property.name] = i;
      }

      $(svgSketch)
        .find(
          `[data-id='component-${
            nameToId[currentPage.children[newSeq].property.parent]
          }']`
        )[0]
        .appendChild(element);
    }

    comp.render.update.bind(currentPage.children[newSeq])(element);

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
