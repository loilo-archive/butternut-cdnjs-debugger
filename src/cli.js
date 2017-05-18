const argv = require('minimist')(process.argv.slice(2))

const fs = require('fs-extra')
const path = require('path')
const { EOL } = require('os')
const padStart = require('lodash.padstart')

const sourcesList = require('./sources-list')
const isNaturalNum = require('./is-natural-num')
const hasRegexFormat = require('./has-regex-format')
const createRegex = require('./create-regex')
const msgGroup = require('./state-message-group')
const squashLib = require('./squash-lib')
const paths = require('./paths')

const take = (argv.take == 0 || argv.t == 0)
  ? Infinity
  : +(argv.take || argv.t || 25)
const chunkSize = +(argv['chunk-size'] || argv.c || 10)
const skip = argv['skip-until'] || argv.s || '0'
const ignoreCache = argv['ignore-cache'] || argv.i || false

;(async () => {
  // Get list of available libraries
  const getSources = sourcesList.getSources(ignoreCache)
  await msgGroup(new Map([
    ['Fetching sources list', getSources]
  ]), {
    clearScreen: true
  })
  const sources = await getSources

  // Get a list of already handled libraries
  const handled = await fs.exists(paths.handledSourcesList)
    ? (await fs.readFile(paths.handledSourcesList, 'utf8')).trim().split(EOL).map(line => line.trim())
    : []


  // Track number of already added items to respect the given cap
  let libsToHandleCounter = 0
  let keepRegexSkipping = true

  // Array of libraries to process in this request.
  // Structure: Array<{ name: string, latest: string }>
  const libsToHandle = sources.filter((lib, index) => {
    if (libsToHandleCounter === take) {
      return false
    }

    // Don't add already handled libraries
    if (!ignoreCache && handled.includes(lib.name)) {
      return false
    }

    // Handle numeric, string or regex offset
    let skipped = false
    if (isNaturalNum(skip)) {
      skipped = index < skip
    } else if (hasRegexFormat(skip)) {
      if (keepRegexSkipping) {
        skipped = !createRegex(skip).test(lib.name)
        keepRegexSkipping = skipped
      }
    } else {
      skipped = lib.name.localeCompare(skip) < 0
    }

    if (skipped) {
      return false
    }

    libsToHandleCounter++

    return true
  })

  if (!libsToHandle.length) {
    console.log('No libraries are matching your criteria.')
  }

  // Clear the queue in chunks
  const libQueue = libsToHandle.slice(0)
  const rows = process.stdout.rows
  let outputCounter = 1
  let counter = 1

  while (libQueue.length) {
    const currentChunk = libQueue.splice(0, chunkSize)

    // Map library names to their finishing promises
    const libsDoneMap = new Map(currentChunk.map((lib, index) => [
      `${padStart(counter + index, String(libsToHandle.length).length)} / ${libsToHandle.length}  ${lib.name}`,
      squashLib(lib)
    ]))

    // Clear screen if list gets too long
    let clearScreen = false
    if (outputCounter + currentChunk.length >= rows) {
      clearScreen = true
      outputCounter = 0
    }

    // Wait for the work to be done :)
    await msgGroup(libsDoneMap, {
      clearScreen,
      lineOffset: outputCounter
    })

    outputCounter += currentChunk.length
    counter += currentChunk.length

    // Append freshly handled libraries to the .handled-sources file
    if (!ignoreCache) {
      await fs.writeFile(
        paths.handledSourcesList,
        currentChunk.map(lib => lib.name + EOL).join(''),
        { flag: 'a' }
      )
    }
  }
})()
.catch(err => {
  console.error(err)
})