import { cpSync, existsSync } from "fs";

const src = "dist/server/__vite_rsc_assets_manifest.js";
const dest = "dist/slowlytype/__vite_rsc_assets_manifest.js";

if (!existsSync(src)) {
  console.error(`copy-manifest: source not found: ${src}`);
  process.exit(1);
}

cpSync(src, dest);
console.log(`copy-manifest: copied ${src} → ${dest}`);
