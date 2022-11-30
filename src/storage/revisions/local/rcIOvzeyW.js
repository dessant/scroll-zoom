const message = 'Initial version';

const revision = 'rcIOvzeyW';

async function upgrade() {
  const changes = {
    mouseButton: 'secondary' // 'primary', 'secondary'
  };

  changes.storageVersion = revision;
  return browser.storage.local.set(changes);
}

export {message, revision, upgrade};
