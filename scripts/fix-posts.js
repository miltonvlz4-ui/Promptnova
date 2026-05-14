import fs from "fs";
import path from "path";

const CSS = `<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap" rel="stylesheet">
<style>
  :root{--bg:#0a0a0f;--bg2:#111118;--bg3:#18181f;--border:rgba(255,255,255,0.08);--accent:#7c6ff7;--accent2:#a89cff;--gold:#f4c84a;--text:#f0f0fa;--muted:#9090a8;}
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;font-size:16px;line-height:1.7;}
  h1,h2,h3,h4{font-family:'Syne',sans-serif;}
  a{color:var(--accent2);text-decoration:none;}
  header{background:rgba(10,10,15,0.85);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);padding:1rem 2rem;position:sticky;top:0;z-index:100;}
  header a{font-family:'Syne',sans-serif;font-weight:600;color:var(--accent2);font-size:0.95rem;}
  header a:hover{color:var(--text);}
  main.post{max-width:760px;margin:3rem auto;padding:0 1.5rem 4rem;}
  main.post h1{font-size:clamp(1.8rem,4vw,2.5rem);font-weight:800;line-height:1.2;margin-bottom:1rem;background:linear-gradient(135deg,var(--text),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
  .meta{font-size:0.85rem;color:var(--muted);margin-bottom:2.5rem;padding-bottom:1.5rem;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;}
  .tag{background:rgba(124,111,247,0.15);border:1px solid rgba(124,111,247,0.3);color:var(--accent2);padding:0.2rem 0.6rem;border-radius:100px;font-size:0.75rem;font-weight:500;}
  article h2{font-size:1.5rem;font-weight:700;margin:2.5rem 0 1rem;color:var(--text);}
  article h3{font-size:1.2rem;font-weight:600;margin:2rem 0 0.75rem;color:var(--accent2);}
  article p{margin-bottom:1.25rem;color:var(--text);line-height:1.8;}
  article ul,article ol{margin:1rem 0 1.5rem 1.5rem;color:var(--text);}
  article li{margin-bottom:0.5rem;line-height:1.7;}
  article blockquote{border-left:3px solid var(--accent);padding:1rem 1.5rem;margin:1.5rem 0;background:rgba(124,111,247,0.08);border-radius:0 8px 8px 0;color:var(--muted);font-style:italic;}
  article pre{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:1.25rem 1.5rem;margin:1.5rem 0;overflow-x:auto;}
  article code{font-family:'Courier New',monospace;font-size:0.875rem;color:var(--gold);line-height:1.6;}
  article p code{background:var(--bg3);padding:0.15rem 0.4rem;border-radius:4px;}
  footer{background:var(--bg2);border-top:1px solid var(--border);padding:2rem;text-align:center;font-size:0.85rem;color:var(--muted);}
  @media(max-width:768px){main.post{margin:1.5rem auto;}main.post h1{font-size:1.6rem;}}
</style>`;

const postsDir = path.join(process.cwd(), "posts");
const files = fs.readdirSync(postsDir).filter(f => f.endsWith(".html"));

let fixed = 0;
for (const file of files) {
  const filepath = path.join(postsDir, file);
  let html = fs.readFileSync(filepath, "utf8");

  // Saltar si ya tiene el estilo nuevo
  if (html.includes("font-family:'DM Sans'")) {
    console.log(`⏭️  Ya actualizado: ${file}`);
    continue;
  }

  // Reemplazar la línea del CSS viejo por el nuevo
  html = html.replace(/<link rel="stylesheet" href="\.\.\/style\.css">/, CSS);

  fs.writeFileSync(filepath, html, "utf8");
  console.log(`✅ Arreglado: ${file}`);
  fixed++;
}

console.log(`\n🎉 ${fixed} posts actualizados de ${files.length} totales`);
