// Constants
const EMOJIS = ['🧠', '⚡', '🎨', '📊', '🔧', '🎓', '🚀', '💡', '✨', '🤖'];
const GRADIENTS = [
  'linear-gradient(135deg,rgba(124,111,247,0.3),rgba(168,156,255,0.1))',
  'linear-gradient(135deg,rgba(244,200,74,0.2),rgba(251,146,60,0.1))',
  'linear-gradient(135deg,rgba(45,212,191,0.2),rgba(74,222,128,0.1))',
  'linear-gradient(135deg,rgba(244,114,182,0.2),rgba(168,85,247,0.1))',
  'linear-gradient(135deg,rgba(251,146,60,0.2),rgba(244,200,74,0.1))',
  'linear-gradient(135deg,rgba(74,222,128,0.2),rgba(45,212,191,0.1))',
];

const PROMPTS = [
  {
    id: 1,
    cat: 'trabajo',
    title: 'Redacta un email profesional persuasivo',
    desc: 'Genera emails de trabajo formales, claros y con llamada a la acción.',
    text: 'Actúa como un experto en comunicación corporativa. Redacta un email profesional que...',
    tools: ['ChatGPT', 'Claude']
  },
  {
    id: 2,
    cat: 'marketing',
    title: 'Crea un post viral para Instagram',
    desc: 'Genera captions con gancho, emojis y hashtags estratégicos.',
    text: 'Eres un experto en marketing digital y contenido viral. Crea un caption para Instagram que...',
    tools: ['ChatGPT', 'Gemini']
  },
  {
    id: 3,
    cat: 'programacion',
    title: 'Revisa y mejora mi código',
    desc: 'Analiza código, encuentra bugs y sugiere optimizaciones.',
    text: 'Eres un senior developer con 10 años de experiencia. Analiza este código y sugiere mejoras...',
    tools: ['Claude', 'ChatGPT']
  },
  {
    id: 4,
    cat: 'estudio',
    title: 'Explícame este concepto como si tuviera 10 años',
    desc: 'Simplifica conceptos complejos usando analogías y ejemplos.',
    text: 'Eres un profesor experto. Explica este concepto de forma simple y con ejemplos...',
    tools: ['ChatGPT']
  },
  {
    id: 5,
    cat: 'emprendimiento',
    title: 'Valida tu idea de negocio en 5 minutos',
    desc: 'Análisis rápido de viabilidad y puntos críticos de tu idea.',
    text: 'Actúa como un mentor de startups con experiencia. Analiza mi idea de negocio...',
    tools: ['Claude']
  },
  {
    id: 6,
    cat: 'personal',
    title: 'Crea tu plan de desarrollo personal',
    desc: 'Plan estructurado de crecimiento personal adaptado a tus metas.',
    text: 'Eres un coach de vida certificado. Ayúdame a crear un plan de desarrollo personal...',
    tools: ['ChatGPT', 'Gemini']
  },
  {
    id: 7,
    cat: 'marketing',
    title: 'Estrategia de contenido para 30 días',
    desc: 'Calendario editorial completo con ideas para cada plataforma.',
    text: 'Eres un estratega de contenido digital. Crea un calendario editorial para 30 días...',
    tools: ['Claude', 'ChatGPT']
  },
  {
    id: 8,
    cat: 'trabajo',
    title: 'Prepárate para una entrevista de trabajo',
    desc: 'Simula una entrevista y recibe feedback detallado.',
    text: 'Vas a simular ser un reclutador senior. Realiza una entrevista de trabajo...',
    tools: ['ChatGPT']
  },
  {
    id: 9,
    cat: 'programacion',
    title: 'Genera una API REST completa',
    desc: 'Crea endpoints, modelos y documentación lista para producción.',
    text: 'Eres un arquitecto de software backend especializado. Genera una API REST...',
    tools: ['Claude', 'ChatGPT']
  },
  {
    id: 10,
    cat: 'estudio',
    title: 'Resume cualquier documento en puntos clave',
    desc: 'Extrae los insights más importantes de textos largos.',
    text: 'Eres un experto en síntesis de información. Analiza este texto y extrae los puntos clave...',
    tools: ['ChatGPT']
  },
  {
    id: 11,
    cat: 'emprendimiento',
    title: 'Escribe un elevator pitch irresistible',
    desc: 'Tu propuesta de valor en 60 segundos que convence a inversores.',
    text: 'Eres un experto en storytelling para startups. Escribe un elevator pitch...',
    tools: ['Claude']
  },
  {
    id: 12,
    cat: 'personal',
    title: 'Supera el bloqueo creativo ahora mismo',
    desc: 'Técnicas y ejercicios para desbloquear tu creatividad al instante.',
    text: 'Eres un coach creativo y experto en pensamiento lateral. Proporciona técnicas...',
    tools: ['ChatGPT', 'Gemini']
  }
];

