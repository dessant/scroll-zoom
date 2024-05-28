import closest from 'closest-to';
import Queue from 'p-queue';

import {initStorage} from 'storage/init';
import {isStorageReady} from 'storage/storage';
import storage from 'storage/storage';
import {
  insertBaseModule,
  processMessageResponse,
  processAppUse,
  showOptionsPage,
  setAppVersion,
  getStartupState
} from 'utils/app';
import {isValidTab, getPlatform, runOnce} from 'utils/common';
import {targetEnv, mv3} from 'utils/config';

const queue = new Queue({concurrency: 1});

let reverseZoomDirection = null;
let zoomFactors = null;

async function syncState({syncBrowserSettings = true} = {}) {
  ({reverseZoomDirection, zoomFactors} = await storage.get([
    'reverseZoomDirection',
    'zoomFactors'
  ]));

  if (targetEnv === 'firefox' && syncBrowserSettings) {
    const {zoomGesture, resetZoomGesture} = await storage.get([
      'zoomGesture',
      'resetZoomGesture'
    ]);
    if (
      zoomGesture.includes('secondary') ||
      resetZoomGesture.includes('secondary')
    ) {
      browser.browserSettings.contextMenuShowEvent.set({value: 'mouseup'});
    } else {
      browser.browserSettings.contextMenuShowEvent.clear({});
    }
  }
}

async function zoomPage(tabId, zoomIn) {
  if (reverseZoomDirection === null) {
    await syncState({syncBrowserSettings: false});
  }

  if (reverseZoomDirection) {
    zoomIn = !zoomIn;
  }
  let zoomFactor = closest(await browser.tabs.getZoom(tabId), zoomFactors);
  const newZoomFactor =
    zoomFactors[zoomFactors.indexOf(zoomFactor) + (zoomIn ? 1 : -1)];

  if (newZoomFactor) {
    zoomFactor = newZoomFactor;
  }

  await browser.tabs.setZoom(tabId, zoomFactor);

  await processAppUse();
}

async function resetZoomLevel(tabId) {
  await browser.tabs.setZoom(tabId, 0);

  await processAppUse();
}

async function processMessage(request, sender) {
  // Samsung Internet 13: extension messages are sometimes also dispatched
  // to the sender frame.
  if (sender.url === self.location.href) {
    return;
  }

  if (targetEnv === 'samsung') {
    if (await isValidTab({tab: sender.tab})) {
      // Samsung Internet 13: runtime.onMessage provides wrong tab index.
      sender.tab = await browser.tabs.get(sender.tab.id);
    }
  }

  if (request.id === 'zoomPage') {
    queue.add(() => zoomPage(sender.tab.id, request.zoomIn));
  } else if (request.id === 'resetZoomLevel') {
    queue.add(() => resetZoomLevel(sender.tab.id));
  } else if (request.id === 'getPlatform') {
    return getPlatform();
  } else if (request.id === 'optionChange') {
    await onOptionChange();
  }
}

function onMessage(request, sender, sendResponse) {
  const response = processMessage(request, sender);

  return processMessageResponse(response, sendResponse);
}

async function onOptionChange() {
  await syncState();
}

async function onActionButtonClick(tab) {
  await showOptionsPage();
}

async function onInstall(details) {
  if (['install', 'update'].includes(details.reason)) {
    await setup({event: 'install'});
  }
}

async function onStartup() {
  await setup({event: 'startup'});
}

function addActionListener() {
  if (mv3) {
    browser.action.onClicked.addListener(onActionButtonClick);
  } else {
    browser.browserAction.onClicked.addListener(onActionButtonClick);
  }
}

function addMessageListener() {
  browser.runtime.onMessage.addListener(onMessage);
}

function addInstallListener() {
  browser.runtime.onInstalled.addListener(onInstall);
}

function addStartupListener() {
  browser.runtime.onStartup.addListener(onStartup);
}

async function setup({event = ''} = {}) {
  const startup = await getStartupState({event});

  if (startup.setupInstance) {
    await runOnce('setupInstance', async () => {
      if (!(await isStorageReady())) {
        await initStorage();
      }

      if (['chrome', 'edge', 'opera', 'samsung'].includes(targetEnv)) {
        await insertBaseModule();
      }

      if (startup.update) {
        await setAppVersion();
      }
    });
  }

  if (startup.setupSession) {
    await runOnce('setupSession', async () => {
      if (mv3 && !(await isStorageReady({area: 'session'}))) {
        await initStorage({area: 'session', silent: true});
      }

      await syncState();
    });
  }
}

function init() {
  addActionListener();
  addMessageListener();
  addInstallListener();
  addStartupListener();

  setup();
}

init();
