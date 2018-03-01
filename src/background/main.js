import browser from 'webextension-polyfill';

import storage from 'storage/storage';
import {targetEnv} from 'utils/config';
import {zoomFactors} from 'utils/data';

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

async function onMessage(request, sender, sendResponse) {
  if (request.id === 'zoomPage') {
    const {mouseButton} = await storage.get('mouseButton', 'sync');
    if (request.button !== mouseButton) {
      return;
    }
    let zoomFactor = await browser.tabs.getZoom();
    const isUp = request.isScrollUp;
    if ((zoomFactor === 0.3 && !isUp) || (zoomFactor === 3 && isUp)) {
      return;
    }
    zoomFactor = zoomFactors[zoomFactors.indexOf(zoomFactor) + (isUp ? 1 : -1)];
    await browser.tabs.setZoom(zoomFactor);
  }
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
