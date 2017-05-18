const fs = require('fs-extra')
const path = require('path')
const paths = require('./paths')

module.exports = {
  /**
   * Checks if there is information about an expiration date
   */
  async isCached () {
    return await fs.pathExists(paths.cacheExpires)
  },

  /**
   * Checks if no cache is present or current cache is outdated
   */
  async needsFetch () {
    return !await this.isCached() || await fs.readFile(paths.cacheExpires) < Date.now()
  },

  /**
   * Fetches and creates a cached version of the cdnjs library list
   */
  async generateCache () {
    const got = require('got')

    const response = await got('https://api.cdnjs.com/libraries', {
      json: true
    })
    
    // Get only .js libraries
    const libraries = response.body.results
      .filter(lib => lib.latest.endsWith('.js'))

    // Write .cached-expires and .cached-sources-list.json files
    await Promise.all([
      fs.writeFile(
        paths.cachedSourcesList,
        JSON.stringify(libraries, null, 2)
      ),
      fs.writeFile(
        paths.cacheExpires,
        (new Date(response.headers.expires)).getTime()
      )
    ])

    return libraries
  },

  /**
   * Reads sources list from cache file
   */
  async getSourcesFromCache () {
    return JSON.parse(await fs.readFile(paths.cachedSourcesList, 'utf8'))
  },

  /**
   * Get sourcess, either from cache or API
   */
  async getSources (forceFetch = false) {
    if (forceFetch || await this.needsFetch()) {
      return this.generateCache()
    } else {
      return this.getSourcesFromCache()
    }
  }
}
