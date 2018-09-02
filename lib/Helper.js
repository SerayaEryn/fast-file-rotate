'use strict'

function bubbleEvents (events, emitterA, emitterB) {
  for (const event of events) {
    emitterA.on(event, (...args) => {
      emitterB.emit(event, ...args)
    })
  }
}

module.exports = {
  bubbleEvents
}
