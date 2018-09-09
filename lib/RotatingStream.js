'use strict'

const SonicBoom = require('sonic-boom')
const DateFormat = require('fast-date-format')
const fsExtra = require('fs-extra/lib/mkdirs')
const EventEmitter = require('events')
const helper = require('./Helper')

const dateFormat = new DateFormat()

const DATE_FORMAT = 'DDMMYYYY'

module.exports = class RotatingStream extends EventEmitter {
  constructor (options) {
    super()
    this.fileName = options.fileName
    this.dateFormat = options.dateFormat || DATE_FORMAT
    this.currentDate = Math.floor(Date.now() / 86400000)

    const formatted = dateFormat.format(this.dateFormat)
    this.logfile = this.fileName.replace(/%DATE%/g, formatted)

    this._ensureDirectoryExists()
    this._ready = false
    const bufferSize = options.bufferSize != null ? options.bufferSize : 4096
    this.stream = new SonicBoom(this.logfile, bufferSize)
    helper.bubbleEvents(['close', 'finish', 'error'], this.stream, this)
    this.stream.on('ready', () => {
      this._ready = true
    })
  }

  write (string) {
    if (~~(Date.now() / 86400000) !== this.currentDate) {
      this._rotate()
    }
    this.stream.write(string)
  }

  end () {
    if (!this._ready) {
      this.stream.on('ready', () => {
        this.stream.end()
      })
    } else {
      this.stream.end()
    }
  }

  _ensureDirectoryExists () {
    const index = this.logfile.lastIndexOf('/')
    const path = this.logfile.substring(0, index)
    fsExtra.ensureDirSync(path)
  }

  _rotate () {
    const newDate = dateFormat.format(this.dateFormat)
    const newLogfile = this.fileName.replace(/%DATE%/g, newDate)
    this.currentDate = Math.floor(Date.now() / 86400000)
    this.stream.reopen(newLogfile)
  }
}
