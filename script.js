const root = document.documentElement;
const header = document.querySelector('.site-header');
const nav = document.querySelector('.nav');
const toggle = document.querySelector('.nav-toggle');

window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 20), {passive:true});
toggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle?.setAttribute('aria-expanded','false');
}));


// Dropdown de servicios: hover en escritorio y toque en móvil.
const serviceDropdown = document.querySelector('.nav-dropdown');
const serviceTrigger = document.querySelector('.nav-dropdown-trigger');
serviceTrigger?.addEventListener('click', (e) => {
  if (window.innerWidth <= 980) {
    e.preventDefault();
    serviceDropdown?.classList.toggle('open');
  }
});
document.querySelectorAll('.nav-dropdown-menu a').forEach(a => a.addEventListener('click', () => {
  serviceDropdown?.classList.remove('open');
}));

// Luz global azul + amarilla, suavizada para que siga el mouse por toda la página.
let targetX = window.innerWidth * .5;
let targetY = window.innerHeight * .35;
let currentX = targetX;
let currentY = targetY;
let pointerSeen = false;
window.addEventListener('pointermove', e => {
  pointerSeen = true;
  targetX = e.clientX;
  targetY = e.clientY;
}, {passive:true});
function animateAura(){
  currentX += (targetX-currentX)*.105;
  currentY += (targetY-currentY)*.105;
  root.style.setProperty('--mouse-x', `${currentX}px`);
  root.style.setProperty('--mouse-y', `${currentY}px`);
  requestAnimationFrame(animateAura);
}
requestAnimationFrame(animateAura);

const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    entry.target.querySelectorAll?.('[data-count]').forEach(animateCount);
    if (entry.target.matches?.('[data-count]')) animateCount(entry.target);
    io.unobserve(entry.target);
  });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

document.querySelectorAll('[data-count]').forEach(el => {
  const p = el.closest('.reveal');
  if (!p) animateCount(el);
});
function animateCount(el){
  if (el.dataset.done) return;
  el.dataset.done = '1';
  const target = Number(el.dataset.count || 0);
  const start = performance.now();
  const duration = 900;
  function tick(now){
    const t = Math.min(1,(now-start)/duration);
    const eased = 1 - Math.pow(1-t,3);
    el.textContent = Math.round(target*eased);
    if(t<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Mini demostración de la lógica Applied / Skipped / Why.
const validationRows = [...document.querySelectorAll('#validationStream > div')];
const reason = document.getElementById('diagnosticReason');
const cycles = [
  [
    [
      ['DETECTED','ok'],['APPLIED','ok'],['APPLIED','ok'],['SKIPPED','skip'],['APPLIED','ok']
    ],
    'Power Throttling: omitido cuando el perfil del equipo indica que conviene conservar la administración de energía.'
  ],
  [
    [
      ['DETECTED','ok'],['APPLIED','ok'],['APPLIED','ok'],['VALIDATED','ok'],['36 KEYS','wait']
    ],
    'Warzone: solo se modifican claves de rendimiento; monitor, audio y controles permanecen fuera del reemplazo.'
  ],
  [
    [
      ['DETECTED','ok'],['VALIDATED','ok'],['VALIDATED','ok'],['VALIDATED','ok'],['BACKUP OK','ok']
    ],
    'Validación completada: los cambios incompatibles se clasifican y las advertencias quedan registradas para revisión.'
  ]
];
let cycleIndex = 0;
function cycleDiagnostics(){
  if(!validationRows.length || !reason) return;
  const [states, msg] = cycles[cycleIndex % cycles.length];
  validationRows.forEach((row,i)=>{
    const status=row.querySelector('b');
    if(!status || !states[i]) return;
    status.textContent=states[i][0];
    status.className=states[i][1];
  });
  reason.textContent=msg;
  cycleIndex++;
}
cycleDiagnostics();
setInterval(cycleDiagnostics, 3300);

const year = document.getElementById('year');
if(year) year.textContent = new Date().getFullYear();

const toast = document.getElementById('toast');

// Reseñas reales de TikTok: una sola fila, movimiento continuo e infinito.
(function renderTikTokReviews(){
  const track = document.getElementById('reviewsTrack');
  if (!track) return;
  const fallbackUrl = window.BOLILLO_REVIEW_FALLBACK_URL || 'https://www.tiktok.com/@bolillo141oficial/video/7587006701144952084';
  const raw = Array.isArray(window.BOLILLO_REVIEWS) ? window.BOLILLO_REVIEWS : [];
  const reviews = raw.filter(r => r && r.text).map(r => ({...r, url: r.url || fallbackUrl}));
  if (!reviews.length) return;

  const escapeHtml = (value='') => String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const card = review => {
    const avatar = review.avatar
      ? `<img class="review-avatar" src="${escapeHtml(review.avatar)}" alt="Foto de perfil de ${escapeHtml(review.handle || review.name || 'usuario')}" loading="lazy" />`
      : `<span class="review-avatar-fallback">${escapeHtml((review.name || review.handle || '?').replace('@','').slice(0,1).toUpperCase())}</span>`;
    const featuredClass = review.featured ? ' featured' : '';
    const badge = review.badge ? `<span class="review-badge">${escapeHtml(review.badge)}</span>` : '';
    return `<a class="review-card${featuredClass}" href="${escapeHtml(review.url)}" target="_blank" rel="noopener noreferrer">
      ${badge}
      <div class="review-head">${avatar}<span class="review-person"><b>${escapeHtml(review.name || review.handle || 'Usuario TikTok')}</b><small>${escapeHtml(review.handle || 'TikTok')}</small></span><span class="review-platform">♪</span></div>
      <p>“${escapeHtml(review.text)}”</p>
      <span class="review-link">VER EN TIKTOK ↗</span>
    </a>`;
  };

  // Dos copias idénticas permiten un loop visual continuo sin cortes ni pausas.
  const loop = [...reviews, ...reviews];
  track.innerHTML = loop.map(card).join('');
})();


// Agenda por WhatsApp: genera el mensaje, lo copia y abre el contacto oficial.
const bookingForm = document.getElementById('bookingForm');
const bookingStatus = document.getElementById('bookingStatus');
const whatsappContactUrl = 'https://wa.me/qr/535XMU5WEVWGJ1';
bookingForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const value = id => document.getElementById(id)?.value?.trim() || 'No especificado';
  const message = [
    'Hola Bolillo, quiero agendar una optimización.',
    '',
    `Nombre: ${value('bookingName')}`,
    `Paquete: ${value('bookingPackage')}`,
    `CPU: ${value('bookingCpu')}`,
    `GPU: ${value('bookingGpu')}`,
    `RAM: ${value('bookingRam')}`,
    `Windows: ${value('bookingWindows')}`,
    `Juego principal: ${value('bookingGame')}`,
    `Quiero mejorar / problema: ${value('bookingProblem')}`,
    '',
    'Vengo desde Bolillo Optimizer'
  ].join('\n');

  let copied = false;
  try {
    await navigator.clipboard.writeText(message);
    copied = true;
  } catch (_) {
    const ta = document.createElement('textarea');
    ta.value = message;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    copied = document.execCommand('copy');
    ta.remove();
  }
  if (bookingStatus) bookingStatus.textContent = copied
    ? 'Mensaje copiado ✓ Abriendo WhatsApp… pégalo en el chat para enviarlo.'
    : 'Abriendo WhatsApp… copia los datos del formulario al chat.';
  window.open(whatsappContactUrl, '_blank', 'noopener,noreferrer');
});
