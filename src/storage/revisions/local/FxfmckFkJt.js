import {targetEnv} from 'utils/config';
import {chromeZoomFactors, firefoxZoomFactors} from 'utils/data';

const message = 'Add zoomFactors';

const revision = 'FxfmckFkJt';

async function upgrade() {
  const changes = {};

  changes.zoomFactors =
    targetEnv === 'firefox' ? firefoxZoomFactors : chromeZoomFactors;

  changes.storageVersion = revision;
  return browser.storage.local.set(changes);
}

export {message, revision, upgrade};
