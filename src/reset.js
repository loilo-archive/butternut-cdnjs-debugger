const fs = require('fs-extra')
const paths = require('./paths')

module.exports = () => Promise.all([
  fs.remove(paths.failedLibs),
  fs.remove(paths.cacheExpires),
  fs.remove(paths.cachedSourcesList),
  fs.remove(paths.handledSourcesList),
])