import fs from "fs";
import path from "path";

const postsDir = path.join(process.cwd(), "posts");
const files = fs.readdirSync(postsDir).filter(f => f.endsWith(".html"));

let fixed = 0;

for (const file of files) {
  const filepath = path.join(postsDir, file);
  let html = fs.readFileSync(filepath, "utf8");

  // Saltar si ya tiene la ruta absoluta correcta
  if (html.includes('href="/styles.css"')) {
    console.log(`⏭️  Ya actualizado: ${file}`);
    continue;
  }

  // 1. Eliminar cualquier bloque <style> inline que fix-posts.js haya metido antes
  html = html.replace(/<style>[\s\S]*?<\/style>\s*/g, "");

  // 2. Eliminar links de Google Fonts duplicados que fix-posts.js haya metido
  html = html.replace(/<link[^>]*fonts\.googleapis\.com[^>]*>\s*/g, "");

  // 3. Reemplazar cualquier variante de ruta CSS antigua por la correcta
  html = html
    .replace(/<link rel="stylesheet" href="\.\.\/style\.css">/g, "")
    .replace(/<link rel="stylesheet" href="\.\.\/styles\.css">/g, "")
    .replace(/<link rel="stylesheet" href="\.\/styles\.css">/g, "");

  // 4. Insertar en <head> las fuentes + el link correcto al CSS
  const newLinks = `  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7965643620841539" crossorigin="anonymous"></script>`;

  html = html.replace("</head>", `${newLinks}\n</head>`);

  // 5. Reemplazar nav/header antiguo por el nav completo de PromptNova
  const oldHeader = /<header>[\s\S]*?<\/header>/;
  const newNav = `<nav>
    <div class="nav-inner">
      <a href="/" class="logo">🪐 PromptNova</a>
      <ul class="nav-links">
        <li><a href="/">Inicio</a></li>
        <li><a href="/#posts">Prompts</a></li>
        <li><a href="/#categorias">Categorías</a></li>
        <li><a href="/#blog" class="active">Blog</a></li>
        <li><a href="/#sobre-mi">Sobre mí</a></li>
        <li><a href="/privacidad.html">Privacidad</a></li>
      </ul>
      <a href="/#posts" class="nav-cta">✨ Explorar</a>
    </div>
  </nav>`;

  if (oldHeader.test(html)) {
    html = html.replace(oldHeader, newNav);
  }

  // 6. Actualizar footer antiguo
  const oldFooter = /<footer>[\s\S]*?<\/footer>/;
  const newFooter = `<footer>
    <div class="footer-inner">
      <div class="footer-brand">
        <a href="/" class="logo">🪐 PromptNova</a>
        <p>Tu copiloto en el universo de la inteligencia artificial.</p>
      </div>
      <div class="footer-col">
        <h4>Explorar</h4>
        <ul>
          <li><a href="/#posts">Todos los prompts</a></li>
          <li><a href="/#blog">Blog</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Legal</h4>
        <ul>
          <li><a href="/privacidad.html">Política de Privacidad</a></li>
          <li><a href="/terminos.html">Términos de Uso</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© PromptNova ${new Date().getFullYear()} — Todos los derechos reservados.</span>
    </div>
  </footer>`;

  if (oldFooter.test(html)) {
    html = html.replace(oldFooter, newFooter);
  }

  fs.writeFileSync(filepath, html, "utf8");
  console.log(`✅ Arreglado: ${file}`);
  fixed++;
}

console.log(`\n🎉 ${fixed} posts actualizados de ${files.length} totales`);
