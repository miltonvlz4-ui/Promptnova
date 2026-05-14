import fs from "fs";
import path from "path";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ─── Temas rotativos ──────────────────────────────────────────────────────────
// Personaliza esta lista con los temas de tu blog
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

// ─── Utilidades ───────────────────────────────────────────────────────────────
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

// ─── Llamada a OpenAI ─────────────────────────────────────────────────────────
async function generatePost(topic) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // Modelo más barato y disponible en tier gratuito
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

El campo "html" debe contener:
- Etiquetas h2, h3, p, ul, li, blockquote
- Al menos 3 ejemplos de prompts dentro de <pre><code>...</code></pre>
- Mínimo 500 palabras
- Sin estilos inline`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  const raw = data.choices[0].message.content.trim();

  // Limpiar posibles backticks que ChatGPT añade a veces
  const clean = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(clean);
}

// ─── Guardar post ─────────────────────────────────────────────────────────────
function savePost(data, topic) {
  const postsDir = path.join(process.cwd(), "posts");
  fs.mkdirSync(postsDir, { recursive: true });

  const date = today();
  const slug = slugify(data.title || topic);
  const filename = `${date}-${slug}.html`;
  const filepath = path.join(postsDir, filename);

  const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title} | PromptNova</title>
  <meta name="description" content="${data.description}">
  <link rel="stylesheet" href="../style.css">
</head>
<body>
  <header>
    <nav><a href="../index.html">← PromptNova</a></nav>
  </header>
  <main class="post">
    <h1>${data.title}</h1>
    <p class="meta">
      <time datetime="${date}">${date}</time> · 
      ${data.readingTime} min de lectura · 
      ${data.tags.map((t) => `<span class="tag">${t}</span>`).join(" ")}
    </p>
    ${data.html}
  </main>
  <footer>
    <p>© PromptNova ${new Date().getFullYear()}</p>
  </footer>
</body>
</html>`;

  fs.writeFileSync(filepath, fullHtml, "utf8");
  console.log(`✅ Post guardado: posts/${filename}`);

  // ─── Actualizar index.json ────────────────────────────────────────────────
  const indexPath = path.join(postsDir, "index.json");
  let index = [];

  if (fs.existsSync(indexPath)) {
    index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  }

  // Evitar duplicados si el workflow se lanza dos veces el mismo minuto
  const exists = index.some((p) => p.slug === filename);
  if (!exists) {
    index.unshift({
      slug: filename,
      title: data.title,
      description: data.description,
      date,
      tags: data.tags,
      readingTime: data.readingTime,
    });
  }

  // Mantener máximo 90 posts (≈1 mes)
  if (index.length > 90) index = index.slice(0, 90);

  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), "utf8");
  console.log(`📋 index.json actualizado — ${index.length} posts en total`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!OPENAI_API_KEY) {
    throw new Error("Falta la variable de entorno OPENAI_API_KEY");
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
