const projectTreeDOM = document.getElementById("project-tree");
const sketchDOM = document.getElementById("sketch");
/**
 * Init projectTree module
 * @param {EventEmitter} eventEmiiter
 * @param {Object} projectData
 */
function init(eventEmiiter, projectData) {
  const updateFn = () => {
    projectTreeDOM.innerHTML = "";
    for (const page of projectData.pages) {
      const dom = document.createElement("div");
      dom.innerHTML = `<i class="fas fa-caret-right fa-fw"></i> ${page.name}`;
      projectTreeDOM.appendChild(dom);

      for (const component of page.children) {
        const dom = document.createElement("div");
        dom.dataset["level"] = "1";
        let iconGroup = "fas fa-caret-right";
        const templateComponent = abstractComponentList.find(
          (ele) => ele.type === component.type
        );
        if (templateComponent) {
          const regexGroup = /class="(.+)"/.exec(templateComponent.icon);
          if (regexGroup.length >= 2) {
            iconGroup = regexGroup[1];
          }
        }
        dom.innerHTML = `<i class="${iconGroup} fa-fw"></i> ${component.property.name}`;
        dom.title = `${component.type} ${component.property.name}`;
        projectTreeDOM.appendChild(dom);

        dom.addEventListener("click", () => {
          const selectDOM = sketchDOM.querySelector(
            `.component[data-name="${component.property.name}"]`
          );
          if (selectDOM) {
            const focusDOM = document.getElementsByClassName("focus").item(0);
            if (focusDOM) {
              focusDOM.classList.remove("focus");
            }
            let parent = selectDOM;
            while (
              parent !== sketchDOM &&
              !parent.classList.contains("component")
            ) {
              parent = parent.parentElement;
            }

            if (parent !== sketchDOM) {
              parent.classList.add("focus");
            }

            updateComponentFrame();
            updatePropertyTable();
          }
        });
      }
    }
    projectTreeDOM.style.display = "block";
  };

  eventEmiiter.on("updateProjectTree", updateFn);
  updateFn();
}

module.exports = Object.freeze({
  init,
});
