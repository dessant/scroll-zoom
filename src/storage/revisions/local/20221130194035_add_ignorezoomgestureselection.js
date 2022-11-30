const message = 'Add ignoreZoomGestureSelection';

const revision = '20221130194035_add_ignorezoomgestureselection';

async function upgrade() {
  const changes = {ignoreZoomGestureSelection: true};

  changes.storageVersion = revision;
  return browser.storage.local.set(changes);
}

export {message, revision, upgrade};
