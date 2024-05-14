const {join} = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer.
  cacheDirectory: join('/usr/local/lsws/pimsavm/html', '.cache', 'puppeteer'),
};