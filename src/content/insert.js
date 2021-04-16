let zoomGesture;
let resetZoomGesture;

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
const buttonCodes = {
  primary: 0,
  secondary: 2,
  auxiliary: 1
};

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
const buttonCombinationCodes = {
  primary: 1,
  secondary: 2,
  auxiliary: 4
};

function createMouseGesture(gesture) {
  const gestureSteps = gesture.split('_');

  const data = {
    code: {steps: [], combination: 0},
    text: {steps: gestureSteps, combination: gesture}
  };

  gestureSteps.forEach(item => {
    data.code.steps.push(buttonCodes[item]);
    if (item !== 'wheel') {
      data.code.combination += buttonCombinationCodes[item];
    }
  });

  return data;
}

function stopEvent(ev) {
  ev.preventDefault();
  ev.stopImmediatePropagation();
}

function stopEventType(
  eventType,
  {timeout = 3000, anchorX = null, anchorY = null} = {}
) {
  const callback = function(ev) {
    if (anchorX !== null && anchorY !== null) {
      if (
        Math.abs(ev.clientX * window.devicePixelRatio - anchorX) <= 36 &&
        Math.abs(ev.clientY * window.devicePixelRatio - anchorY) <= 36
      ) {
        stopEvent(ev);
      }
    } else {
      stopEvent(ev);
    }
  };

  window.addEventListener(eventType, callback, {
    capture: true,
    passive: false
  });

  if (timeout) {
    window.setTimeout(function() {
      window.removeEventListener(eventType, callback, {
        capture: true,
        passive: false
      });
    }, timeout);
  }
}

function stopRelatedEvents(gesture, gestureEvent) {
  const anchorX = gestureEvent.clientX * window.devicePixelRatio;
  const anchorY = gestureEvent.clientY * window.devicePixelRatio;

  stopEventType('mouseup', {anchorX, anchorY});
  if (gesture.text.steps.includes('primary')) {
    stopEventType('click', {anchorX, anchorY});
  }
  if (gesture.text.steps.includes('secondary')) {
    stopEventType('contextmenu', {anchorX, anchorY});
  }
  if (gesture.text.steps.includes('auxiliary')) {
    stopEventType('auxclick', {anchorX, anchorY});
  }
}

function onWheel(ev) {
  if (ev.deltaY && ev.buttons === zoomGesture.code.combination) {
    stopEvent(ev);
    stopRelatedEvents(zoomGesture, ev);

    chrome.runtime.sendMessage({id: 'zoomPage', zoomIn: ev.deltaY < 0});
  }
}

function onMousedown(ev) {
  if (
    ev.buttons === resetZoomGesture.code.combination &&
    ev.button === resetZoomGesture.code.steps[1]
  ) {
    stopEvent(ev);
    stopRelatedEvents(resetZoomGesture, ev);

    chrome.runtime.sendMessage({id: 'resetZoomLevel'});
  }
}

function init() {
  chrome.storage.onChanged.addListener(function(changes, area) {
    if (changes.zoomGesture) {
      zoomGesture = createMouseGesture(changes.zoomGesture.newValue);
    } else if (changes.resetZoomGesture) {
      resetZoomGesture = createMouseGesture(changes.resetZoomGesture.newValue);
    }
  });

  chrome.storage.sync.get(['zoomGesture', 'resetZoomGesture'], function(
    result
  ) {
    zoomGesture = createMouseGesture(result.zoomGesture);
    resetZoomGesture = createMouseGesture(result.resetZoomGesture);
  });

  window.addEventListener('wheel', onWheel, {
    capture: true,
    passive: false
  });

  window.addEventListener('mousedown', onMousedown, {
    capture: true,
    passive: false
  });
}

init();
