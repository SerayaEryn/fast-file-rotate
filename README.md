# fast-file-rotate

[![Build Status](https://travis-ci.org/SerayaEryn/fast-file-rotate.svg?branch=master)](https://travis-ci.org/SerayaEryn/fast-file-rotate)
[![Coverage Status](https://coveralls.io/repos/github/SerayaEryn/fast-file-rotate/badge.svg?branch=master)](https://coveralls.io/github/SerayaEryn/fast-file-rotate?branch=master)
[![NPM version](https://img.shields.io/npm/v/fast-file-rotate.svg?style=flat)](https://www.npmjs.com/package/fast-file-rotate) [![Greenkeeper badge](https://badges.greenkeeper.io/SerayaEryn/fast-file-rotate.svg)](https://greenkeeper.io/)

A performant file transport providing daily log rotation for winston.

## Install

```bash
npm install fast-file-rotate
```

## Example

```js
const FileRotateTransport = require('fast-file-rotate');
const winston = require('winston');

const logger = winston.createLogger({
  transports: [
    new FileRotateTransport({
      fileName: __dirname + '/console%DATE%.log',
      dateFormat: 'DDMMYYYY'
    })
  ]
})
```

## Benchmark

The benchmark compares to the [winston-daily-rotate-file](https://github.com/winstonjs/winston-daily-rotate-file) module:

```
benchFastFileRotate*10000: 175.397ms
benchWinstonDailyRotateFile*10000: 580.341ms
benchFastFileRotate*10000: 141.746ms
benchWinstonDailyRotateFile*10000: 545.736ms
```

## License

[MIT](./LICENSE)