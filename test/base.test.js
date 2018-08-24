'use strict';

const tap = require('tap');
const test = tap.test;
const winston = require('winston');
const FileRotateTransport = require('..')
const DateFormat = require('fast-date-format');
const fs = require('fs-extra');

const dateFormat = new DateFormat();

test('should log into file without callback', (t) => {
  t.plan(1);
  cleanUp()

  const transport = new FileRotateTransport({
    fileName: __dirname + '/console%DATE%.log'
  });
  const logger = winston.createLogger({
    transports: [transport]
  });

  transport.on('logged', () => {
    t.pass();
  })

  logger.info('debug', 'a message');
  logger.end();
  cleanUp();
});

test('should call callback on log()', (t) => {
  t.plan(3);
  cleanUp()

  const transport = new FileRotateTransport({
    fileName: __dirname + '/console%DATE%.log'
  });
  const logger = winston.createLogger({
    transports: [transport]
  });

  transport.on('logged', () => {
    t.pass();
  })

  transport.log({
    level: 'debug', 
    message: 'a message'
  }, (err, logged) => {
    t.error(err);
    t.ok(logged);
  });
  logger.end();
  cleanUp();
});

test('should handle missing callback on log()', (t) => {
  t.plan(1);
  cleanUp()

  const transport = new FileRotateTransport({
    fileName: __dirname + '/console%DATE%.log'
  });
  const logger = winston.createLogger({
    transports: [transport]
  });

  transport.on('logged', () => {
    t.pass();
  })

  transport.log({
    level: 'debug', 
    message: 'a message'
  });
  logger.end();
  cleanUp();
});

test('should rotate the log file', (t) => {
  t.plan(1);

  const transport = new FileRotateTransport({
    fileName: __dirname + '/console%DATE%.log'
  });
  transport.stream.currentDate = ~~(Date.now() / 86400000) - 1;
  const logger = winston.createLogger({
    transports: [transport]
  });

  transport.on('logged', () => {
    t.pass();
  })

  logger.info('debug', 'a message');
  logger.end();
  cleanUp();
});

test('should bubble events', (t) => {
  t.plan(1);

  const transport = new FileRotateTransport({
    fileName: __dirname + '/console%DATE%.log'
  });

  transport.on('error', (err) => {
    t.ok(err instanceof Error);
  });
  const err = new Error('something went wrong');
  transport.stream.stream.emit('error', err);

  cleanUp();
});

test('should wait for close event of stream on close', (t) => {
  t.plan(2);

  const transport = new FileRotateTransport({
    fileName: __dirname + '/console%DATE%.log'
  });

  transport.on('logged', () => {
    logger.end();
  });
  transport.on('close', () => {
    t.ok(transport.stream.stream.destroyed);
  });
  transport.on('finish', () => {
    t.pass();
    cleanUp();
  })
  const logger = winston.createLogger({
    transports: [transport]
  });

  logger.info('debug', 'a message');
});

test('should close ready stream correctly', (t) => {
  t.plan(2);

  const transport = new FileRotateTransport({
    fileName: __dirname + '/console%DATE%.log'
  });

  transport.stream.stream.on('ready', () => {
    logger.end();
  });
  transport.on('close', () => {
    t.ok(transport.stream.stream.destroyed);
  });
  transport.on('finish', () => {
    t.pass();
    cleanUp();
  })
  const logger = winston.createLogger({
    transports: [transport]
  });

  logger.info('debug', 'a message');
});

test('should close new transport correctly', (t) => {
  t.plan(1);

  const transport = new FileRotateTransport({
    fileName: __dirname + '/console%DATE%.log'
  });

  transport.on('finish', () => {
    t.pass();
    cleanUp();
  })
  transport.end();
});

function cleanUp() {
  const fileName = getFileName();
  if (fs.pathExistsSync(fileName))
    fs.removeSync(fileName);
}

function getFileName() {
  return __dirname + '/console' + dateFormat.format('DDMMYYYY') + '.log';
}