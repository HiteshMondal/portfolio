import { build } from "esbuild";
import { writeFileSync } from "node:fs";
const r = await build({ entryPoints: ["src/data.ts"], bundle: true, write: false, format: "esm" });
const m = await import("data:text/javascript;base64," + Buffer.from(r.outputFiles[0].text).toString("base64"));
writeFileSync("src/data.json", JSON.stringify(m));
