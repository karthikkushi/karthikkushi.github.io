const projects = {
  autodev: {
    name: 'AutoDev Agents', kind: 'Developer tools / Independent experiment',
    intro: 'A development workflow that starts with a design brief and keeps a human in charge of publishing.',
    sections: [
      ['The problem', 'Turning an idea into a working project involves many handoffs: planning, research, coding, review, testing, and delivery. Managing those steps manually creates repetitive work.'],
      ['The approach', 'A Python and LangGraph pipeline connects specialist stages, with a dashboard for following progress and controlling the run. SQLite checkpoints support resuming work, while a model router handles provider fallbacks.'],
      ['A deliberate decision', 'The publishing stage waits for approval. The workflow can also reject a push, keeping generated work local. Automation helps move work forward while the final decision stays with the person using it.'],
      ['Status & stack', 'An independent experiment documented in the public repository. Python, LangGraph, LiteLLM, FastAPI, and SQLite. The project explores human-supervised development with multiple AI providers.']
    ], url: 'https://github.com/karthikkushi/autodev-agents'
  },
  leadfinder: {
    name: 'Lead Finder', kind: 'Local business tools / AI-assisted research',
    intro: 'From finding a business to understanding what would make a useful conversation.',
    sections: [
      ['The problem', 'Finding local businesses that need website help takes research. A contact list alone does not explain what a business needs or how to approach it.'],
      ['The approach', 'The project gathers business information, checks websites, and builds source-backed research facts. A brief-generation stage turns those findings into concise call preparation.'],
      ['A deliberate decision', 'Research separates information that could not be checked from a confirmed absence. Briefs are designed to cite the collected facts, rather than invent claims about a business.'],
      ['Implementation', 'Python research, classification, verification, reporting, and database modules, alongside a web interface. Reporting code prepares an email and CSV with contact links. ']
    ], url: 'https://github.com/karthikkushi/leadfinder'
  },
  kalvio: {
    name: 'Kalvio Build', kind: 'Local business websites / Product development',
    intro: 'Let a business owner see a website for their own shop before making a decision.',
    sections: [
      ['The problem', 'A generic website pitch asks a local business owner to imagine the result. That makes it harder to judge whether a website is useful for their business.'],
      ['The approach', 'Kalvio pairs an agency website with personalized sample sites. Business presets and themes provide a starting point, while shareable links carry the shop’s own details.'],
      ['A deliberate decision', 'A sharing flow makes the preview part of a real conversation: a website image, short video, and personalized link can be prepared for a business owner.'],
      ['Implementation', 'React, TypeScript, and Vite, with business presets, theme definitions, personalization routes, and a sharing kit. The sample-first approach makes the result tangible before a business owner commits.']
    ], url: 'https://github.com/karthikkushi/kalvio-build'
  }
};
const stages = {
  brief: ['01', 'Start with intent', 'A clear brief.\nA shared direction.', 'A Markdown design document becomes a plan. Research and design stages give the coding workflow a concrete starting point.'],
  build: ['02', 'Make the plan tangible', 'One task.\nThen the next.', 'The coder works through planned tasks. Checkpoints preserve workflow state so the process can resume after an interruption.'],
  review: ['03', 'Look closely', 'Build. Check.\nRefine.', 'Review, test, and visual-review stages inspect the generated work. Bounded correction loops address findings and retain known issues.'],
  approve: ['04', 'Keep the final say', 'Your project.\nYour decision.', 'The pipeline waits for approval before pushing to GitHub. Rejecting the push keeps the generated project local.']
};
const dialog = document.querySelector('#project-dialog');
let opener;
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
  const project = projects[button.dataset.project];
  if (!project) return;
  opener = button;
  document.querySelector('#dialog-title').textContent = project.name;
  document.querySelector('#dialog-kind').textContent = project.kind;
  document.querySelector('#dialog-intro').textContent = project.intro;
  document.querySelector('#dialog-source').href = project.url;
  const sections = project.sections.map(([heading, body]) => {
    const section = document.createElement('section');
    const h = document.createElement('h3'); h.textContent = heading;
    const p = document.createElement('p'); p.textContent = body;
    section.append(h, p); return section;
  });
  document.querySelector('#dialog-sections').replaceChildren(...sections);
  dialog.showModal();
  dialog.scrollTop = 0;
}));
document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => opener?.focus());
dialog.addEventListener('click', event => {
  const box = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
});
const tabs = [...document.querySelectorAll('[data-stage]')];
function selectStage(tab) {
  const stage = stages[tab.dataset.stage];
  if (!stage) return;
  tabs.forEach(item => { item.setAttribute('aria-selected', String(item === tab)); item.tabIndex = item === tab ? 0 : -1; });
  document.querySelector('#stage-panel').setAttribute('aria-labelledby', tab.id);
  document.querySelector('.stage-number').textContent = stage[0];
  document.querySelector('.stage-label').textContent = stage[1];
  const heading = document.querySelector('.stage-content h3');
  heading.textContent = stage[2]; heading.style.whiteSpace = 'pre-line';
  document.querySelector('.stage-content p').textContent = stage[3];
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectStage(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault(); tabs[next].focus(); selectStage(tabs[next]);
  });
});
document.querySelector('#year').textContent = String(new Date().getFullYear());
