#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const args = process.argv.slice(2);

function usage() {
  console.error(
    "Usage: node scripts/find_diffs.mjs <left.png> <right.png> [--tolerance 2] [--min-pixels 16] [--json]",
  );
  process.exit(1);
}

if (args.length < 2) usage();

const leftPath = args[0];
const rightPath = args[1];
const toleranceIndex = args.indexOf("--tolerance");
const tolerance =
  toleranceIndex >= 0 && args[toleranceIndex + 1] ? Number(args[toleranceIndex + 1]) : 2;
const minPixelsIndex = args.indexOf("--min-pixels");
const minPixels =
  minPixelsIndex >= 0 && args[minPixelsIndex + 1] ? Number(args[minPixelsIndex + 1]) : 16;
const json = args.includes("--json");

if (!Number.isFinite(tolerance) || tolerance < 0) {
  console.error("Invalid --tolerance value.");
  process.exit(1);
}

if (!Number.isFinite(minPixels) || minPixels < 1) {
  console.error("Invalid --min-pixels value.");
  process.exit(1);
}

for (const file of [leftPath, rightPath]) {
  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    process.exit(1);
  }
}

const left = await sharp(leftPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const right = await sharp(rightPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

const { width, height, channels } = left.info;

if (width !== right.info.width || height !== right.info.height || channels !== right.info.channels) {
  console.error("Image dimensions or channels do not match.");
  process.exit(1);
}

const total = width * height;
const changed = new Uint8Array(total);
let changedPixels = 0;

for (let i = 0; i < total; i += 1) {
  const offset = i * channels;
  let isChanged = false;
  for (let c = 0; c < Math.min(channels, 4); c += 1) {
    if (Math.abs(left.data[offset + c] - right.data[offset + c]) > tolerance) {
      isChanged = true;
      break;
    }
  }
  if (isChanged) {
    changed[i] = 1;
    changedPixels += 1;
  }
}

const visited = new Uint8Array(total);
const clusters = [];
const queue = new Int32Array(total);
const neighbors = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];

for (let i = 0; i < total; i += 1) {
  if (!changed[i] || visited[i]) continue;

  let head = 0;
  let tail = 0;
  queue[tail] = i;
  tail += 1;
  visited[i] = 1;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let pixels = 0;

  while (head < tail) {
    const current = queue[head];
    head += 1;
    const x = current % width;
    const y = Math.floor(current / width);

    pixels += 1;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;

    for (const [dx, dy] of neighbors) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      const next = ny * width + nx;
      if (!changed[next] || visited[next]) continue;
      visited[next] = 1;
      queue[tail] = next;
      tail += 1;
    }
  }

  clusters.push({
    pixels,
    x: minX,
    y: minY,
    w: maxX - minX + 1,
    h: maxY - minY + 1,
    xPct: Math.round(((minX + (maxX - minX + 1) / 2) / width) * 1000) / 10,
    yPct: Math.round(((minY + (maxY - minY + 1) / 2) / height) * 1000) / 10,
    wPct: Math.round(((maxX - minX + 1) / width) * 1000) / 10,
    hPct: Math.round(((maxY - minY + 1) / height) * 1000) / 10,
  });
}

const rawClusterCount = clusters.length;
const ignoredSmallClusters = clusters.filter((cluster) => cluster.pixels < minPixels).length;
const visibleClusters = clusters
  .filter((cluster) => cluster.pixels >= minPixels)
  .sort((a, b) => b.pixels - a.pixels);

const result = {
  left: path.relative(process.cwd(), leftPath),
  right: path.relative(process.cwd(), rightPath),
  width,
  height,
  tolerance,
  minPixels,
  changedPixels,
  changedPct: Math.round((changedPixels / total) * 10000) / 100,
  rawClusterCount,
  ignoredSmallClusters,
  clusterCount: visibleClusters.length,
  clusters: visibleClusters,
};

if (json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`${result.left} <-> ${result.right}`);
  console.log(`size: ${width}x${height}, tolerance: ${tolerance}`);
  console.log(`changed pixels: ${changedPixels} (${result.changedPct}%)`);
  console.log(
    `clusters: ${visibleClusters.length} (ignored ${ignoredSmallClusters} tiny cluster(s) under ${minPixels}px)`,
  );
  visibleClusters.forEach((cluster, index) => {
    console.log(
      [
        `  ${index + 1}.`,
        `${cluster.pixels}px`,
        `bbox=${cluster.x},${cluster.y},${cluster.w},${cluster.h}`,
        `pct=center(${cluster.xPct},${cluster.yPct}) size(${cluster.wPct},${cluster.hPct})`,
      ].join(" "),
    );
  });
}
