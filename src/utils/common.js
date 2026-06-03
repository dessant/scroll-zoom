import storage from 'storage/storage';
import {targetEnv, mv3} from 'utils/config';

function getText(messageName, substitutions) {
  return browser.i18n.getMessage(messageName, substitutions);
}

async function executeScript({
  files = null,
  func = null,
  args = null,
  tabId = null,
  frameIds = [0],
  allFrames = false,
  world = 'ISOLATED',
  injectImmediately = true,
  unwrapResults = true,

  code = ''
}) {
  if (mv3 || (targetEnv === 'firefox' && (await getBrowserVersion()) >= 128)) {
    const params = {target: {tabId}, world};

    // Safari 17: allFrames and frameIds cannot both be specified,
    // fixed in Safari 18.
    if (allFrames) {
      params.target.allFrames = true;
    } else {
      params.target.frameIds = frameIds;
    }

    if (files) {
      params.files = files;
    } else {
      params.func = func;

      if (args) {
        params.args = args;
      }
    }

    if (targetEnv !== 'safari') {
      params.injectImmediately = injectImmediately;
    }

    const results = await browser.scripting.executeScript(params);

    if (unwrapResults) {
      return results.map(item => item.result);
    } else {
      return results;
    }
  } else {
    const params = {frameId: frameIds[0]};

    if (files) {
      params.file = files[0];
    } else {
      params.code = code;
    }

    if (injectImmediately) {
      params.runAt = 'document_start';
    }

    return browser.tabs.executeScript(tabId, params);
  }
}

async function createTab({
  url = '',
  index = null,
  active = true,
  openerTabId = null,
  getTab = false
} = {}) {
  const props = {url, active};

  if (index !== null) {
    props.index = index;
  }
  if (openerTabId !== null) {
    props.openerTabId = openerTabId;
  }

  let tab = await browser.tabs.create(props);

  if (getTab) {
    if (targetEnv === 'samsung') {
      // Samsung Internet 13: tabs.create returns previously active tab.
      // Samsung Internet 13: tabs.query may not immediately return newly created tabs.
      let count = 1;
      while (count <= 500 && (!tab || tab.url !== url)) {
        [tab] = await browser.tabs.query({lastFocusedWindow: true, url});

        await sleep(20);
        count += 1;
      }
    }

    return tab;
  }
}

async function getActiveTab() {
  const [tab] = await browser.tabs.query({
    lastFocusedWindow: true,
    active: true
  });
  return tab;
}

async function isValidTab({tab, tabId = null} = {}) {
  if (!tab && tabId !== null) {
    tab = await browser.tabs.get(tabId).catch(err => null);
  }

  if (tab && tab.id !== browser.tabs.TAB_ID_NONE) {
    return true;
  }
}

let platformInfo;
async function getPlatformInfo() {
  if (platformInfo) {
    return platformInfo;
  }

  if (mv3) {
    ({platformInfo} = await storage.get('platformInfo', {area: 'session'}));
  } else {
    try {
      platformInfo = JSON.parse(window.sessionStorage.getItem('platformInfo'));
    } catch (err) {}
  }

  if (!platformInfo) {
    let os, arch;

    if (targetEnv === 'samsung') {
      // Samsung Internet 13: runtime.getPlatformInfo fails.
      os = 'android';
      arch = '';
    } else if (targetEnv === 'safari') {
      // Safari: runtime.getPlatformInfo returns 'ios' on iPadOS.
      ({os, arch} = await browser.runtime.sendNativeMessage('application.id', {
        id: 'getPlatformInfo'
      }));
    } else {
      ({os, arch} = await browser.runtime.getPlatformInfo());
    }

    platformInfo = {os, arch};

    if (mv3) {
      await storage.set({platformInfo}, {area: 'session'});
    } else {
      try {
        window.sessionStorage.setItem(
          'platformInfo',
          JSON.stringify(platformInfo)
        );
      } catch (err) {}
    }
  }

  return platformInfo;
}

async function getPlatform() {
  if (!isBackgroundPageContext()) {
    return browser.runtime.sendMessage({id: 'getPlatform'});
  }

  let {os, arch} = await getPlatformInfo();

  if (os === 'win') {
    os = 'windows';
  } else if (os === 'mac') {
    os = 'macos';
  } else if (os === 'cros') {
    os = 'chromeos';
  } else if (os.includes('bsd')) {
    os = 'linux';
  }

  if (['x86-32', 'i386'].includes(arch)) {
    arch = '386';
  } else if (['x86-64', 'x86_64'].includes(arch)) {
    arch = 'amd64';
  } else if (arch.startsWith('arm')) {
    arch = 'arm';
  }

  const isWindows = os === 'windows';
  const isMacos = os === 'macos';
  const isLinux = os === 'linux';
  const isChromeos = os === 'chromeos';
  const isAndroid = os === 'android';
  const isIos = os === 'ios';
  const isIpados = os === 'ipados';
  const isVisionos = os === 'visionos';

  const isMobile = ['android', 'ios', 'ipados'].includes(os);

  const isFirefox = targetEnv === 'firefox';
  const isEdge =
    ['chrome', 'edge'].includes(targetEnv) &&
    /\sedg(?:e|a|ios)?\//i.test(navigator.userAgent);
  const isOpera =
    ['chrome', 'opera'].includes(targetEnv) &&
    /\sopr\//i.test(navigator.userAgent);
  const isChrome = targetEnv === 'chrome' && !isEdge && !isOpera;
  const isSafari = targetEnv === 'safari';
  const isSamsung = targetEnv === 'samsung';

  return {
    os,
    arch,
    targetEnv,
    isWindows,
    isMacos,
    isLinux,
    isChromeos,
    isAndroid,
    isIos,
    isIpados,
    isVisionos,
    isMobile,
    isChrome,
    isEdge,
    isFirefox,
    isOpera,
    isSafari,
    isSamsung
  };
}

async function getBrowser() {
  if (!isBackgroundPageContext()) {
    return browser.runtime.sendMessage({id: 'getBrowser'});
  }

  const {name, version} = await browser.runtime.getBrowserInfo();

  return {name: name.toLowerCase(), version: version.toLowerCase()};
}

async function getBrowserVersion() {
  const {version} = await getBrowser();

  return parseInt(version.split('.')[0], 10);
}

function getDarkColorSchemeQuery() {
  return window.matchMedia('(prefers-color-scheme: dark)');
}

function getDayPrecisionEpoch(epoch) {
  if (!epoch) {
    epoch = Date.now();
  }

  return epoch - (epoch % 86400000);
}

function isBackgroundPageContext() {
  return self.location.href.startsWith(
    browser.runtime.getURL('/src/background/')
  );
}

function getStore(name, {content = null} = {}) {
  name = `${name}Store`;

  if (!self[name]) {
    self[name] = content || {};
  }

  return self[name];
}

function runOnce(name, func) {
  const store = getStore('run');

  if (!store[name]) {
    store[name] = true;

    if (!func) {
      return true;
    }

    return func();
  }
}

function sleep(ms) {
  return new Promise(resolve => self.setTimeout(resolve, ms));
}

export {
  getText,
  executeScript,
  createTab,
  getActiveTab,
  isValidTab,
  getPlatformInfo,
  getPlatform,
  getBrowser,
  getBrowserVersion,
  getDarkColorSchemeQuery,
  getDayPrecisionEpoch,
  isBackgroundPageContext,
  getStore,
  runOnce,
  sleep
};
