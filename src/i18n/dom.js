// Translates the rendered page in place. React keeps working with its English
// strings; this layer rewrites text nodes / a few attributes after React has drawn
// them, and puts the English back when the language is switched back.
//
//  * Adjacent text nodes (React splits "You have {n} items" into 3 nodes) are
//    joined and matched as one sentence, so Amharic word order is preserved.
//  * When React later changes a node, the new English is translated again.
import { lookup, translateKeepingSpace } from './translate.js';

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'CODE', 'PRE', 'SVG', 'MATH', 'TITLE', 'HEAD']);
const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];

const textRecords = new WeakMap(); // Text node -> { en, tr }
const attrRecords = new WeakMap(); // Element   -> { [attr]: { en, tr } }

let observer = null;
let active = false;

function skipped(el) {
  for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
    if (SKIP_TAGS.has(n.tagName.toUpperCase?.() ?? n.tagName)) return true;
    if (n.getAttribute('translate') === 'no' || n.hasAttribute('data-i18n-skip')) return true;
    if (n.isContentEditable) return true;
  }
  return false;
}

/** The English that React last wrote into this node. */
function englishOf(node) {
  const rec = textRecords.get(node);
  if (rec && rec.tr !== null && node.data === rec.tr) return rec.en;
  textRecords.set(node, { en: node.data, tr: null });
  return node.data;
}

function put(node, text) {
  const rec = textRecords.get(node);
  rec.tr = text;
  if (node.data !== text) node.data = text;
}

function processRun(run) {
  const ens = run.map(englishOf);
  const joined = ens.join('');
  if (!joined.trim()) { run.forEach((n, i) => put(n, ens[i])); return; }

  const nonEmpty = run.filter((_, i) => ens[i].trim() !== '');
  if (nonEmpty.length > 1) {
    const whole = translateKeepingSpace(joined);
    if (whole !== null) {
      const first = run.findIndex((_, i) => ens[i].trim() !== '');
      run.forEach((n, i) => put(n, i === first ? whole : ''));
      return;
    }
  }
  run.forEach((n, i) => {
    const t = ens[i].trim() ? translateKeepingSpace(ens[i]) : null;
    put(n, t ?? ens[i]);
  });
}

function processContainer(el) {
  let run = [];
  for (const c of el.childNodes) {
    if (c.nodeType === 3) { run.push(c); continue; }
    if (run.length) { processRun(run); run = []; }
  }
  if (run.length) processRun(run);
}

function processAttrs(el) {
  let rec = attrRecords.get(el);
  for (const a of ATTRS) {
    if (!el.hasAttribute(a)) continue;
    const v = el.getAttribute(a);
    const r = rec?.[a];
    const en = r && r.tr !== null && v === r.tr ? r.en : v;
    const t = lookup(en);
    if (!rec) { rec = {}; attrRecords.set(el, rec); }
    rec[a] = { en, tr: t ?? en };
    if (t !== null && t !== v) el.setAttribute(a, t);
  }
}

function processElement(el) {
  if (skipped(el)) return;
  processContainer(el);
  processAttrs(el);
}

function processTree(root) {
  if (root.nodeType === 3) { if (root.parentElement) processElement(root.parentElement); return; }
  if (root.nodeType !== 1 || skipped(root)) return;
  processElement(root);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (n) => (SKIP_TAGS.has(n.tagName.toUpperCase?.() ?? n.tagName) || n.hasAttribute('data-i18n-skip') || n.getAttribute('translate') === 'no'
      ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    processContainer(n);
    processAttrs(n);
  }
}

function restoreTree(root) {
  const textWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = textWalker.nextNode(); n; n = textWalker.nextNode()) {
    const rec = textRecords.get(n);
    if (rec && rec.tr !== null && n.data === rec.tr) { n.data = rec.en; textRecords.delete(n); }
  }
  const elWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  for (let n = elWalker.nextNode(); n; n = elWalker.nextNode()) {
    const rec = attrRecords.get(n);
    if (!rec) continue;
    for (const [a, r] of Object.entries(rec)) {
      if (n.getAttribute(a) === r.tr) n.setAttribute(a, r.en);
    }
    attrRecords.delete(n);
  }
}

function onMutations(records) {
  const containers = new Set();
  const trees = new Set();
  for (const m of records) {
    if (m.type === 'characterData') {
      const p = m.target.parentElement;
      if (p) containers.add(p);
    } else if (m.type === 'childList') {
      if (m.target.nodeType === 1) containers.add(m.target);
      m.addedNodes.forEach((n) => { if (n.nodeType === 1) trees.add(n); });
    } else if (m.type === 'attributes') {
      containers.add(m.target);
    }
  }
  // Our own writes must not trigger another round.
  observer.disconnect();
  try {
    trees.forEach((t) => { if (t.isConnected) processTree(t); });
    containers.forEach((c) => { if (c.isConnected && !trees.has(c)) processElement(c); });
  } finally {
    attach();
  }
}

function attach() {
  observer.observe(document.body, {
    subtree: true, childList: true, characterData: true,
    attributes: true, attributeFilter: ATTRS,
  });
}

export function startDomTranslation() {
  if (typeof document === 'undefined' || active) return;
  active = true;
  observer = new MutationObserver(onMutations);
  processTree(document.body);
  attach();
}

export function stopDomTranslation() {
  if (!active) return;
  active = false;
  observer.disconnect();
  observer = null;
  restoreTree(document.body);
}
