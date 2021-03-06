import browser from 'webextension-polyfill';

const message = 'Initial version';

const revision = 'rcIOvzeyW';
const downRevision = null;

const storage = browser.storage.local;

async function upgrade() {
  const changes = {
    mouseButton: 'secondary' // 'primary', 'secondary'
  };

  changes.storageVersion = revision;
  return storage.set(changes);
}

async function downgrade() {
  return storage.clear();
}

export {message, revision, upgrade, downgrade};
