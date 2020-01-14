import browser from 'webextension-polyfill';

const message = 'Add installTime and reverseDirection';

const revision = 'qQ8yj4PWf';
const downRevision = 'rcIOvzeyW';

const storage = browser.storage.sync;

async function upgrade() {
  const changes = {
    installTime: new Date().getTime(),
    reverseDirection: false
  };

  changes.storageVersion = revision;
  return storage.set(changes);
}

async function downgrade() {
  const changes = {};
  await storage.remove(['installTime', 'reverseDirection']);

  changes.storageVersion = downRevision;
  return storage.set(changes);
}

export {message, revision, upgrade, downgrade};
