'use strict';



function bubbleEvents(emitterA, emitterB) {
  for (const event of ['close', 'finish', 'error']) {
    emitterA.on(event, (...args) => {
      emitterB.emit(event, ...args);
    });
  }
}

module.exports = {
  bubbleEvents
};
