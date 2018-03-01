function stopNextEvent(eventType) {
  window.addEventListener(eventType, stopEvent, {
    capture: true,
    once: true
  });
}

function stopEvent(e) {
  e.preventDefault();
  e.stopImmediatePropagation();
}

function onWheel(e) {
  if (e.deltaY && (e.buttons === 1 || e.buttons === 2)) {
    stopEvent(e);
    const button = e.buttons === 1 ? 'primary' : 'secondary';
    stopNextEvent('click');
    if (button === 'secondary') {
      stopNextEvent('contextmenu');
    }
    chrome.runtime.sendMessage({
      id: 'zoomPage',
      isScrollUp: e.deltaY < 0,
      button
    });
  }
}

window.addEventListener('wheel', onWheel, {
  capture: true
});
