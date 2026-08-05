import React from 'react';

function methodClass(method) {
  const m = (method || '').toUpperCase();
  if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(m)) return `method-${m}`;
  return 'method-OTHER';
}

function statusClass(status) {
  if (status >= 200 && status < 300) return 'status-2xx';
  if (status >= 300 && status < 400) return 'status-3xx';
  if (status >= 400 && status < 500) return 'status-4xx';
  if (status >= 500) return 'status-5xx';
  return 'status-other';
}

function timeClass(time, threshold) {
  if (time > threshold * 3) return 'time-very-slow';
  if (time > threshold) return 'time-slow';
  return 'time-normal';
}

function shortUrl(url) {
  try {
    const u = new URL(url);
    return u.pathname + (u.search ? u.search.slice(0, 30) + (u.search.length > 30 ? '…' : '') : '');
  } catch {
    return url.length > 80 ? url.slice(0, 80) + '…' : url;
  }
}

export default function RequestRow({ request, slowThreshold }) {
  const { method, url, status, time } = request;

  return (
    <tr className={timeClass(time, slowThreshold)}>
      <td>
        <span className={`method ${methodClass(method)}`}>{method}</span>
      </td>
      <td className="url-cell" title={url}>
        {shortUrl(url)}
      </td>
      <td>
        <span className={`status ${statusClass(status)}`}>
          {status || '—'}
        </span>
      </td>
      <td>
        {time}ms
      </td>
    </tr>
  );
}
