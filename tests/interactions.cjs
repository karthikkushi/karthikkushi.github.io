const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
class Element {
  constructor(dataset = {}, id = '') { this.dataset = dataset; this.id = id; this.style = {}; this.listeners = {}; this.attributes = {}; }
  addEventListener(event, callback) { this.listeners[event] = callback; }
  setAttribute(key, value) { this.attributes[key] = value; }
  append(...children) { this.children = children; }
  replaceChildren(...children) { this.children = children; }
  focus() { this.focused = true; }
  showModal() { this.open = true; }
  close() { this.open = false; this.listeners.close?.(); }
  getBoundingClientRect() { return {left: 10, right: 500, top: 10, bottom: 600}; }
}
const projectButtons = ['autodev', 'leadfinder', 'kalvio', 'desk', 'karchi'].map(project => new Element({project}));
const tabs = ['brief', 'build', 'review', 'approve'].map(stage => new Element({stage}, `tab-${stage}`));
const elements = new Map();
const document = {
  querySelector(selector) { if (!elements.has(selector)) elements.set(selector, new Element()); return elements.get(selector); },
  querySelectorAll(selector) { return selector === '[data-project]' ? projectButtons : tabs; },
  createElement() { return new Element(); }
};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8'), {document, Date});
const dialog = elements.get('#project-dialog');
// Public repos link to their source; private ones link to a live demo instead, never a 404.
for (const [index, [name, link, label]] of [
  ['AutoDev Agents', /^https:\/\/github.com\/karthikkushi\//, 'Explore the repository'],
  ['Lead Finder', /^https:\/\/github.com\/karthikkushi\//, 'Explore the repository'],
  ['Kalvio Build', /^https:\/\/github.com\/karthikkushi\//, 'Explore the repository'],
  ['Kalvio Desk', /^https:\/\/kalvio-desk\.pages\.dev\//, 'Open the live demo (sign-in required)'],
  ['Karchi', /^https:\/\/karchi-ten\.vercel\.app\/demo\//, 'Open the live demo'],
].entries()) {
  projectButtons[index].listeners.click();
  assert.equal(dialog.open, true);
  assert.equal(elements.get('#dialog-title').textContent, name);
  assert.equal(elements.get('#dialog-sections').children.length, 4);
  assert.match(elements.get('#dialog-source').href, link);
  assert.equal(elements.get('#dialog-source-label').textContent, label);
  elements.get('.close-dialog').listeners.click();
  assert.equal(dialog.open, false);
  assert.equal(projectButtons[index].focused, true, 'Closing returns focus to opener');
}
projectButtons[0].listeners.click();
dialog.listeners.click({target: dialog, clientX: 100, clientY: 100});
assert.equal(dialog.open, true, 'An interior click must not close project notes');
dialog.listeners.click({target: dialog, clientX: 1, clientY: 1});
assert.equal(dialog.open, false, 'A backdrop click closes project notes');
let prevented = false;
tabs[0].listeners.keydown({key: 'ArrowLeft', preventDefault() { prevented = true; }});
assert.equal(prevented, true);
assert.equal(tabs[3].attributes['aria-selected'], 'true', 'ArrowLeft wraps to the final stage');
assert.equal(elements.get('#stage-panel').attributes['aria-labelledby'], 'tab-approve');
assert.match(elements.get('.stage-content p').textContent, /approval/);
tabs[3].listeners.keydown({key: 'Home', preventDefault() {}});
assert.equal(tabs[0].attributes['aria-selected'], 'true');
tabs[0].listeners.keydown({key: 'End', preventDefault() {}});
assert.equal(tabs[3].attributes['aria-selected'], 'true');
tabs[1].listeners.click();
assert.equal(tabs.filter(tab => tab.attributes['aria-selected'] === 'true').length, 1);
assert.equal(tabs.filter(tab => tab.tabIndex === 0).length, 1);
assert.equal(elements.get('.stage-number').textContent, '02');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  if (/^(?:https?:|data:)/.test(match[1])) continue;
  assert.ok(fs.existsSync(path.join(root, match[1].split("?")[0])), `Missing local asset: ${match[1]}`);
}
for (const anchor of html.matchAll(/href="#([^"]+)"/g)) assert.ok(html.includes(`id="${anchor[1]}"`), `Broken navigation: ${anchor[1]}`);
assert.doesNotMatch(html, /weather_application|BlogApp/);
console.log('Passed: project panels, close/focus behavior, keyboard tab navigation, local assets, and section links.');
