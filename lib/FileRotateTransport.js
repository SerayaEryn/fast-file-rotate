'use strict'

const os = require('os')
const Transport = require('winston-transport')
const RotatingStream = require('daily-rotating-file-stream')

const MESSAGE = Symbol.for('message')

module.exports = class FileRotateTransport extends Transport {
  constructor (options) {
    super(options)
    this.eol = options.eol || os.EOL
    this.stream = new RotatingStream(options)
    bubbleEvents(['close', 'error'], this.stream, this)
  }

  log (info, callback = () => {}) {
    this.stream.write(info[MESSAGE] + this.eol)
    this.emit('logged', info)
    callback(null, true)
  }

  _final (callback) {
    this.stream.on('finish', callback)
    this.stream.end()
  }
}

function bubbleEvents (events, emitterA, emitterB) {
  for (const event of events) {
    emitterA.on(event, (...args) => {
      emitterB.emit(event, ...args)
    })
  }
}
