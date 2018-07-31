'use strict';

const benchmark = require('fastbench');
const FileRotateTransport = require('../');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const MESSAGE = Symbol.for('message');

class JsonFormat {
  transform(info, opts) {
    info[MESSAGE] = `{"level":"${info.level}","message":"${info.message}"}`;
    return info;
  }
}

const winston1 = winston.createLogger({
  transports: [
    new FileRotateTransport({
      fileName: __dirname + '/console1%DATE%.log',
      datePattern: 'DDMMYYYY'
    })
  ],
  format: new JsonFormat()
});

const winston2 = winston.createLogger({
  transports: [
    new DailyRotateFile({
      filename: __dirname + '/console2%DATE%.log',
      datePattern: 'DDMMYYYY'
    })
  ],
  format: new JsonFormat()
});

const run = benchmark([
  function benchFastFileRotate (cb) {
    for (let i = 0; i < 10; i++) {
      winston1.log('info', 'hello world!');
    }
    setImmediate(cb);
  },
  function benchWinstonDailyRotateFile (cb) {
    for (let i = 0; i < 10; i++) {
      winston2.log('info', 'hello world!');
    }
    setImmediate(cb);
  }
], 10000);

run(run);
