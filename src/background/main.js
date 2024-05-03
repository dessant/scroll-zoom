import closest from 'closest-to';
import Queue from 'p-queue';

import {initStorage, migrateLegacyStorage} from 'storage/init';
import {isStorageReady} from 'storage/storage';
import storage from 'storage/storage';
import {
  insertBaseModule,
  processMessageResponse,
  processAppUse,
  showOptionsPage
} from 'utils/app';
import {getPlatform} from 'utils/common';
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

async function onOptionChange() {
  await syncState();
}

async function onActionButtonClick(tab) {
  await showOptionsPage();
}

async function processMessage(request, sender) {
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

async function onInstall(details) {
  if (
    ['install', 'update'].includes(details.reason) &&
    ['chrome', 'edge', 'opera', 'samsung'].includes(targetEnv)
  ) {
    await insertBaseModule();
  }
}

async function onStartup() {
  if (['samsung'].includes(targetEnv)) {
    // Samsung Internet: Content script is not always run in restored
    // active tab on startup.
    await insertBaseModule({activeTab: true});
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
  // Not fired in private browsing mode.
  browser.runtime.onStartup.addListener(onStartup);
}

async function setup() {
  if (!(await isStorageReady())) {
    await migrateLegacyStorage();
    await initStorage();
  }

  await syncState();
}

function init() {
  addActionListener();
  addMessageListener();
  addInstallListener();
  addStartupListener();

  setup();
}

init();