// Global state
let currentFilter = 'todos';
let currentPage = 1;
const PER_PAGE = 6;
let filteredPrompts = [...PROMPTS];

// ── FAVORITES ──
function getFavs() {
  return JSON.parse(localStorage.getItem('pn_favs') || '[]');
}

function isFav(id) {
  return getFavs().includes(id);
}

function toggleFav(id, btn) {
  let favs = getFavs();
  const wasFav = favs.includes(id);
  if (wasFav) {
    favs = favs.filter(f => f !== id);
    btn.textContent = '🤍';
    btn.classList.remove('faved');
  } else {
    favs.push(id);
    btn.textContent = '❤️';
    btn.classList.add('faved');
  }
  localStorage.setItem('pn_favs', JSON.stringify(favs));
  btn.classList.add('pop');
  setTimeout(() => btn.classList.remove('pop'), 300);
  showToast(wasFav ? '💔 Eliminado de favoritos' : '❤️ Guardado en favoritos');
}

// ── RENDERING ──
function renderPrompts() {
  const grid = document.getElementById('prompts-grid');
  const start = (currentPage - 1) * PER_PAGE;
  const page = filteredPrompts.slice(start, start + PER_PAGE);

  if (page.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--muted)">No se encontraron prompts. Prueba con otro filtro. 🔍</div>';
    return;
  }

  grid.innerHTML = page.map(p => `
    <div class="prompt-card" onclick="openModal(${p.id})">
      <div class="prompt-top">
        <span class="prompt-badge badge-${p.cat}">${catLabel(p.cat)}</span>
        <div class="prompt-actions" onclick="event.stopPropagation()">
          <button class="btn-icon" onclick="copyPrompt(${p.id},this)" title="Copiar">📋</button>
          <button class="btn-icon btn-fav ${isFav(p.id) ? 'faved' : ''}" onclick="toggleFav(${p.id},this)" title="Favorito">
            ${isFav(p.id) ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
      <div class="prompt-text">${p.text}</div>
      <div class="prompt-footer">
        <div class="prompt-tools">${p.tools.map(t => `<span class="tool-pill">${t}</span>`).join('')}</div>
        <button class="copy-btn" onclick="event.stopPropagation();copyPrompt(${p.id},this)">📋 Copiar</button>
      </div>
    </div>
  `).join('');

  updatePagination();
}

function renderBlog() {
  const grid = document.getElementById('blog-grid');
  
  fetch('./posts/index.json')
    .then(r => r.json())
    .then(posts => {
      grid.innerHTML = posts.slice(0, 6).map((p, i) => `
        <div class="blog-card" onclick="window.location.href='./posts/${p.slug}'">
          <div class="blog-thumb" style="background:${GRADIENTS[i % GRADIENTS.length]}">
            ${EMOJIS[i % EMOJIS.length]}
          </div>
          <div class="blog-body">
            <div class="blog-meta">
              <span class="blog-tag">${p.tags?.[0] || 'IA'}</span>
              <span class="blog-date">${p.date}</span>
            </div>
            <h3>${p.title}</h3>
            <p>${p.description}</p>
            <a href="./posts/${p.slug}" class="blog-read">Leer artículo →</a>
          </div>
        </div>
      `).join('');
    })
    .catch(() => {
      grid.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:1/-1">Pronto nuevos artículos ✨</p>';
    });
}

