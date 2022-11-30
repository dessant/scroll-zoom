import {getDayPrecisionEpoch} from 'utils/common';

const message = 'Add theme support';

const revision = '20221027125314_add_theme_support';

async function upgrade() {
  const changes = {
    appTheme: 'auto', // auto, light, dark
    showContribPage: true,
    useCount: 0,
    contribPageLastOpen: 0,
    contribPageLastAutoOpen: 0
  };

  const {installTime} = await browser.storage.local.get('installTime');
  changes.installTime = getDayPrecisionEpoch(installTime);

  await browser.storage.local.remove('reverseDirection');

  changes.storageVersion = revision;
  return browser.storage.local.set(changes);
}

export {message, revision, upgrade};
