import storage from 'storage/storage';
import {
  getText,
  getActiveTab,
  getPlatform,
  getDayPrecisionEpoch
} from 'utils/common';
import {targetEnv, enableContributions} from 'utils/config';

function getListItems(data, {scope = ''} = {}) {
  const labels = {};
  for (const [group, items] of Object.entries(data)) {
    labels[group] = [];
    items.forEach(function (value) {
      const item = {
        value,
        title: getText(`${scope ? scope + '_' : ''}${value}`)
      };

      labels[group].push(item);
    });
  }
  return labels;
}

async function insertBaseModule({activeTab = false} = {}) {
  const tabs = [];
  if (activeTab) {
    const tab = await getActiveTab();
    if (tab) {
      tabs.push(tab);
    }
  } else {
    tabs.push(
      ...(await browser.tabs.query({
        url: ['http://*/*', 'https://*/*', 'file:///*'],
        windowType: 'normal'
      }))
    );
  }

  for (const tab of tabs) {
    browser.tabs.executeScript(tab.id, {
      allFrames: true,
      runAt: 'document_start',
      file: '/src/insert/script.js'
    });
  }
}

async function configApp(app) {
  const platform = await getPlatform();

  document.documentElement.classList.add(platform.targetEnv, platform.os);

  if (app) {
    app.config.globalProperties.$env = platform;
  }
}

async function loadFonts(fonts) {
  await Promise.allSettled(fonts.map(font => document.fonts.load(font)));
}

function processMessageResponse(response, sendResponse) {
  if (targetEnv === 'safari') {
    response.then(function (result) {
      // Safari 15: undefined response will cause sendMessage to never resolve.
      if (result === undefined) {
        result = null;
      }
      sendResponse(result);
    });

    return true;
  } else {
    return response;
  }
}

async function showContributePage({
  action = '',
  activeTab = null,
  setOpenerTab = true,
  updateStats = true
} = {}) {
  if (updateStats) {
    await storage.set({contribPageLastOpen: getDayPrecisionEpoch()});
  }

  if (!activeTab) {
    activeTab = await getActiveTab();
  }
  let url = browser.runtime.getURL('/src/contribute/index.html');
  if (action) {
    url = `${url}?action=${action}`;
  }

  const props = {url, index: activeTab.index + 1, active: true};

  if (
    setOpenerTab &&
    activeTab.id !== browser.tabs.TAB_ID_NONE &&
    (await getPlatform()).os !== 'android'
  ) {
    props.openerTabId = activeTab.id;
  }

  return browser.tabs.create(props);
}

async function autoShowContributePage({
  minUseCount = 0, // 0-1000
  minInstallDays = 0,
  minLastOpenDays = 0,
  minLastAutoOpenDays = 0,
  activeTab = null,
  setOpenerTab = true,
  action = 'auto'
} = {}) {
  if (enableContributions) {
    const options = await storage.get([
      'showContribPage',
      'useCount',
      'installTime',
      'contribPageLastOpen',
      'contribPageLastAutoOpen'
    ]);

    const epoch = getDayPrecisionEpoch();

    if (
      options.showContribPage &&
      options.useCount >= minUseCount &&
      epoch - options.installTime >= minInstallDays * 86400000 &&
      epoch - options.contribPageLastOpen >= minLastOpenDays * 86400000 &&
      epoch - options.contribPageLastAutoOpen >= minLastAutoOpenDays * 86400000
    ) {
      await storage.set({
        contribPageLastOpen: epoch,
        contribPageLastAutoOpen: epoch
      });

      return showContributePage({
        action,
        activeTab,
        setOpenerTab,
        updateStats: false
      });
    }
  }
}

let useCountLastUpdate = 0;
async function updateUseCount({
  valueChange = 1,
  maxUseCount = Infinity,
  minInterval = 0
} = {}) {
  if (Date.now() - useCountLastUpdate >= minInterval) {
    useCountLastUpdate = Date.now();

    const {useCount} = await storage.get('useCount');

    if (useCount < maxUseCount) {
      await storage.set({useCount: useCount + valueChange});
    }
  }
}

async function processAppUse({
  activeTab = null,
  setOpenerTab = true,
  action = 'auto'
} = {}) {
  await updateUseCount({
    valueChange: 1,
    maxUseCount: 1000,
    minInterval: 30000
  });

  return autoShowContributePage({
    minUseCount: 30,
    minInstallDays: 14,
    minLastOpenDays: 14,
    minLastAutoOpenDays: 365,
    activeTab,
    setOpenerTab,
    action
  });
}

export {
  getListItems,
  insertBaseModule,
  configApp,
  loadFonts,
  processMessageResponse,
  showContributePage,
  autoShowContributePage,
  updateUseCount,
  processAppUse
};
