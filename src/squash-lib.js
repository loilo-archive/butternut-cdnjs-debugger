const path = require('path')
const { fork } = require('child_process')

// Squashes a given library object in a subroutine.
// Library format: { name: library name, latest: URL to source file }
// 
// Returns a promise when finished.
module.exports = ({ name, latest }) => new Promise((resolve, reject) => {
  const child = fork(
    path.resolve(__dirname, 'squash-subroutine.js'),
    [ name, latest ]
  )

  child.on('message', ({ name, success }) => {
    if (success) {
      resolve()
    } else {
      reject()
    }
  })

  // Reject if the subroutine fails
  child.on('error', err => {
    reject(err)
  })

  // Resolve if the subroutine somehow exits without sending a message
  child.on('exit', () => {
    resolve()
  })
})