const chalk = require('chalk')

const stWait = chalk.blue.inverse(' WAIT ')
const stDone = chalk.green.inverse(' DONE ')
const stErr = chalk.red.inverse(' ERR  ')

/**
 * Takes a Map<string, Promise> and prints its entries to the console
 * preceded by their current state.
 * 
 * Returns a promise that resolves when all message promises have finished.
 */
module.exports = (msgPromiseMap, {
  clearScreen = false,
  lineOffset = 0
} = {}) => {
  let counter = 0

  let init = false
  const showMsg = (msg, promise) => {
    if (!init && clearScreen) {
      init = true
      process.stdout.write('\033c')
    }

    process.stdout.write(`${stWait} ${msg}\n`)

    const current = counter
    counter++

    return promise
      .then(() => {
        process.stdout.cursorTo(0, lineOffset + current)
        process.stdout.clearLine()
        process.stdout.write(`${stDone} ${msg}\n`)
        process.stdout.cursorTo(0, lineOffset + counter)
      })
      .catch(err => {
        process.stdout.cursorTo(0, lineOffset + current)
        process.stdout.clearLine()
        process.stdout.write(`${stErr} ${err || msg}\n`)
        process.stdout.cursorTo(0, lineOffset + counter)
      })
  }

  return Promise.all(
    [...msgPromiseMap].map(([ msg, promise ]) => {
      return showMsg(msg, promise)
    })
  )
}