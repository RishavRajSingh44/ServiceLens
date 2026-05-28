/* global chrome */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { classifyRequest, colorForService } from './lib/classifier.js';
import { useRequests } from './hooks/useRequests.js';
import FilterBar from './components/FilterBar.jsx';
import ServiceGroup from './components/ServiceGroup.jsx';
import ConfigEditor from './components/ConfigEditor.jsx';

const DEFAULT_CONFIG = {
  serviceMap: [],
  slowThreshold: 1000,
};

function applyFilters(requests, filters) {
  return requests.filter((r) => {
    if (filters.service !== 'all' && r.service !== filters.service) return false;

    if (filters.statusClass !== 'all') {
      const s = r.status;
      if (filters.statusClass === '2xx' && (s < 200 || s > 299)) return false;
      if (filters.statusClass === '3xx' && (s < 300 || s > 399)) return false;
      if (filters.statusClass === '4xx' && (s < 400 || s > 499)) return false;
      if (filters.statusClass === '5xx' && (s < 500 || s > 599)) return false;
    }

    if (filters.failedOnly && r.status < 400) return false;

    if (filters.searchText) {
      const q = filters.searchText.toLowerCase();
      if (!r.url.toLowerCase().includes(q)) return false;
    }

    return true;
  });
}

function groupByService(requests) {
  const map = new Map();
  for (const r of requests) {
    if (r.service === 'internal') continue;
    if (!map.has(r.service)) map.set(r.service, []);
    map.get(r.service).push(r);
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

export default function App() {
  const [rawRequests, setRawRequests] = useState([]);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [filters, setFilters] = useState({
    service: 'all',
    statusClass: 'all',
    searchText: '',
    failedOnly: false,
  });
  const [showConfig, setShowConfig] = useState(false);

  // Load persisted config on mount
  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.storage) return;
    chrome.storage.local.get('config').then((result) => {
      if (result.config) setConfig(result.config);
    });
    // Sync config changes from other panels
    const listener = (changes, area) => {
      if (area === 'local' && changes.config) {
        setConfig(changes.config.newValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const handleRequest = useCallback((payload) => {
    setRawRequests((prev) => {
      // Deduplicate by id
      if (prev.some((r) => r.id === payload.id)) return prev;
      return [...prev, payload];
    });
  }, []);

  const handleClearFromBG = useCallback(() => {
    setRawRequests([]);
  }, []);

  const { clearRequests } = useRequests(handleRequest, handleClearFromBG);

  // Classify requests
  const classified = useMemo(
    () =>
      rawRequests.map((r) => ({
        ...r,
        service: classifyRequest(r.url, config.serviceMap),
      })),
    [rawRequests, config.serviceMap]
  );

  // Apply filters
  const filtered = useMemo(
    () => applyFilters(classified, filters),
    [classified, filters]
  );

  // Group by service
  const grouped = useMemo(() => groupByService(filtered), [filtered]);

  // Unique services for filter dropdown
  const allServices = useMemo(
    () => [...new Set(classified.map((r) => r.service))].filter((s) => s !== 'internal').sort(),
    [classified]
  );

  function handleClear() {
    clearRequests();
    setRawRequests([]);
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(rawRequests, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `network-inspector-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleSaveConfig(newConfig) {
    setConfig(newConfig);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ config: newConfig });
    }
    setShowConfig(false);
  }

  return (
    <div className="app">
      <FilterBar
        services={allServices}
        filters={filters}
        onFiltersChange={setFilters}
        onClear={handleClear}
        onExport={handleExport}
        onToggleConfig={() => setShowConfig((v) => !v)}
        totalCount={rawRequests.length}
        filteredCount={filtered.length}
      />

      <div className="service-list">
        {grouped.length === 0 ? (
          <div className="empty-state">
            {rawRequests.length === 0
              ? 'Waiting for network requests…'
              : 'No requests match the current filters.'}
          </div>
        ) : (
          grouped.map(([serviceName, requests]) => (
            <ServiceGroup
              key={serviceName}
              serviceName={serviceName}
              color={colorForService(serviceName)}
              requests={requests}
              slowThreshold={config.slowThreshold}
            />
          ))
        )}
      </div>

      {showConfig && (
        <ConfigEditor
          config={config}
          onSave={handleSaveConfig}
          onClose={() => setShowConfig(false)}
        />
      )}
    </div>
  );
}
