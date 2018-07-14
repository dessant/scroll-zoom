import browser from 'webextension-polyfill';
import closest from 'closest-to';
import Queue from 'p-queue';

import storage from 'storage/storage';
import {targetEnv} from 'utils/config';
import {chromeZoomFactors, firefoxZoomFactors} from 'utils/data';

const queue = new Queue({concurrency: 1});

const zoomFactors =
  targetEnv === 'firefox' ? firefoxZoomFactors : chromeZoomFactors;

async function setContextMenuEvent() {
  if (targetEnv === 'firefox') {
    const {mouseButton} = await storage.get('mouseButton', 'sync');
    if (mouseButton === 'secondary') {
      browser.browserSettings.contextMenuShowEvent.set({value: 'mouseup'});
    } else {
      browser.browserSettings.contextMenuShowEvent.clear();
    }
  }
}

async function onStorageChange(changes, area) {
  await setContextMenuEvent();
}

function onMessage(request, sender, sendResponse) {
  if (request.id === 'zoomPage') {
    queue.add(() => zoomPage(sender.tab.id, request.zoomIn));
  }
}

async function zoomPage(tabId, zoomIn) {
  let zoomFactor = closest(await browser.tabs.getZoom(), zoomFactors);
  const newZoomFactor =
    zoomFactors[zoomFactors.indexOf(zoomFactor) + (zoomIn ? 1 : -1)];

  if (newZoomFactor) {
    zoomFactor = newZoomFactor;
  }

  await browser.tabs.setZoom(tabId, zoomFactor);
}

function addStorageListener() {
  browser.storage.onChanged.addListener(onStorageChange);
}

function addMessageListener() {
  browser.runtime.onMessage.addListener(onMessage);
}

async function onLoad() {
  await storage.init('sync');
  await setContextMenuEvent();
  addStorageListener();
  addMessageListener();
}

document.addEventListener('DOMContentLoaded', onLoad);