// ── CATEGORY & FILTERING ──
function catLabel(cat) {
  const m = {
    trabajo: '💼 Trabajo',
    marketing: '📣 Marketing',
    programacion: '💻 Programación',
    estudio: '📚 Estudio',
    personal: '❤️ Personal',
    emprendimiento: '🚀 Emprendimiento'
  };
  return m[cat] || cat;
}

function filterCategory(cat, btn) {
  currentFilter = cat;
  currentPage = 1;
  filteredPrompts = cat === 'todos' ? [...PROMPTS] : PROMPTS.filter(p => p.cat === cat);

  if (document.getElementById('search-input').value) {
    filteredPrompts = filteredPrompts.filter(p => matchSearch(p, document.getElementById('search-input').value));
  }

  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  renderPrompts();

  if (cat !== 'todos') {
    document.getElementById('posts').scrollIntoView({ behavior: 'smooth' });
  }
}

function filterFavs(btn) {
  currentPage = 1;
  filteredPrompts = PROMPTS.filter(p => getFavs().includes(p.id));
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderPrompts();
}

function searchPrompts(val) {
  currentPage = 1;
  const base = currentFilter === 'todos' ? PROMPTS : PROMPTS.filter(p => p.cat === currentFilter);
  filteredPrompts = val ? base.filter(p => matchSearch(p, val)) : [...base];
  renderPrompts();
}

function matchSearch(p, val) {
  const v = val.toLowerCase();
  return p.title.toLowerCase().includes(v) || p.desc.toLowerCase().includes(v) || p.text.toLowerCase().includes(v);
}

// ── PAGINATION ──
function updatePagination() {
  const total = Math.ceil(filteredPrompts.length / PER_PAGE);
  for (let i = 1; i <= 3; i++) {
    const btn = document.getElementById('page-' + i);
    if (!btn) continue;
    btn.style.display = i <= total ? '' : 'none';
    btn.classList.toggle('active', i === currentPage);
  }
}

function goPage(page) {
  currentPage = page;
  renderPrompts();
  document.getElementById('prompts-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function changePage(delta) {
  const total = Math.ceil(filteredPrompts.length / PER_PAGE);
  const newPage = currentPage + delta;
  if (newPage >= 1 && newPage <= total) {
    goPage(newPage);
  }
}

// ── COPY & TOAST ──
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function copyPrompt(id, btn) {
  const prompt = PROMPTS.find(p => p.id === id);
  if (!prompt) return;

  navigator.clipboard.writeText(prompt.text).then(() => {
    btn.classList.add('copied');
    btn.textContent = '✅ Copiado';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.textContent = '📋 Copiar';
    }, 2000);
    showToast('✅ ¡Prompt copiado!');
  });
}

// ── MODAL ──
function openModal(id) {
  const prompt = PROMPTS.find(p => p.id === id);
  if (!prompt) return;

  document.getElementById('modal-badge').className = `prompt-badge badge-${prompt.cat}`;
  document.getElementById('modal-badge').textContent = catLabel(prompt.cat);
  document.getElementById('modal-title').textContent = prompt.title;
  document.getElementById('modal-desc').textContent = prompt.desc;
  document.getElementById('modal-text').textContent = prompt.text;

  document.getElementById('modal').classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

function copyModal() {
  const text = document.getElementById('modal-text').textContent;
  navigator.clipboard.writeText(text).then(() => {
    showToast('✅ ¡Prompt copiado!');
    const btn = document.querySelector('.modal-copy-btn');
    btn.textContent = '✅ Copiado';
    setTimeout(() => {
      btn.textContent = '📋 Copiar prompt completo';
    }, 2000);
  });
}

// ── NEWSLETTER ──
function handleSubscribe(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.querySelector('input[name="email"]').value;
  
  if (email) {
    showToast('📧 ¡Gracias por suscribirte!');
    form.reset();
  }
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  renderPrompts();
  renderBlog();
});