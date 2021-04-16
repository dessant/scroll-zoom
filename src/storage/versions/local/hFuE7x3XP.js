import browser from 'webextension-polyfill';

const message = 'Add resetZoomGesture and rename options';

const revision = 'hFuE7x3XP';
const downRevision = 'qQ8yj4PWf';

const storage = browser.storage.local;

async function upgrade() {
  const changes = {};

  const {mouseButton, reverseDirection} = await storage.get([
    'mouseButton',
    'reverseDirection'
  ]);

  changes.zoomGesture = mouseButton + '_wheel';
  changes.reverseZoomDirection = reverseDirection;
  changes.resetZoomGesture = 'secondary_auxiliary';

  await storage.remove('mouseButton');

  changes.storageVersion = revision;
  return storage.set(changes);
}

async function downgrade() {
  const changes = {};

  const {zoomGesture, reverseZoomDirection} = await storage.get([
    'zoomGesture',
    'reverseZoomDirection'
  ]);

  changes.mouseButton = zoomGesture.replace('_wheel', '');
  changes.reverseDirection = reverseZoomDirection;

  await storage.remove([
    'zoomGesture',
    'reverseZoomDirection',
    'resetZoomGesture'
  ]);

  changes.storageVersion = downRevision;
  return storage.set(changes);
}

export {message, revision, upgrade, downgrade};
