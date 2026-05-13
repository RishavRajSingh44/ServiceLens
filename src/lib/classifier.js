/**
 * classifier.js — pure service classification logic, no Chrome APIs.
 */

/**
 * Path segments that are pure infrastructure noise and carry no service identity.
 */
const SKIP_SEGMENT = /^(api|rest|graphql|rpc|ac|sac|svc|service|services|v\d+[\w.-]*|\d+)$/i;

/**
 * Segments that describe an operation on a resource, not the resource itself.
 * In REST/OData paths these appear AFTER the primary entity — we skip them
 * once we already have a resource noun candidate.
 * e.g.  /models(ID)/objectstatus  →  "objectstatus" is skipped, "models" wins
 */
const SUB_RESOURCE = /^(objectstatus|status|details|items|addresses|history|metadata|schema|config|settings|info|count|search|suggest|export|import|lock|unlock|activate|deactivate|validate|submit|approve|reject|cancel|clone|copy|move|preview|publish|unpublish|archive|restore|purge|sync|refresh|reset|ping|health|heartbeat|version|changelog|events|logs|audit|permissions|roles|members|tags|labels|attachments|comments|notes|notifications|subscriptions|webhooks|tokens|keys|secrets|credentials|certificates)$/i;

/**
 * A segment that looks like a reverse-DNS / SAP-style package prefix.
 * Starts with a known TLD-like prefix and is purely alphanumeric+dots.
 * Examples:
 *   comsapdsciamassetcentral.sapiotainmanagemodels
 *   comsapmanumanufacturers
 *   comsapsdorders.sapcreatepurchaseorders
 */
const PACKAGE_PREFIX = /^(com|sap|org|net|io|de|fr|uk|eu)[a-z0-9]*(\.([a-z][a-z0-9]+))*$/i;

/**
 * Known SAP namespace prefixes to strip — longest first so greedy matches win.
 */
const KNOWN_NS = [
  'comsapdsciamassetcentral', 'comsapdsc', 'sapiotainmanage', 'sapiotain',
  'sapcreat', 'sapcreate', 'sapmanage', 'sapread', 'saplist',
  'comsap', 'sap', 'com', 'org', 'net', 'io',
];

/** Verb prefixes that decorate entity nouns in concatenated SAP component names. */
const VERB_PREFIX = /^(manage|handle|process|get|list|create|update|delete|fetch|read|write|search|view|show|find|query)/i;

function extractFromPackageSegment(seg) {
  const parts = seg.split('.');
  let candidate = parts[parts.length - 1].toLowerCase();

  for (const ns of KNOWN_NS) {
    if (candidate.startsWith(ns) && candidate.length > ns.length) {
      candidate = candidate.slice(ns.length);
      break;
    }
  }

  // Strip leading verb prefix
  const afterVerb = candidate.replace(VERB_PREFIX, '');
  if (afterVerb) candidate = afterVerb;

  // Handle stutter prefixes: "manumanufacturers" → the tail "manufacturers"
  // already contains the head fragment "manu" — strip the duplicate head.
  // Try progressively shorter prefixes (up to 6 chars) and check if removing
  // the head prefix leaves a word that starts the same way (making the head redundant).
  for (let len = 6; len >= 2; len--) {
    if (candidate.length <= len) continue;
    const head = candidate.slice(0, len);
    const tail = candidate.slice(len);
    if (tail.startsWith(head) || tail.includes(head)) {
      // head is a prefix of tail — the tail is the "real" word
      candidate = tail;
      break;
    }
  }

  return candidate;
}

/**
 * Strip OData / REST key expressions from a segment.
 * "models(54A13E987409421EBE4913B666A562FF)"  → "models"
 * "products('P-001')"                          → "products"
 * "items[3]"                                   → "items"
 */
function stripResourceKey(seg) {
  return seg.replace(/[([{].*$/, '');
}

/**
 * Classify a request URL into a service name.
 * @param {string} url
 * @param {Array<{type: string, pattern: string, service: string}>} serviceMap
 * @returns {string}
 */
export function classifyRequest(url, serviceMap = []) {
  if (
    url.startsWith('chrome') ||
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('about:')
  ) {
    return 'internal';
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch (_e) {
    return 'unknown';
  }

  const { pathname, hostname } = parsed;

  // 1. Explicit user-defined rules — first match wins
  for (const rule of serviceMap) {
    if (rule.type === 'path') {
      if (pathname.includes(rule.pattern)) return rule.service;
    } else if (rule.type === 'subdomain') {
      const labels = hostname.split('.');
      if (labels.length > 2 && labels[0] === rule.pattern) return rule.service;
    }
  }

  // 2. Subdomain heuristic — only for simple 3-label hosts like "auth.example.com".
  //    Hosts with 4+ labels are platform/cloud hostnames where the first label is a
  //    tenant or account name, not a service name (e.g. SAP BTP:
  //    "anmanufacturers.iam-de.cfapps.sap.hana.ondemand.com" → 6 labels).
  //    For those, fall through to path-based classification.
  const GENERIC_SUBDOMAIN = /^(api|gw|gateway|www|cdn|static|assets|media|proxy|lb|edge|prod|staging|dev|test|sandbox|internal|external|public|private|v\d+)$/i;
  const labels = hostname.split('.');
  if (labels.length === 3 && !GENERIC_SUBDOMAIN.test(labels[0])) {
    return labels[0];
  }

  // 3. Path heuristic — two passes:
  //    Pass A: collect only explicit resource nouns (skip package prefixes & sub-resources)
  //    Pass B: if pass A yields nothing, fall back to nouns extracted from package segments
  const rawSegments = pathname.split('/').filter(Boolean);
  const packageNouns = [];   // extracted from SAP/reverse-DNS package segments
  const resourceNouns = [];  // real REST/OData entity names

  for (const raw of rawSegments) {
    const seg = stripResourceKey(decodeURIComponent(raw));

    // Skip tilde-wrapped routing tokens: ~37091c69-38c5-4cc2-ba55-d0a87c993a24~
    if (/^~/.test(seg)) continue;

    // Skip UUIDs and pure hex IDs
    if (/^[0-9a-f]{8}[0-9a-f-]*$/i.test(seg)) continue;

    // Skip purely numeric segments
    if (/^\d+$/.test(seg)) continue;

    // Skip infrastructure noise (api, rest, v1, ac, …)
    if (SKIP_SEGMENT.test(seg)) continue;

    if (PACKAGE_PREFIX.test(seg)) {
      // SAP/reverse-DNS namespace segment — extract entity noun but keep looking
      const noun = extractFromPackageSegment(seg);
      if (noun) packageNouns.push(noun);
      continue;
    }

    // Skip sub-resource/action tokens that appear after the primary entity
    if (SUB_RESOURCE.test(seg) && resourceNouns.length > 0) continue;

    resourceNouns.push(seg.toLowerCase());
  }

  // Prefer first explicit resource noun (primary entity in REST hierarchy)
  if (resourceNouns.length > 0) return resourceNouns[0];

  // Fall back to what we extracted from the package segment
  if (packageNouns.length > 0) return packageNouns[0];

  return hostname || 'unknown';
}

/**
 * Return a deterministic HSL color string for a service name.
 * @param {string} name
 * @returns {string}  e.g. "hsl(210,65%,42%)"
 */
export function colorForService(name) {
  let h = 5381;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) + h) ^ name.charCodeAt(i);
    h = h >>> 0;
  }
  const hue = h % 360;
  return `hsl(${hue},65%,42%)`;
}
