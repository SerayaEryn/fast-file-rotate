'use strict'

const test = require('ava')
const winston = require('winston')
const FileRotateTransport = require('..')
const DateFormat = require('fast-date-format')
const fs = require('fs')
const path = require('path')

const dateFormat = new DateFormat('DDMMYYYY')

let index = 0

test('should log into file without callback', (t) => {
  t.plan(1)

  const currentIndex = index++
  const transport = new FileRotateTransport({
    fileName: path.join(__dirname, `/tmp/console%DATE%${currentIndex}.log`)
  })
  const logger = winston.createLogger({
    transports: [transport]
  })

  transport.on('logged', () => {
    t.pass()
  })

  logger.info('debug', 'a message')
  logger.end()
})

test('log() should return true', (t) => {
  t.plan(1)

  const currentIndex = index++
  const transport = new FileRotateTransport({
    fileName: path.join(__dirname, `/tmp/console%DATE%${currentIndex}.log`)
  })
  const logger = winston.createLogger({
    transports: [transport]
  })

  t.truthy(logger.info('debug', 'a message'))
  logger.end()
})

test('should create folder', (t) => {
  t.plan(2)

  const currentIndex = index++
  const transport = new FileRotateTransport({
    fileName: path.join(__dirname, `/tmp/console%DATE%${currentIndex}.log`)
  })

  t.truthy(transport)
  t.truthy(fs.existsSync(path.join(__dirname, '/tmp')))
  try {
    fs.unlinkSync(path.join(__dirname, `/tmp/console${dateFormat.format()}${currentIndex}.log`))
  } catch (ignore) {}
})

test.cb('should call callback on log()', (t) => {
  t.plan(3)

  const currentIndex = index++
  const transport = new FileRotateTransport({
    fileName: path.join(__dirname, `/tmp/console%DATE%${currentIndex}.log`)
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
    t.falsy(err)
    t.truthy(logged)
    t.end()
  })
  logger.end()
})

test('should handle missing callback on log()', (t) => {
  t.plan(1)

  const currentIndex = index++
  const transport = new FileRotateTransport({
    fileName: path.join(__dirname, `/tmp/console%DATE%${currentIndex}.log`)
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
})

test('should rotate the log file', (t) => {
  t.plan(1)

  const currentIndex = index++
  const transport = new FileRotateTransport({
    fileName: path.join(__dirname, `/tmp/console%DATE%${currentIndex}.log`)
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
})

test('should bubble events', (t) => {
  t.plan(1)

  const currentIndex = index++
  const transport = new FileRotateTransport({
    fileName: path.join(__dirname, `/tmp/console%DATE%${currentIndex}.log`)
  })

  transport.on('error', (err) => {
    t.truthy(err instanceof Error)
  })
  const err = new Error('something went wrong')
  transport.stream.emit('error', err)
})

test.cb('should wait for close event of stream on close', (t) => {
  t.plan(6)

  const currentIndex = index++
  const transport = new FileRotateTransport({
    fileName: path.join(__dirname, `/tmp/console%DATE%${currentIndex}.log`)
  })
  let finished = false
  transport.on('logged', () => {
    t.falsy(finished)
    logger.end()
  })
  transport.on('close', () => {
    t.truthy(finished)
    t.truthy(transport.stream.destroyed)
  })
  transport.on('finish', () => {
    finished = true
    t.pass()
    fs.readFile(getFileName(currentIndex), (err, buffer) => {
      t.falsy(err)
      t.is(buffer.toString(), '{"level":"info","message":"debug"}\n')
      t.end()
    })
  })
  const logger = winston.createLogger({
    transports: [transport]
  })

  logger.info('debug', 'a message')
})

test.cb('should close ready stream correctly', (t) => {
  t.plan(2)

  const currentIndex = index++
  const transport = new FileRotateTransport({
    fileName: path.join(__dirname, `/tmp/console%DATE%${currentIndex}.log`)
  })

  transport.stream.on('ready', () => {
    logger.end()
  })
  transport.on('close', () => {
    t.truthy(transport.stream.destroyed)
    t.end()
  })
  transport.on('finish', () => {
    t.pass()
  })
  const logger = winston.createLogger({
    transports: [transport]
  })

  logger.info('debug', 'a message')
})

test.cb('should close new transport correctly', (t) => {
  t.plan(1)

  const currentIndex = index++
  const transport = new FileRotateTransport({
    fileName: path.join(__dirname, `/tmp/console%DATE%${currentIndex}.log`)
  })

  transport.on('finish', () => {
    t.pass()
    t.end()
  })
  transport.end()
})

test.after('cleanup', (t) => {
  cleanUp()
})

function cleanUp () {
  for (let i = 0; i < index; i++) {
    const file = path.join(__dirname, `/tmp/console${dateFormat.format()}${i}.log`)
    if (fs.existsSync(file)) {
      fs.unlinkSync(file)
    }
  }
  fs.rmdirSync(path.join(__dirname, '/tmp'))
}

function getFileName (index) {
  return path.join(__dirname, `/tmp/console${dateFormat.format()}${index}.log`)
}
