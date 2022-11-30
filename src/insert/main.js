import storage from 'storage/storage';

function main() {
  // Script may be injected multiple times.
  if (self.baseModule) {
    return;
  } else {
    self.baseModule = true;
  }

  let zoomGesture;
  let resetZoomGesture;
  let ignoreZoomGestureSelection;

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
    const callback = function (ev) {
      if (
        anchorX === null ||
        anchorY === null ||
        (Math.abs(ev.clientX * window.devicePixelRatio - anchorX) <= 36 &&
          Math.abs(ev.clientY * window.devicePixelRatio - anchorY) <= 36)
      ) {
        stopEvent(ev);
      }
    };

    window.addEventListener(eventType, callback, {
      capture: true,
      passive: false
    });

    if (timeout) {
      window.setTimeout(function () {
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

    stopEventType('mousemove', {anchorX, anchorY});
    stopEventType('mouseup', {anchorX, anchorY});

    if (gesture.text.steps.includes('primary')) {
      stopEventType('selectstart', {timeout: 1000});
      stopEventType('dragstart', {anchorX, anchorY, timeout: 1000});

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
    if (
      ev.deltaY &&
      ev.buttons === zoomGesture.code.combination &&
      !ignoreZoomGesture()
    ) {
      stopEvent(ev);
      stopRelatedEvents(zoomGesture, ev);

      browser.runtime.sendMessage({id: 'zoomPage', zoomIn: ev.deltaY < 0});
    }
  }

  function onMousedown(ev) {
    if (
      ev.buttons === resetZoomGesture.code.combination &&
      ev.button === resetZoomGesture.code.steps[1]
    ) {
      stopEvent(ev);
      stopRelatedEvents(resetZoomGesture, ev);

      browser.runtime.sendMessage({id: 'resetZoomLevel'});
    }
  }

  function isSelection() {
    try {
      return (
        !window.getSelection().isCollapsed ||
        document.activeElement?.selectionStart !==
          document.activeElement?.selectionEnd
      );
    } catch (ex) {}

    return false;
  }

  function ignoreZoomGesture() {
    if (
      zoomGesture.text.steps.includes('primary') &&
      ignoreZoomGestureSelection &&
      isSelection()
    ) {
      return true;
    }

    return false;
  }

  async function syncState() {
    const options = await storage.get([
      'zoomGesture',
      'resetZoomGesture',
      'ignoreZoomGestureSelection'
    ]);

    zoomGesture = createMouseGesture(options.zoomGesture);
    resetZoomGesture = createMouseGesture(options.resetZoomGesture);
    ignoreZoomGestureSelection = options.ignoreZoomGestureSelection;
  }

  function processEvent(ev) {
    if (chrome.runtime?.id) {
      if (ev.type === 'mousedown') {
        onMousedown(ev);
      } else if (ev.type === 'wheel') {
        onWheel(ev);
      }
    } else {
      // Chrome: Extension context invalidated
      removeEventListeners();
    }
  }

  function addEventListeners() {
    window.addEventListener('wheel', processEvent, {
      capture: true,
      passive: false
    });

    window.addEventListener('mousedown', processEvent, {
      capture: true,
      passive: false
    });
  }

  function removeEventListeners() {
    window.removeEventListener('wheel', processEvent, {
      capture: true,
      passive: false
    });

    window.removeEventListener('mousedown', processEvent, {
      capture: true,
      passive: false
    });
  }

  async function setup() {
    await syncState();

    browser.storage.onChanged.addListener(function (changes, area) {
      if (
        area === 'local' &&
        (changes.zoomGesture ||
          changes.resetZoomGesture ||
          changes.ignoreZoomGestureSelection)
      ) {
        syncState();
      }
    });
  }

  function init() {
    addEventListeners();
    setup();
  }

  init();
}

main();
