let mouseButton;

function allowNextEvent(eventType) {
  window.removeEventListener(eventType, stopEvent, {
    capture: true,
    once: true,
    passive: false
  });
}

function stopNextEvent(eventType) {
  window.addEventListener(eventType, stopEvent, {
    capture: true,
    once: true,
    passive: false
  });
}

function stopEvent(e) {
  e.preventDefault();
  e.stopImmediatePropagation();

  if (e.type === 'contextmenu') {
    // Firefox simultaneously fires a click event, but not always.
    allowNextEvent('click');
  }
}

function onWheel(e) {
  if (e.deltaY && (e.buttons === 1 || e.buttons === 2)) {
    const button = e.buttons === 1 ? 'primary' : 'secondary';

    if (button === mouseButton) {
      stopEvent(e);
      stopNextEvent('click');
      if (button === 'secondary') {
        stopNextEvent('contextmenu');
      }

      chrome.runtime.sendMessage({id: 'zoomPage', zoomIn: e.deltaY < 0});
    }
  }
}

function init() {
  chrome.storage.onChanged.addListener(function(changes, area) {
    if (changes.mouseButton) {
      mouseButton = changes.mouseButton.newValue;
    }
  });

  chrome.storage.sync.get(['mouseButton'], function(result) {
    mouseButton = result.mouseButton;
  });

  window.addEventListener('wheel', onWheel, {
    capture: true,
    passive: false
  });
}

init();
