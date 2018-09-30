'use strict'

const tap = require('tap')
const test = tap.test
const winston = require('winston')
const FileRotateTransport = require('..')
const DateFormat = require('fast-date-format')
const fs = require('fs-extra')
const path = require('path')

const dateFormat = new DateFormat()

test('should log into file without callback', (t) => {
  t.plan(1)
  cleanUp()

  const transport = new FileRotateTransport({
    fileName: path.join(__dirname, '/console%DATE%.log')
  })
  const logger = winston.createLogger({
    transports: [transport]
  })

  transport.on('logged', () => {
    t.pass()
  })

  logger.info('debug', 'a message')
  logger.end()
  cleanUp()
})

test('log() should return true', (t) => {
  t.plan(1)
  cleanUp()

  const transport = new FileRotateTransport({
    fileName: path.join(__dirname, '/console%DATE%.log')
  })
  const logger = winston.createLogger({
    transports: [transport]
  })

  t.ok(logger.info('debug', 'a message'))
  logger.end()
  cleanUp()
})

test('should call callback on log()', (t) => {
  t.plan(3)
  cleanUp()

  const transport = new FileRotateTransport({
    fileName: path.join(__dirname, '/console%DATE%.log')
  })
  const logger = winston.createLogger({
    transports: [transport]
  })

  transport.on('logged', () => {
    t.pass()
  })

  transport.log({
    level: 'debug',
    message: 'a message'
  }, (err, logged) => {
    t.error(err)
    t.ok(logged)
  })
  logger.end()
  cleanUp()
})

test('should handle missing callback on log()', (t) => {
  t.plan(1)
  cleanUp()

  const transport = new FileRotateTransport({
    fileName: path.join(__dirname, '/console%DATE%.log')
  })
  const logger = winston.createLogger({
    transports: [transport]
  })

  transport.on('logged', () => {
    t.pass()
  })

  transport.log({
    level: 'debug',
    message: 'a message'
  })
  logger.end()
  cleanUp()
})

test('should rotate the log file', (t) => {
  t.plan(1)

  const transport = new FileRotateTransport({
    fileName: path.join(__dirname, '/console%DATE%.log')
  })
  transport.stream.currentDate = ~~(Date.now() / 86400000) - 1
  const logger = winston.createLogger({
    transports: [transport]
  })

  transport.on('logged', () => {
    t.pass()
  })

  logger.info('debug', 'a message')
  logger.end()
  cleanUp()
})

test('should bubble events', (t) => {
  t.plan(1)

  const transport = new FileRotateTransport({
    fileName: path.join(__dirname, '/console%DATE%.log')
  })

  transport.on('error', (err) => {
    t.ok(err instanceof Error)
  })
  const err = new Error('something went wrong')
  transport.stream.stream.emit('error', err)

  cleanUp()
})

test('should wait for close event of stream on close', (t) => {
  t.plan(6)
  cleanUp()

  const transport = new FileRotateTransport({
    fileName: path.join(__dirname, '/console%DATE%.log')
  })
  let finished = false
  transport.on('logged', () => {
    t.notOk(finished)
    logger.end()
  })
  transport.on('close', () => {
    t.ok(finished)
    t.ok(transport.stream.stream.destroyed)
  })
  transport.on('finish', () => {
    finished = true
    t.pass()
    fs.readFile(getFileName(), (err, buffer) => {
      t.error(err)
      t.strictEquals(buffer.toString(), '{"level":"info","message":"debug"}\n')
      cleanUp()
    })
  })
  const logger = winston.createLogger({
    transports: [transport]
  })

  logger.info('debug', 'a message')
})

test('should close ready stream correctly', (t) => {
  t.plan(2)

  const transport = new FileRotateTransport({
    fileName: path.join(__dirname, '/console%DATE%.log')
  })

  transport.stream.stream.on('ready', () => {
    logger.end()
  })
  transport.on('close', () => {
    t.ok(transport.stream.stream.destroyed)
  })
  transport.on('finish', () => {
    t.pass()
    cleanUp()
  })
  const logger = winston.createLogger({
    transports: [transport]
  })

  logger.info('debug', 'a message')
})

test('should close new transport correctly', (t) => {
  t.plan(1)

  const transport = new FileRotateTransport({
    fileName: path.join(__dirname, '/console%DATE%.log')
  })

  transport.on('finish', () => {
    t.pass()
    cleanUp()
  })
  transport.end()
})

test('should set buffer size correctly', (t) => {
  t.plan(1)

  const transport = new FileRotateTransport({
    fileName: path.join(__dirname, '/console%DATE%.log'),
    bufferSize: 32
  })

  t.strictEquals(transport.stream.stream.minLength, 32)
})

test('should use default buffer size', (t) => {
  t.plan(1)

  const transport = new FileRotateTransport({
    fileName: path.join(__dirname, '/console%DATE%.log'),
    bufferSize: null
  })

  t.strictEquals(transport.stream.stream.minLength, 4096)
})

function cleanUp () {
  const fileName = getFileName()
  if (fs.pathExistsSync(fileName)) {
    fs.removeSync(fileName)
  }
}

function getFileName () {
  return path.join(__dirname, `/console${dateFormat.format('DDMMYYYY')}.log`)
}
