const DEBUG_MODE = true;

/**
 * Dev Logger - log level
 * @param  {...any} args
 */
function devLog(...args) {
  if (DEBUG_MODE) {
    console.log(...args);
  }
}

/**
 * Dev Logger - error level
 * @param  {...any} args
 */
function devError(...args) {
  if (DEBUG_MODE) {
    console.error(...args);
  }
}

module.exports = {
  devLog,
  devError,
};
