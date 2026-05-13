import React, { useState, useMemo } from 'react';
import RequestRow from './RequestRow.jsx';

export default function ServiceGroup({ serviceName, color, requests, slowThreshold }) {
  const [expanded, setExpanded] = useState(false);

  const avgTime = useMemo(() => {
    if (!requests.length) return 0;
    const sum = requests.reduce((acc, r) => acc + r.time, 0);
    return Math.round(sum / requests.length);
  }, [requests]);

  const failCount = requests.filter((r) => r.status >= 400).length;

  return (
    <div className="service-group">
      <div
        className="service-group-header"
        style={{ color }}
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="service-dot" style={{ background: color }} />
        <span className="service-name">{serviceName}</span>
        <span className="service-meta">
          {requests.length} req
          {failCount > 0 && ` · ${failCount} err`}
          {' · '}avg {avgTime}ms
        </span>
        <span className="chevron">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <table className="request-table">
          <thead>
            <tr>
              <th style={{ width: 70 }}>Method</th>
              <th>URL</th>
              <th style={{ width: 64 }}>Status</th>
              <th style={{ width: 80 }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <RequestRow
                key={req.id}
                request={req}
                slowThreshold={slowThreshold}
                serviceColor={color}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
