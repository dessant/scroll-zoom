const message = 'Add resetZoomGesture and rename options';

const revision = 'hFuE7x3XP';

async function upgrade() {
  const changes = {};

  const {mouseButton, reverseDirection} = await browser.storage.local.get([
    'mouseButton',
    'reverseDirection'
  ]);

  changes.zoomGesture = mouseButton + '_wheel';
  changes.reverseZoomDirection = reverseDirection;
  changes.resetZoomGesture = 'secondary_auxiliary';

  await browser.storage.local.remove('mouseButton');

  changes.storageVersion = revision;
  return browser.storage.local.set(changes);
}

export {message, revision, upgrade};
