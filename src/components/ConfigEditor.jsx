import React, { useState } from 'react';

function newRule(type, pattern, service) {
  return { id: Date.now().toString(), type, pattern: pattern.trim(), service: service.trim() };
}

export default function ConfigEditor({ config, onSave, onClose }) {
  const [serviceMap, setServiceMap] = useState(() => [...(config.serviceMap || [])]);
  const [slowThreshold, setSlowThreshold] = useState(config.slowThreshold ?? 1000);

  // New-rule form state
  const [ruleType, setRuleType] = useState('path');
  const [rulePattern, setRulePattern] = useState('');
  const [ruleName, setRuleName] = useState('');

  function addRule() {
    if (!rulePattern || !ruleName) return;
    setServiceMap((prev) => [...prev, newRule(ruleType, rulePattern, ruleName)]);
    setRulePattern('');
    setRuleName('');
  }

  function removeRule(id) {
    setServiceMap((prev) => prev.filter((r) => r.id !== id));
  }

  function handleSave() {
    onSave({ serviceMap, slowThreshold: Number(slowThreshold) });
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span>Service Map Config</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Rules table */}
          <div className="config-section">
            <h3>Classification Rules (first match wins)</h3>
            {serviceMap.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                No rules yet — heuristic auto-detection is active.
              </p>
            ) : (
              <table className="rules-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Pattern</th>
                    <th>Service Name</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {serviceMap.map((rule) => (
                    <tr key={rule.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{rule.type}</td>
                      <td><code>{rule.pattern}</code></td>
                      <td>{rule.service}</td>
                      <td>
                        <button className="btn-icon" onClick={() => removeRule(rule.id)}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Add rule form */}
          <div className="config-section">
            <h3>Add Rule</h3>
            <div className="add-rule-form">
              <select value={ruleType} onChange={(e) => setRuleType(e.target.value)} style={{ flex: '0 0 auto', width: 'auto' }}>
                <option value="path">Path</option>
                <option value="subdomain">Subdomain</option>
              </select>
              <input
                type="text"
                placeholder={ruleType === 'path' ? '/users' : 'auth'}
                value={rulePattern}
                onChange={(e) => setRulePattern(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addRule()}
              />
              <input
                type="text"
                placeholder="Service name"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addRule()}
              />
              <button className="btn" onClick={addRule}>Add</button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 6 }}>
              <strong>Path</strong>: matches if request pathname <em>contains</em> the pattern.&nbsp;
              <strong>Subdomain</strong>: matches if first subdomain label equals the pattern.
            </p>
          </div>

          {/* Slow threshold */}
          <div className="config-section">
            <h3>Slow Request Threshold</h3>
            <div className="threshold-row">
              <label>Highlight requests slower than</label>
              <input
                type="number"
                min={0}
                value={slowThreshold}
                onChange={(e) => setSlowThreshold(e.target.value)}
              />
              <span style={{ color: 'var(--text-muted)' }}>ms</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}
