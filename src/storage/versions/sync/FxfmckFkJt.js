import browser from 'webextension-polyfill';

import {targetEnv} from 'utils/config';
import {chromeZoomFactors, firefoxZoomFactors} from 'utils/data';

const message = 'Add zoomFactors';

const revision = 'FxfmckFkJt';
const downRevision = 'hFuE7x3XP';

const storage = browser.storage.sync;

async function upgrade() {
  const changes = {};

  changes.zoomFactors =
    targetEnv === 'firefox' ? firefoxZoomFactors : chromeZoomFactors;

  changes.storageVersion = revision;
  return storage.set(changes);
}

async function downgrade() {
  const changes = {};

  await storage.remove('zoomFactors');

  changes.storageVersion = downRevision;
  return storage.set(changes);
}

export {message, revision, upgrade, downgrade};
