'use strict';

const os = require('os');
const Transport = require('winston-transport');
const RotatingStream = require('./RotatingStream');
const helper = require('./Helper');

const MESSAGE = Symbol.for('message');

module.exports = class FileRotateTransport extends Transport {
  constructor(options) {
    super(options);
    this.eol = options.eol || os.EOL;
    this.stream = new RotatingStream(options);
    helper.bubbleEvents(this.stream, this);
  }

  log(info, callback = () => {}) {
    this.stream.write(info[MESSAGE] + this.eol);
    this.emit('logged', info);
    callback(null, true);
  }

  close() {
    this.stream.end();
    this.emit('finish');
  }
}
