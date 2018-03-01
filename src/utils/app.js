import browser from 'webextension-polyfill';

import {getText} from 'utils/common';

function showNotification({message, messageId, title, type = 'info'}) {
  if (!title) {
    title = getText('extensionName');
  }
  if (messageId) {
    message = getText(messageId);
  }
  return browser.notifications.create(`sbi-notification-${type}`, {
    type: 'basic',
    title: title,
    message: message,
    iconUrl: '/src/icons/app/icon-48.png'
  });
}

function getOptionLabels(data, scope = 'optionValue') {
  const labels = {};
  for (const [group, items] of Object.entries(data)) {
    labels[group] = [];
    items.forEach(function(value) {
      labels[group].push({
        id: value,
        label: getText(`${scope}_${group}_${value}`)
      });
    });
  }
  return labels;
}

module.exports = {
  showNotification,
  getOptionLabels
};
