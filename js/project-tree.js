const projectTreeDOM = document.getElementById("project-tree");

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
      dom.innerHTML = `<i class="fas fa-caret-down fa-fw"></i> ${page.name}`;
      projectTreeDOM.appendChild(dom);

      for (const component of page.children) {
        const dom = document.createElement("div");
        dom.dataset["level"] = "1";
        dom.innerHTML = `<i class="fas fa-caret-down fa-fw"></i> ${component.name}`;
        projectTreeDOM.appendChild(dom);
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
