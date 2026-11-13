const slides = [...document.querySelectorAll('[data-slide]')];
const navigation = document.querySelector('.deck-nav');
const selector = navigation.querySelector('select');
const counter = navigation.querySelector('output');

for (const frame of document.querySelectorAll('.figma-design > div')) {
  let step = 0;
  for (const layer of frame.children) {
    const name = layer.getAttribute('data-name') ?? '';
    if (/grid|background|overlay|scrim|main title/i.test(name) || layer.matches('p.bg-clip-text')) continue;
    layer.classList.add('figma-reveal');
    layer.style.setProperty('--figma-step', Math.min(step++, 8));
  }
}
const streams = document.querySelector('[data-slide="d01"] [data-node-id="227:141"]');
const streamArt = streams?.querySelector('img');
if (streamArt) streams.style.setProperty('--stream-art', `url("${streamArt.getAttribute('src')}")`);

const stakeholderFlow = document.querySelector('[data-node-id="286:490"]');
if (stakeholderFlow) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 640 640');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('stakeholder-arrows');
  svg.innerHTML = [0, 90, 180, 270]
    .map(angle => `<path transform="rotate(${angle} 320 320)" d="M314 -7L328 0L314 7"/>`)
    .join('');
  stakeholderFlow.append(svg);
}

const orbit = document.querySelector('[data-node-id="342:563"]');
if (orbit) {
  const orbitItems = [
    ['245:406', '245:408', '245:416'],
    ['245:417', '245:419', '245:426'],
    ['245:427', '245:429', '245:436'],
    ['245:437', '245:439', '245:446'],
    ['245:447', '245:449', '245:456'],
    ['245:457', '245:459', '245:466']
  ];
  for (const [index, ids] of orbitItems.entries()) {
    const [connection, tag, dot] = ids.map(id => document.querySelector(`[data-node-id="${id}"]`));
    if (!connection || !tag || !dot) continue;
    const group = document.createElement('div');
    group.className = 'orbit-connection';
    connection.classList.add('orbit-relocated');
    tag.style.setProperty('--orbit-delay', `${index * 12}s`);
    group.append(connection, tag, dot);
    orbit.append(group);
  }
}

const locations = [
  [153, 154, 157], // United States
  [168, 169, 172], // Brazil
  [158, 159, 162], // Germany
  [173, 174, 177], // Singapore
  [163, 164, 167] // Japan
];
for (const [index, ids] of locations.entries()) {
  for (const id of ids) {
    const layer = document.querySelector(`[data-node-id="I323:726;169:${id}"]`);
    if (!layer) continue;
    layer.classList.add('map-location');
    layer.style.setProperty('--location-delay', `${index * 2.6}s`);
  }
}

const previous = navigation.querySelector('[data-prev]');
const next = navigation.querySelector('[data-next]');
let index = 0;

for (const [i, slide] of slides.entries()) {
  selector.add(new Option(slide.dataset.label, String(i)));
}

const destinations = ['chapter', 'c02', 'c05-outcomes', 'roadmap'];
for (const agenda of document.querySelectorAll('[data-slide="b01b"], [data-slide="b03"]')) {
  const cards = agenda.querySelectorAll('[data-name^="Current / 0"], [data-name^="Default / 0"]');
  for (const [index, card] of [...cards].entries()) {
    const target = slides.findIndex(slide => slide.dataset.slide === destinations[index]);
    if (target < 0) continue;
    card.classList.add('deck-agenda-card');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'deck-agenda-link';
    button.setAttribute(
      'aria-label',
      'Go to ' + ['Product Ecosystem', 'Capabilities & Value', 'Results & Progress', 'Roadmap & Next Steps'][index]
    );
    button.addEventListener('click', () => {
      showSlide(target);
      selector.focus();
    });
    card.append(button);
  }
}

const effectFrame = document.querySelector('.deck-live-effect');
if (effectFrame) {
  window.addEventListener('message', event => {
    if (event.source === effectFrame.contentWindow && event.data?.type === 'template-effect-ready') {
      document.documentElement.classList.add('deck-effect-ready');
    }
  });
}

function showSlide(position) {
  index = Math.max(0, Math.min(slides.length - 1, position));
  slides.forEach((slide, i) => {
    slide.hidden = i !== index;
  });
  selector.value = String(index);
  counter.value = index + 1 + ' / ' + slides.length;
  previous.disabled = index === 0;
  next.disabled = index === slides.length - 1;
}

document.documentElement.classList.add('motion');
navigation.hidden = false;
selector.addEventListener('change', () => showSlide(Number(selector.value)));
document
  .querySelectorAll('[data-next]')
  .forEach(button => button.addEventListener('click', () => showSlide(index + 1)));
previous.addEventListener('click', () => showSlide(index - 1));
document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('select, input, textarea')) return;
  const moves = {
    ArrowLeft: index - 1,
    PageUp: index - 1,
    ArrowRight: index + 1,
    PageDown: index + 1,
    Home: 0,
    End: slides.length - 1
  };
  if (!Object.hasOwn(moves, event.key)) return;
  event.preventDefault();
  showSlide(moves[event.key]);
});
showSlide(0);
