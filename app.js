const {
  LASTEST_VERSION,
  loadDataFromFile,
  saveDataToFile,
} = require("./js/savefile.js");
const { devLog } = require("./js/loggers.js");
const zoomModule = require("./js/zoom.js");

let projectData = {
  version: LASTEST_VERSION,
  fonts: [],
  activePage: 0,
  pages: [
    {
      name: "index",
      background: {
        main_color: "#FFFFFF",
        grad_color: "#FFFFFF",
        grad_dir: "0",
      },
      component: {},
    },
  ],
};
const keysDowns = new Map();

document.addEventListener("keydown", (ev) => {
  keysDowns.set(ev.key, true);
});
document.addEventListener("keyup", (ev) => {
  keysDowns.set(ev.key, false);
});

document.addEventListener("DOMContentLoaded", () => {
  zoomModule.init(keysDowns);
});

function reconfigDraggable() {
  let element = $("#sketch > .component");

  element.off();

  element.bind("mousedown", function (event, ui) {
    // bring target to front
    $(".focus").removeClass("focus");
    // $(event.target.parentElement).append(event.target)
    // console.log(event.target);
    if (event.target.classList.contains("component")) {
      $(event.target).addClass("focus");
    } else {
      $(event.target).parent(".component").addClass("focus");
    }

    updateComponentFrame();
    updatePropertyTable();

    let startX = event.pageX;
    let startY = event.pageY;

    let offsetX = parseInt($(".input-x-offset").val());
    let offsetY = parseInt($(".input-y-offset").val());

    $("#sketch")
      .bind("mousemove", function (event, ui) {
        const zoomMult = zoomModule.getZoomLevel();

        let moveX = (event.pageX - startX) / zoomMult;
        let moveY = (event.pageY - startY) / zoomMult;

        moveX += offsetX;
        moveY += offsetY;

        moveX = Math.round(moveX / 10) * 10;
        moveY = Math.round(moveY / 10) * 10;

        $(".input-x-offset").val(Math.round(moveX)).change();
        $(".input-y-offset").val(Math.round(moveY)).change();
      })

      .bind("mouseup", function (event, ui) {
        $(this).unbind("mousemove");
        $(this).unbind("mouseup");
      });
  });

  element.bind("mouseup", function (event, ui) {
    $(this).unbind("mousemove");
    $(this).unbind("mouseup");
  });
}

async function loadProject(file, cb) {
  const fileProjectData = await loadDataFromFile(file);

  devLog("fileProjectData", fileProjectData);

  if (fileProjectData) {
    projectData = fileProjectData;

    await updateFontInArray();
    rerenderComponent();
    $("#sketch").click();
    $(".property").change();

    if (typeof cb === "function") cb();
  }
}

function saveProject(filepath, cb) {
  saveDataToFile(projectData, filepath, cb);
}
