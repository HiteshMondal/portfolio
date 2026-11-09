import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, basename } from "node:path";

// 1) Resumes: every PDF in ./resumes becomes a tab (rasterised pages + the PDF itself for download).
try {
  const out = [];
  for (const f of readdirSync("resumes").filter((x) => x.toLowerCase().endsWith(".pdf")).sort()) {
    const dir = mkdtempSync(join(tmpdir(), "res-"));
    execFileSync("pdftoppm", ["-jpeg", "-jpegopt", "quality=85", "-r", "115", join("resumes", f), join(dir, "p")]);
    const pages = readdirSync(dir).sort().map((p) => "data:image/jpeg;base64," + readFileSync(join(dir, p)).toString("base64"));
    const name = basename(f, ".pdf");
    out.push({ label: name.replace(/[_-]/g, " "), filename: f, pdf: readFileSync(join("resumes", f)).toString("base64"), pages });
  }
  writeFileSync("src/resumes.gen.json", JSON.stringify(out));
} catch (e) {
  console.error("\nResume step failed: " + e.message + "\nInstall poppler-utils (provides pdftoppm) and make sure resumes/ contains a .pdf, then run the build again.");
  process.exit(1);
}

// 2) Bundle TypeScript + React into one self-contained HTML file.
const r = await build({ entryPoints: ["src/main.tsx"], bundle: true, minify: true, write: false, format: "iife", jsx: "automatic", target: "es2020", define: { "process.env.NODE_ENV": '"production"' } });
const js = r.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
mkdirSync("dist", { recursive: true });
writeFileSync("dist/index.html", readFileSync("index.html", "utf8").replace("/*APP*/", () => js));
