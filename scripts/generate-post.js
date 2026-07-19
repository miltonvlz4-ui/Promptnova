import fs from "fs";
import path from "path";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const TOPICS = [
  "Los mejores prompts para escribir emails profesionales con IA",
  "Cómo usar la IA para generar ideas de negocio en minutos",
  "Prompts avanzados para crear contenido viral en redes sociales",
  "Guía para dominar ChatGPT en tu trabajo diario",
  "Errores comunes al escribir prompts y cómo evitarlos",
  "Prompt engineering para developers: trucos que no conocías",
  "Cómo construir un asistente personal con ChatGPT y prompts",
  "Los prompts más creativos para diseñadores gráficos",
  "IA para SEO: prompts que posicionan tu contenido",
  "Automatiza tu negocio con prompts inteligentes",
  "Prompts para aprender cualquier cosa 10 veces más rápido",
  "Cómo escribir prompts que nunca fallan",
  "Los 10 prompts más usados por expertos en marketing",
  "Cómo usar ChatGPT para crear un curso online desde cero",
  "Prompts para generar imágenes perfectas con IA",
];

// ── CLASIFICACIÓN AUTOMÁTICA ──
// Mapeo de palabras clave → categoría
const CATEGORY_RULES = [
  {
    cat: "programacion",
    keywords: ["developer", "código", "codigo", "api", "software", "programar", "programación", "programacion", "developer", "script", "web", "app", "github", "función", "base de datos", "backend", "frontend"],
  },
  {
    cat: "marketing",
    keywords: ["marketing", "viral", "redes sociales", "instagram", "seo", "contenido", "publicidad", "anuncio", "campaña", "audiencia", "engagement", "copy", "copywriting", "tiktok", "youtube"],
  },
  {
    cat: "emprendimiento",
    keywords: ["negocio", "startup", "emprender", "empresa", "inversión", "inversion", "producto", "vender", "ventas", "cliente", "automatiza", "automatizar", "ingresos", "monetizar"],
  },
  {
    cat: "estudio",
    keywords: ["aprender", "aprendizaje", "estudiar", "estudio", "curso", "educación", "educacion", "enseñar", "profesor", "examen", "conocimiento", "habilidad", "idioma"],
  },
  {
    cat: "trabajo",
    keywords: ["trabajo", "email", "profesional", "oficina", "reunión", "reunion", "productividad", "carrera", "cv", "entrevista", "jefe", "empresa", "laboral", "informe", "presentación"],
  },
  {
    cat: "personal",
    keywords: ["personal", "hábito", "habito", "motivación", "motivacion", "creatividad", "bienestar", "salud", "mente", "meditación", "meditacion", "psicología", "psicologia", "felicidad", "coach", "vida"],
  },
];

