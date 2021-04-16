import browser from 'webextension-polyfill';
import closest from 'closest-to';
import Queue from 'p-queue';

import {initStorage} from 'storage/init';
import storage from 'storage/storage';
import {targetEnv} from 'utils/config';
import {chromeZoomFactors, firefoxZoomFactors} from 'utils/data';

const queue = new Queue({concurrency: 1});

const zoomFactors =
  targetEnv === 'firefox' ? firefoxZoomFactors : chromeZoomFactors;

let reverseZoomDirection;

async function syncState() {
  ({reverseZoomDirection} = await storage.get('reverseZoomDirection', 'sync'));

  if (targetEnv === 'firefox') {
    const {zoomGesture, resetZoomGesture} = await storage.get(
      ['zoomGesture', 'resetZoomGesture'],
      'sync'
    );
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

async function onStorageChange(changes, area) {
  await syncState();
}

function onMessage(request, sender, sendResponse) {
  if (request.id === 'zoomPage') {
    queue.add(() => zoomPage(sender.tab.id, request.zoomIn));
  } else if (request.id === 'resetZoomLevel') {
    queue.add(() => resetZoomLevel(sender.tab.id));
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
}

async function resetZoomLevel(tabId) {
  await browser.tabs.setZoom(tabId, 0);
}

function addStorageListener() {
  browser.storage.onChanged.addListener(onStorageChange);
}

function addMessageListener() {
  browser.runtime.onMessage.addListener(onMessage);
}

async function onLoad() {
  await initStorage('sync');
  await syncState();
  addStorageListener();
  addMessageListener();
}

document.addEventListener('DOMContentLoaded', onLoad);
