const { resolve } = require('path')
const root = resolve(__dirname, '..')

// Exposes I/O-relevant paths
module.exports = {
  root,

  // Contains a milliseconds UNIX timestamp of when the cache of
  // the current libraries list expires (usually 4 hours after fetching)
  cacheExpires: resolve(root, '.cache-expires'),

  // Contains the current list of libraries
  cachedSourcesList: resolve(root, '.cached-sources-list.json'),

  // Keeps already handled libraries' names, line-by-line
  handledSourcesList: resolve(root, '.handled-sources'),

  // The folder where information about libraries
  // that didn't pass the squashing is collected
  failedLibs: resolve(root, 'failed'),
}