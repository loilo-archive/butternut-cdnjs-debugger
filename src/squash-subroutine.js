const [ name, url ] = process.argv.slice(2)

const fs = require('fs-extra')
const { resolve } = require('path')

const butternut = require('butternut')
const got = require('got')

const paths = require('./paths')

;(async function() {
  const response = await got(url)
  const source = response.body

  let output, success
  let pos = null

  let createErrorFile = Promise.resolve()
  let writeSource = Promise.resolve()
  let createReproInputFile = Promise.resolve()
  let createReproOutputFile = Promise.resolve()

  try {
    result = butternut.squash(source, {
      check: true,
      sourceMap: false,
      allowDangerousEval: true
    })

    success = true
    output = result.code
  } catch (err) {
    success = false

    await fs.remove(resolve(paths.failedLibs, name))
    await fs.mkdirs(resolve(paths.failedLibs, name))

    writeSource = fs.writeFile(
      resolve(paths.failedLibs, name, 'source.js'),
      source
    )

    if (err.repro) {
      createErrorFile = fs.writeFile(
        resolve(paths.failedLibs, name, 'error.json'),
        JSON.stringify(err.repro, null, 2)
      )

      if (err.repro.input) {
        createReproInputFile = fs.writeFile(
          resolve(paths.failedLibs, name, 'repro.input.js'),
          err.repro.input
        )
      }

      if (err.repro.output) {
        createReproOutputFile = fs.writeFile(
          resolve(paths.failedLibs, name, 'repro.output.js'),
          err.repro.output
        )
      }
    } else {
      createErrorFile = fs.writeFile(
        resolve(paths.failedLibs, name, 'error.txt'),
        String(err.stack)
      )
    }
  }

  await Promise.all([
    createErrorFile,
    createReproInputFile,
    createReproOutputFile,
    writeSource
  ])

  // If forked
  if (process.send) {
    process.send({
      name,
      success,
      output,
      pos
    })
  }
})()
.catch(err => {
  console.error('ERR', err)

  if (process.send) {
    process.send({
      name,
      success: false
    })
  }
})