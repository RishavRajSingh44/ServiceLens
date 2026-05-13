import { useEffect, useRef, useCallback } from 'react';

export function useRequests(onRequest, onClear) {
  const portRef = useRef(null);
  const onRequestRef = useRef(onRequest);
  const onClearRef = useRef(onClear);
  onRequestRef.current = onRequest;
  onClearRef.current = onClear;

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      console.warn('[NetworkInspector] chrome.runtime not available — not running as extension');
      return;
    }

    console.log('[NetworkInspector] Panel connecting to background...');

    function connect() {
      let port;
      try {
        port = chrome.runtime.connect({ name: 'panel' });
        console.log('[NetworkInspector] Port connected');
      } catch (e) {
        console.warn('[NetworkInspector] connect() failed:', e.message);
        return;
      }
      portRef.current = port;

      port.onMessage.addListener((msg) => {
        console.log('[NetworkInspector] Panel received message:', msg.type, msg.payload?.url);
        if (msg.type === 'NETWORK_REQUEST') {
          onRequestRef.current(msg.payload);
        } else if (msg.type === 'CLEAR_REQUESTS') {
          onClearRef.current();
        }
      });

      port.onDisconnect.addListener(() => {
        portRef.current = null;
        const err = chrome.runtime.lastError;
        console.warn('[NetworkInspector] Port disconnected:', err?.message);
        setTimeout(connect, 500);
      });
    }

    connect();

    return () => {
      if (portRef.current) {
        try { portRef.current.disconnect(); } catch (_e) { /* ignore */ }
        portRef.current = null;
      }
    };
  }, []);

  const clearRequests = useCallback(() => {
    if (portRef.current) {
      try {
        portRef.current.postMessage({ type: 'CLEAR_REQUESTS' });
      } catch (_e) { /* ignore */ }
    }
  }, []);

  return { clearRequests };
}
