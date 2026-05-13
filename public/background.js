// background.js — Manifest V3 service worker.
// Relays messages from devtools.js → panel page via long-lived ports.
// The devtools-panel port keeps this SW alive while DevTools is open.

const panelPorts = new Set();
const requestBuffer = [];
const MAX_BUFFER = 500;

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === 'devtools-panel') {
    // Source: devtools.js (long-lived port — keeps SW alive)
    console.log('[NetworkInspector SW] devtools connected');

    port.onMessage.addListener(forwardToPanel);
    port.onDisconnect.addListener(() => {
      console.log('[NetworkInspector SW] devtools disconnected');
      port.onMessage.removeListener(forwardToPanel);
    });

  } else if (port.name === 'panel') {
    // Destination: React panel page
    console.log('[NetworkInspector SW] panel connected, flushing', requestBuffer.length, 'buffered requests');
    panelPorts.add(port);

    // Flush buffered requests so the panel gets history immediately
    for (const msg of requestBuffer) {
      try { port.postMessage(msg); } catch (_e) { break; }
    }

    port.onMessage.addListener((msg) => handlePanelMessage(msg));
    port.onDisconnect.addListener(() => {
      console.log('[NetworkInspector SW] panel disconnected');
      panelPorts.delete(port);
    });
  }
});

function forwardToPanel(message) {
  if (message.type === 'NETWORK_REQUEST') {
    requestBuffer.push(message);
    if (requestBuffer.length > MAX_BUFFER) requestBuffer.shift();
  }

  panelPorts.forEach((p) => {
    try {
      p.postMessage(message);
    } catch (_e) {
      panelPorts.delete(p);
    }
  });
}

function handlePanelMessage(message) {
  if (message.type === 'CLEAR_REQUESTS') {
    requestBuffer.length = 0;
    panelPorts.forEach((p) => {
      try { p.postMessage({ type: 'CLEAR_REQUESTS' }); } catch (_e) { panelPorts.delete(p); }
    });
  }
  if (message.type === 'CONFIG_UPDATE') {
    chrome.storage.local.set({ config: message.payload });
  }
}
