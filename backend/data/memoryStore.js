const { createSeedState } = require("./seed");

let memoryState = createSeedState();

/**
 * Returns the active in-memory state.
 * @returns {{ users: Array<object>, employees: Array<object> }} The mutable in-memory state.
 */
function getMemoryState() {
  return memoryState;
}

/**
 * Resets the in-memory state back to the seeded fixtures.
 * @returns {{ users: Array<object>, employees: Array<object> }} The reset in-memory state.
 */
function resetMemoryState() {
  memoryState = createSeedState();
  return memoryState;
}

module.exports = {
  getMemoryState,
  resetMemoryState,
};
