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

test('should rotate the log file', (t) => {
  t.plan(1);
  cleanUp();

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
  cleanUp();

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

function cleanUp() {
  const fileName = getFileName();
  if (fs.pathExistsSync(fileName))
    fs.removeSync(fileName);
}

function getFileName() {
  return __dirname + '/console' + dateFormat.format('DDMMYYYY') + '.log';
}