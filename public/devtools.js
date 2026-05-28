/* global chrome */
// devtools.js — runs in the DevTools page context.

let port = null;
let requestIndex = 0;
const pendingQueue = [];
let contextInvalidated = false;

function isContextInvalidated(errMsg) {
  return errMsg && errMsg.includes('Extension context invalidated');
}

function connectToBackground() {
  if (contextInvalidated) return;

  try {
    port = chrome.runtime.connect({ name: 'devtools-panel' });
  } catch (e) {
    if (isContextInvalidated(e.message)) {
      contextInvalidated = true;
      console.warn('[NetworkInspector] Extension was reloaded — please close and reopen DevTools.');
      return;
    }
    // Transient error — retry once
    port = null;
    setTimeout(connectToBackground, 1000);
    return;
  }

  // Flush any requests buffered while disconnected
  while (pendingQueue.length > 0) {
    try {
      port.postMessage(pendingQueue.shift());
    } catch {
      break;
    }
  }

  port.onDisconnect.addListener(() => {
    port = null;
    const err = chrome.runtime.lastError;
    const msg = err?.message || '';

    if (isContextInvalidated(msg)) {
      contextInvalidated = true;
      console.warn('[NetworkInspector] Extension was reloaded — please close and reopen DevTools.');
      return;
    }

    // SW restarted — reconnect after a short delay
    setTimeout(connectToBackground, 500);
  });
}

connectToBackground();

chrome.devtools.panels.create(
  'Network Inspector',
  '',
  'panel/index.html',
  () => {}
);

chrome.devtools.network.onRequestFinished.addListener(function (request) {
  if (contextInvalidated) return;

  const payload = {
    id: Date.now() + '-' + requestIndex++,
    url: request.request.url,
    method: request.request.method,
    status: request.response.status,
    statusText: request.response.statusText,
    time: Math.round(request.time * 100) / 100,
    startedAt: Date.now(),
    mimeType:
      (request.response.content && request.response.content.mimeType) || '',
  };

  const message = { type: 'NETWORK_REQUEST', payload };

  if (port) {
    try {
      port.postMessage(message);
    } catch (e) {
      if (isContextInvalidated(e.message)) {
        contextInvalidated = true;
        return;
      }
      port = null;
      pendingQueue.push(message);
      if (pendingQueue.length > 200) pendingQueue.shift();
      connectToBackground();
    }
  } else {
    pendingQueue.push(message);
    if (pendingQueue.length > 200) pendingQueue.shift();
  }
});
