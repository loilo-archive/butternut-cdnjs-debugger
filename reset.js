const chalk = require('chalk')

process.stdout.write(`${chalk.blue.inverse(' WAIT ')} Deleting information...`)

require('./src/reset')()
.then(() => {
  process.stdout.clearLine()
  process.stdout.cursorTo(0)
  process.stdout.write(`${chalk.green.inverse(' DONE ')} Successfully reset cache and information about handled libraries.\n`)
})
.catch(err => {
  process.stdout.clearLine()
  process.stdout.cursorTo(0)
  process.stdout.write(`${chalk.red.inverse(' ERR ')} Could not fully reset:\n`)
  process.stderr.write(err)
})