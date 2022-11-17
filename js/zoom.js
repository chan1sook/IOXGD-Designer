const { EventEmitter } = require("events");

let zoomLevel = 1.0;
let isCtrlDown = false;

/**
 * _keysDownsHandler
 * @param {KeyboardEvent} ev
 * @param {Map} keysDowns
 */
function _keysDownsHandler(ev, keysDowns) {
  isCtrlDown =
    keysDowns.get("Control") === true || keysDowns.get("Meta") === true;
}

/**
 * Init zoom module
 * @param {EventEmitter} eventEmitter
 */
function init(eventEmitter) {
  eventEmitter.on("keydown", _keysDownsHandler);
  eventEmitter.on("keyup", _keysDownsHandler);

  const skecthDOM = document.getElementById("sketch");
  const zoomSizeDOM = document.getElementById("zoom-size");
  const zoomInDOM = document.getElementById("zoom-in-btn");
  const zoomOutDOM = document.getElementById("zoom-out-btn");

  const updateZoom = () => {
    if (zoomLevel < 0.1) {
      zoomLevel = 0.1;
    } else if (zoomLevel > 4) {
      zoomLevel = 4;
    }
    skecthDOM.style.transform = `scale(${zoomLevel})`;
    zoomSizeDOM.value = `${Math.round(zoomLevel * 100)}%`;
  };

  const zoomInFn = () => {
    zoomLevel += 0.1;
    updateZoom();
  };

  const zoomOutFn = () => {
    zoomLevel -= 0.1;
    updateZoom();
  };

  zoomInDOM.addEventListener("click", zoomInFn);
  zoomOutDOM.addEventListener("click", zoomOutFn);
  zoomSizeDOM.addEventListener("focus", () => {
    zoomSizeDOM.value = Math.round(zoomLevel * 100);
    zoomSizeDOM.select();
  });

  zoomSizeDOM.addEventListener("blur", () => {
    zoomLevel = parseInt(zoomSizeDOM.value, 10) / 100;
    updateZoom();
  });
  zoomSizeDOM.addEventListener("keypress", (ev) => {
    if (ev.key === "Enter") {
      zoomSizeDOM.blur();
    }
  });

  window.addEventListener("wheel", (ev) => {
    if (!isCtrlDown) {
      return;
    }

    if (ev.deltaY < 0) {
      zoomInFn();
    } else if (ev.deltaY > 0) {
      zoomOutFn();
    }
  });

  const spaceDOMs = Array.from(document.getElementsByClassName("space"));
  spaceDOMs.forEach((element) => {
    element.addEventListener("wheel", (ev) => {
      ev.preventDefault();
    });
  });
}

/**
 * getZoomLevel
 * @returns zoomLevel
 */
function getZoomLevel() {
  return zoomLevel;
}

module.exports = Object.freeze({
  init,
  getZoomLevel,
});
