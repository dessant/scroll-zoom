const message = 'Add installTime and reverseDirection';

const revision = 'qQ8yj4PWf';

async function upgrade() {
  const changes = {
    installTime: new Date().getTime(),
    reverseDirection: false
  };

  changes.storageVersion = revision;
  return browser.storage.local.set(changes);
}

export {message, revision, upgrade};
