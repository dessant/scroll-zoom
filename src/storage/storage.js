import browser from 'webextension-polyfill';

import migrate from 'storage-versions';

async function init(area = 'local') {
  const context = require.context('storage/versions', true, /\.(?:js|json)$/i);
  return migrate.reconcile({context, area});
}

async function get(keys = null, area = 'local') {
  return browser.storage[area].get(keys);
}

async function set(obj, area = 'local') {
  return browser.storage[area].set(obj);
}

async function remove(keys, area = 'local') {
  return browser.storage[area].remove(keys);
}

async function clear(area = 'local') {
  return browser.storage[area].clear();
}

module.exports = {
  init,
  get,
  set,
  remove,
  clear
};
