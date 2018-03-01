import browser from 'webextension-polyfill';

const getText = browser.i18n.getMessage;

function executeCode(string, tabId, frameId = 0, runAt = 'document_start') {
  return browser.tabs.executeScript(tabId, {
    frameId: frameId,
    runAt: runAt,
    code: string
  });
}

function executeFile(file, tabId, frameId = 0, runAt = 'document_start') {
  return browser.tabs.executeScript(tabId, {
    frameId: frameId,
    runAt: runAt,
    file: file
  });
}

async function scriptsAllowed(tabId, frameId = 0) {
  try {
    await browser.tabs.executeScript(tabId, {
      frameId: frameId,
      runAt: 'document_start',
      code: 'true;'
    });
    return true;
  } catch (e) {}
}

module.exports = {
  getText,
  executeCode,
  executeFile,
  scriptsAllowed
};
