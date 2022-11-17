const { EventEmitter } = require("events");

const keysDowns = new Map();

/**
 * Init keyboard event
 * @param {EventEmitter} eventEmitter
 */
function init(eventEmitter) {
  document.addEventListener("keydown", (ev) => {
    keysDowns.set(ev.key, true);
    eventEmitter.emit("keydown", ev, keysDowns);
  });
  document.addEventListener("keyup", (ev) => {
    keysDowns.set(ev.key, false);
    eventEmitter.emit("keyup", ev, keysDowns);
  });
}

module.exports = Object.freeze({
  init,
});