function classifyPost(title, tags = []) {
  const text = `${title} ${tags.join(" ")}`.toLowerCase();

  // Contar coincidencias por categoría
  const scores = CATEGORY_RULES.map((rule) => ({
    cat: rule.cat,
    score: rule.keywords.filter((kw) => text.includes(kw)).length,
  }));

  // Ordenar por puntuación y coger la mayor
  scores.sort((a, b) => b.score - a.score);

  // Si no hay ninguna coincidencia clara, devolver 'general'
  return scores[0].score > 0 ? scores[0].cat : "general";
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function randomTopic() {
  return TOPICS[Math.floor(Math.random() * TOPICS.length)];
}

async function generatePost(topic) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 3000,
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content: `Eres el editor jefe de PromptNova, un blog en español especializado en 
prompt engineering e inteligencia artificial. Tu estilo es claro, práctico y ameno. 
Siempre incluyes ejemplos reales de prompts listos para copiar.
IMPORTANTE: Responde SOLO con JSON válido, sin markdown, sin backticks, sin texto extra.`,
        },
        {
          role: "user",
          content: `Escribe un artículo completo en español sobre: "${topic}"

Devuelve SOLO un objeto JSON con esta estructura exacta:
{
  "title": "Título atractivo del artículo (max 70 chars)",
  "description": "Meta descripción SEO (max 155 chars)",
  "tags": ["tag1", "tag2", "tag3"],
  "readingTime": 5,
  "html": "<article>...contenido completo en HTML semántico...</article>"
}

El campo html debe contener:
- Etiquetas h2, h3, p, ul, li, blockquote
- Al menos 3 ejemplos de prompts dentro de pre y code
- Mínimo 500 palabras
- Sin estilos inline`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  const raw = data.choices[0].message.content.trim();
  const clean = raw
    .replace(/^```json\s*/i, "")
    .replace(/```\s*$/i, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim();

  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No se encontró JSON válido en la respuesta");
  return JSON.parse(match[0]);
}

function savePost(data, topic) {
  const postsDir = path.join(process.cwd(), "posts");
  fs.mkdirSync(postsDir, { recursive: true });

  const date = today();
  const slug = slugify(data.title || topic);
  const filename = `${date}-${slug}.html`;
  const filepath = path.join(postsDir, filename);

  // Clasificar automáticamente la categoría
  const category = classifyPost(data.title, data.tags);
  console.log(`🏷️  Categoría detectada: ${category}`);

  const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <base href="/Promptnova/">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title} | PromptNova</title>
  <meta name="description" content="${data.description}">
  <meta property="og:title" content="${data.title} | PromptNova">
  <meta property="og:description" content="${data.description}">
  <meta property="og:type" content="article">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7965643620841539" crossorigin="anonymous"></script>
</head>
<body>
  <nav>
    <div class="nav-inner">
      <a href="./" class="logo">🪐 PromptNova</a>
      <ul class="nav-links">
        <li><a href="./">Inicio</a></li>
        <li><a href="./#posts">Prompts</a></li>
        <li><a href="./#categorias">Categorías</a></li>
        <li><a href="./#blog" class="active">Blog</a></li>
        <li><a href="./#sobre-mi">Sobre mí</a></li>
        <li><a href="privacidad.html">Privacidad</a></li>
      </ul>
      <a href="./#posts" class="nav-cta">✨ Explorar</a>
    </div>
  </nav>

  <main class="post-container">
    <div class="post-header">
      <a href="./" class="post-back">← Volver al inicio</a>
      <span class="post-tag">${data.tags[0] || "IA"}</span>
      <h1>${data.title}</h1>
      <p class="post-meta">
        <time datetime="${date}">${date}</time> · 
        ${data.readingTime} min de lectura · 
        ${data.tags.map((t) => `<span class="tag">${t}</span>`).join(" ")}
      </p>
    </div>

    <div class="post-content">
      ${data.html}
    </div>
  </main>

  <footer>
    <div class="footer-inner">
      <div class="footer-brand">
        <a href="./" class="logo">🪐 PromptNova</a>
        <p>Tu copiloto en el universo de la inteligencia artificial.</p>
      </div>
      <div class="footer-col">
        <h4>Explorar</h4>
        <ul>
          <li><a href="./#posts">Todos los prompts</a></li>
          <li><a href="./#blog">Blog</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Legal</h4>
        <ul>
          <li><a href="privacidad.html">Política de Privacidad</a></li>
          <li><a href="terminos.html">Términos de Uso</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© PromptNova ${new Date().getFullYear()} — Todos los derechos reservados.</span>
    </div>
  </footer>
</body>
</html>`;

  fs.writeFileSync(filepath, fullHtml, "utf8");
  console.log(`✅ Post guardado: posts/${filename}`);

  const indexPath = path.join(postsDir, "index.json");
  let index = [];

  if (fs.existsSync(indexPath)) {
    index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  }

  const exists = index.some((p) => p.slug === filename);
  if (!exists) {
    index.unshift({
      slug: filename,
      title: data.title,
      description: data.description,
      date,
      tags: data.tags,
      readingTime: data.readingTime,
      category,                          // ← campo nuevo añadido
    });
  }

  if (index.length > 90) index = index.slice(0, 90);
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), "utf8");
  console.log(`📋 index.json actualizado — ${index.length} posts en total`);
}

async function main() {
  if (!GROQ_API_KEY) {
    throw new Error("Falta la variable de entorno GROQ_API_KEY");
  }

  const topic = randomTopic();
  console.log(`🤖 Generando post sobre: "${topic}"`);

  const data = await generatePost(topic);
  savePost(data, topic);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
