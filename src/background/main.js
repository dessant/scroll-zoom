import closest from 'closest-to';
import Queue from 'p-queue';

import {initStorage, migrateLegacyStorage} from 'storage/init';
import {isStorageReady} from 'storage/storage';
import storage from 'storage/storage';
import {
  insertBaseModule,
  processMessageResponse,
  processAppUse
} from 'utils/app';
import {getPlatform} from 'utils/common';
import {targetEnv} from 'utils/config';

const queue = new Queue({concurrency: 1});

let reverseZoomDirection;
let zoomFactors;

async function syncState() {
  ({reverseZoomDirection, zoomFactors} = await storage.get([
    'reverseZoomDirection',
    'zoomFactors'
  ]));

  if (targetEnv === 'firefox') {
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
  await browser.runtime.openOptionsPage();
}

async function processMessage(request, sender) {
  if (request.id === 'zoomPage') {
    queue.add(() => zoomPage(sender.tab.id, request.zoomIn));
  } else if (request.id === 'resetZoomLevel') {
    queue.add(() => resetZoomLevel(sender.tab.id));
  } else if (request.id === 'getPlatform') {
    return getPlatform({fallback: false});
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
    ['chrome', 'edge'].includes(targetEnv)
  ) {
    await insertBaseModule();
  }
}

async function zoomPage(tabId, zoomIn) {
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

function addBrowserActionListener() {
  browser.browserAction.onClicked.addListener(onActionButtonClick);
}

function addMessageListener() {
  browser.runtime.onMessage.addListener(onMessage);
}

function addInstallListener() {
  browser.runtime.onInstalled.addListener(onInstall);
}

async function setup() {
  if (!(await isStorageReady())) {
    await migrateLegacyStorage();
    await initStorage();
  }

  await syncState();
}

function init() {
  addBrowserActionListener();
  addMessageListener();
  addInstallListener();

  setup();
}

init();
