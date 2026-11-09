# Hitesh Mondal: Technical Portfolio

A single-page portfolio built with **React 18 + TypeScript**, bundled with **esbuild** into one self-contained `dist/index.html` (no server, no database). It includes an animated hero, projects, achievements, an in-page **PDF resume viewer** and a working contact form.

## Quick view (no setup)

If you only want to see it, open the published link, or after building (below) open `dist/index.html` by double-clicking it.

## Run it locally

### Requirements

| Tool | Why | Check |
|---|---|---|
| Node.js 18+ and npm | build the site | `node -v` |
| `pdftoppm` (poppler-utils) | turns the PDFs in `resumes/` into viewer pages | `pdftoppm -v` |
| Python 3 + `reportlab` | only to regenerate the sample resume PDF | `python3 -c "import reportlab"` |

Install poppler:

- Ubuntu/Debian/WSL: `sudo apt install poppler-utils`
- macOS: `brew install poppler`
- Windows: `choco install poppler`, or use WSL

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Build the site (creates dist/index.html)
npm run build

# 3. View it
npm run preview        # then open http://localhost:8080
# or just open dist/index.html in your browser
```

Optional: `npm run typecheck` runs the TypeScript compiler (run it after a build, since the build generates two JSON files it imports).

## Edit your content

All text lives in **`src/data.ts`**: profile and links, summary, skills, experience, projects, achievements, education, certifications, languages and hobbies. Edit it, then run `npm run build` again.

- Skills keep this grouping: *Languages*, *Systems & Architecture*, *Technologies & Tools*.
- Layout and behaviour are in `src/main.tsx`; styles are in the `<style>` block of `index.html`.

## Resumes (PDF viewer)

Every PDF in the **`resumes/`** folder becomes a tab in the Resume section, with zoom and a **Download PDF** button. If there is only one PDF, no tabs are shown.

- **Add your own resume:** copy your PDF into `resumes/` (e.g. `resumes/Hitesh Mondal Resume - Custom.pdf`), then run `npm run build`. The tab label comes from the file name.
- **Regenerate the sample resume** from `src/data.ts`: `npm run resume`, then `npm run build`.
- **Remove a resume:** delete its PDF from `resumes/` and rebuild.

Note: the viewer shows PDF pages as images, so text on the site can't be selected. The downloaded PDF keeps real, selectable text.

## Contact form

There is no backend. Submitting the form opens the visitor's email app with a pre-filled message to the address in `src/data.ts`. The page also has direct email, copy-address, phone, LinkedIn, GitHub and LeetCode buttons.

## Project structure

```
.
├── index.html          # HTML shell + all CSS
├── src/
│   ├── main.tsx        # React app (components, animations, PDF viewer)
│   ├── data.ts         # your content (edit this)
│   ├── data.json       # generated, git-ignored
│   └── resumes.gen.json# generated, git-ignored
├── resumes/            # PDFs shown in the Resume section
├── gen.mjs             # data.ts -> data.json (used by the PDF script)
├── make_pdf.py         # builds the sample resume PDF
├── build.mjs           # rasterises PDFs + bundles everything into dist/index.html
└── tsconfig.json
```

## Deploy

`dist/index.html` is fully self-contained, so any static host works: GitHub Pages, Netlify, Vercel, Cloudflare Pages, or an S3 bucket. For GitHub Pages, publish the contents of `dist/`. Google Fonts load from the web; if they are blocked, the site falls back to system fonts.

## Troubleshooting

- **`pdftoppm: command not found`**: install poppler (see above). If `src/resumes.gen.json` already exists the build reuses it with a warning.
- **`Cannot find module './data.json'` or `./resumes.gen.json`** when running `typecheck`: run `npm run build` first.
- **Blank resume viewer**: make sure `resumes/` contains at least one `.pdf`, then rebuild.
- **Contact form does nothing**: your device has no default email app. Use the copy-address button instead.