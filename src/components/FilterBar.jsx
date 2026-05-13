import React from 'react';

const STATUS_CLASSES = ['all', '2xx', '3xx', '4xx', '5xx'];

export default function FilterBar({
  services,
  filters,
  onFiltersChange,
  onClear,
  onExport,
  onToggleConfig,
  totalCount,
  filteredCount,
}) {
  function set(key, value) {
    onFiltersChange({ ...filters, [key]: value });
  }

  return (
    <div className="filter-bar">
      {/* Service filter */}
      <select
        value={filters.service}
        onChange={(e) => set('service', e.target.value)}
        title="Filter by service"
      >
        <option value="all">All Services</option>
        {services.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Status class tabs */}
      <div className="status-tabs">
        {STATUS_CLASSES.map((sc) => (
          <button
            key={sc}
            className={filters.statusClass === sc ? 'active' : ''}
            onClick={() => set('statusClass', sc)}
          >
            {sc === 'all' ? 'All' : sc.toUpperCase()}
          </button>
        ))}
      </div>

      {/* URL search */}
      <input
        type="text"
        placeholder="Search URL…"
        value={filters.searchText}
        onChange={(e) => set('searchText', e.target.value)}
      />

      {/* Failed only toggle */}
      <label className="filter-toggle" title="Show only failed (4xx/5xx)">
        <input
          type="checkbox"
          checked={filters.failedOnly}
          onChange={(e) => set('failedOnly', e.target.checked)}
        />
        Failed only
      </label>

      {/* Actions */}
      <button className="btn danger" onClick={onClear} title="Clear all captured requests">
        Clear
      </button>
      <button className="btn" onClick={onExport} title="Export logs as JSON">
        Export JSON
      </button>
      <button className="btn" onClick={onToggleConfig} title="Edit service mapping config">
        ⚙ Config
      </button>

      {/* Stats */}
      <span className="filter-stats">
        {filteredCount === totalCount
          ? `${totalCount} requests`
          : `${filteredCount} / ${totalCount}`}
      </span>
    </div>
  );
}
