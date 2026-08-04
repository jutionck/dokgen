import sharp from "sharp";
import { readFile, mkdir } from "node:fs/promises";

const svg = await readFile("app/icon.svg", "utf8");
// maskable: hilangkan rounded corner — full-bleed biar aman saat di-mask platform
const svgMaskable = svg.replace('rx="14"', 'rx="0"');

await mkdir("public/icons", { recursive: true });

const jobs = [
  { name: "icon-192.png", size: 192, source: svg },
  { name: "icon-512.png", size: 512, source: svg },
  { name: "icon-maskable-512.png", size: 512, source: svgMaskable },
  { name: "apple-touch-icon.png", size: 180, source: svg },
];

for (const job of jobs) {
  await sharp(Buffer.from(job.source)).resize(job.size, job.size).png().toFile(`public/icons/${job.name}`);
  console.log(`✓ ${job.name} (${job.size}x${job.size})`);
}
