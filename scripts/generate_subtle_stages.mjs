#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = "public/kids/subtle";
const SIZE = 1024;

const stages = [
  {
    no: "01",
    level: 101,
    title: "まほうの もり",
    readAloud: "まほうの もり！ ちっちゃな ちがいを みつけてね！",
    render: renderForest,
    mistakes: [
      { id: 1, label: "ふえた きのこ", x: 25, y: 72, w: 8, h: 8 },
      { id: 2, label: "はっぱの いろ", x: 15, y: 26, w: 16, h: 16 },
      { id: 3, label: "へった ことり", x: 67, y: 23, w: 8, h: 8 },
      { id: 4, label: "しっぽの かたち", x: 74, y: 69, w: 10, h: 8 },
    ],
  },
  {
    no: "02",
    level: 102,
    title: "パンやさんの あさ",
    readAloud: "パンやさんの あさ！ ちっちゃな ちがいを みつけてね！",
    render: renderBakery,
    mistakes: [
      { id: 1, label: "ふえた クロワッサン", x: 46, y: 35, w: 8, h: 8 },
      { id: 2, label: "かんばんの いろ", x: 74, y: 30, w: 8, h: 8 },
      { id: 3, label: "うごいた うえきばち", x: 27, y: 73, w: 10, h: 8 },
      { id: 4, label: "ふえた ことり", x: 68, y: 21, w: 8, h: 8 },
    ],
  },
  {
    no: "03",
    level: 103,
    title: "うみの ちかの まち",
    readAloud: "うみの ちかの まち！ ちっちゃな ちがいを みつけてね！",
    render: renderUndersea,
    mistakes: [
      { id: 1, label: "へった さかな", x: 69, y: 42, w: 8, h: 8 },
      { id: 2, label: "やねの いろ", x: 48, y: 39, w: 10, h: 8 },
      { id: 3, label: "たこの あし", x: 26, y: 69, w: 8, h: 8 },
      { id: 4, label: "ふえた あわ", x: 80, y: 63, w: 8, h: 8 },
      { id: 5, label: "うごいた かいそう", x: 54, y: 76, w: 9, h: 9 },
    ],
  },
];

function svgWrap(body, palette = "forest") {
  const paper = palette === "sea" ? "#d8f3f1" : palette === "bakery" ? "#fff3d6" : "#e8f4d8";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="0.45" result="blur"/>
      <feOffset dx="0" dy="1" result="off"/>
      <feMerge><feMergeNode in="off"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="wash" x="-8%" y="-8%" width="116%" height="116%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="7" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.1" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <pattern id="paper" width="72" height="72" patternUnits="userSpaceOnUse">
      <rect width="72" height="72" fill="${paper}"/>
      <path d="M0 18 C18 12 36 24 72 16 M0 52 C24 60 46 42 72 50" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="3"/>
      <circle cx="14" cy="12" r="1.5" fill="#7a6d59" opacity="0.08"/>
      <circle cx="51" cy="40" r="1.2" fill="#7a6d59" opacity="0.07"/>
    </pattern>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#paper)"/>
  <g filter="url(#wash)">${body}</g>
</svg>`;
}

function blob(points, fill, stroke = "#4a3f55", sw = 6, extra = "") {
  return `<path d="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
}

function ellipse(cx, cy, rx, ry, fill, stroke = "#4a3f55", sw = 6, extra = "") {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`;
}

function circle(cx, cy, r, fill, stroke = "#4a3f55", sw = 5, extra = "") {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`;
}

function bird(x, y, scale = 1, fill = "#6fb6d7") {
  return `<g transform="translate(${x} ${y}) scale(${scale})" filter="url(#soft)">
    ${ellipse(0, 0, 31, 20, fill)}
    ${blob("M-7 -2 C-37 -28 -55 -10 -37 15 C-28 26 -15 17 -7 -2 Z", "#86c8df", "#4a3f55", 5)}
    ${circle(23, -7, 4, "#2f2f3a", "#2f2f3a", 1)}
    ${blob("M31 -1 L50 8 L31 16 Z", "#edb860", "#4a3f55", 4)}
  </g>`;
}

function mushroom(x, y, scale = 1, cap = "#c85f65") {
  return `<g transform="translate(${x} ${y}) scale(${scale})" filter="url(#soft)">
    ${blob("M-22 8 C-10 -34 31 -32 42 8 C27 2 -2 5 -22 8 Z", cap, "#4a3f55", 5)}
    ${blob("M-7 5 C-15 33 -7 53 18 51 C35 48 33 27 22 4 Z", "#fff1cf", "#4a3f55", 5)}
    ${circle(-1, -7, 5, "#fff6de", "none", 0)}
    ${circle(18, -11, 6, "#fff6de", "none", 0)}
  </g>`;
}

function flower(x, y, fill = "#e790b6", scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M0 22 C-3 12 -2 3 2 -9" fill="none" stroke="#6d9b55" stroke-width="5" stroke-linecap="round"/>
    ${circle(-13, -8, 9, fill, "#4a3f55", 3)}
    ${circle(12, -10, 9, fill, "#4a3f55", 3)}
    ${circle(0, -21, 9, fill, "#4a3f55", 3)}
    ${circle(0, -9, 7, "#f8d66d", "#4a3f55", 3)}
  </g>`;
}

function renderForest(side) {
  const right = side === "right";
  const leaves = right ? "#c6c66c" : "#7fb96f";
  const secondBird = right ? "" : bird(690, 232, 0.92);
  const extraMushroom = right ? mushroom(274, 742, 0.82, "#cc6c75") : "";
  const tail = right
    ? blob("M723 702 C793 657 843 691 822 738 C810 765 772 742 793 717 C775 724 744 724 723 702 Z", "#e8934f", "#4a3f55", 7)
    : blob("M723 702 C779 655 838 680 832 724 C827 755 779 748 789 716 C772 728 746 724 723 702 Z", "#e8934f", "#4a3f55", 7);

  const body = `
    <path d="M130 814 C262 762 356 744 466 784 C596 832 734 790 904 738 L1024 1024 L0 1024 Z" fill="#82bf76" opacity="0.9"/>
    <path d="M8 660 C164 604 312 626 456 676 C600 726 760 714 1018 596 L1024 1024 L0 1024 Z" fill="#9fd08a" opacity="0.7"/>
    <path d="M0 802 C165 768 246 762 390 790 C562 824 676 824 1024 746" fill="none" stroke="#87c9cf" stroke-width="84" stroke-linecap="round"/>
    <path d="M0 782 C166 750 252 746 400 773 C560 804 684 801 1024 724" fill="none" stroke="#d5f3ef" stroke-width="22" stroke-linecap="round" opacity="0.75"/>
    ${blob("M28 666 C42 488 42 280 102 104 C132 38 216 46 232 116 C256 224 222 462 236 682 Z", "#8d6a4c", "#4a3f55", 8)}
    ${blob("M28 238 C60 90 220 64 316 162 C372 220 338 346 226 372 C110 400 18 340 28 238 Z", leaves, "#4a3f55", 7)}
    ${blob("M714 670 C740 482 734 276 798 148 C830 84 916 84 940 154 C974 268 930 506 956 694 Z", "#806046", "#4a3f55", 8)}
    ${blob("M724 190 C790 66 940 76 994 194 C1032 279 968 382 850 376 C746 370 684 280 724 190 Z", "#79ad66", "#4a3f55", 7)}
    ${ellipse(855, 300, 58, 72, "#5a3e31", "#4a3f55", 7)}
    ${ellipse(857, 301, 36, 46, "#b48a63", "#4a3f55", 5)}
    ${circle(842, 288, 8, "#fff7dd", "#4a3f55", 3)}${circle(872, 288, 8, "#fff7dd", "#4a3f55", 3)}
    ${circle(842, 289, 3, "#2f2f3a", "none", 0)}${circle(872, 289, 3, "#2f2f3a", "none", 0)}
    ${blob("M854 301 L864 314 L844 314 Z", "#efbc57", "#4a3f55", 3)}
    <path d="M456 95 C422 220 389 330 350 462" stroke="#fff8cd" stroke-width="32" stroke-linecap="round" opacity="0.32"/>
    <path d="M574 90 C536 218 510 330 460 478" stroke="#fff8cd" stroke-width="24" stroke-linecap="round" opacity="0.26"/>
    ${bird(600, 190, 0.95)}${secondBird}
    ${ellipse(383, 610, 86, 114, "#9a6f4e")}
    ${circle(347, 495, 29, "#9a6f4e")}${circle(421, 500, 29, "#9a6f4e")}
    ${circle(353, 565, 6, "#2f2f3a", "none", 0)}${circle(409, 565, 6, "#2f2f3a", "none", 0)}
    <path d="M373 590 C390 606 405 590 405 590" fill="none" stroke="#4a3f55" stroke-width="5" stroke-linecap="round"/>
    ${ellipse(226, 676, 58, 72, "#fbf6e9")}
    ${ellipse(197, 586, 18, 65, "#fbf6e9")}${ellipse(251, 586, 18, 65, "#fbf6e9")}
    ${ellipse(197, 591, 8, 42, "#eeb4be", "#4a3f55", 3)}${ellipse(251, 591, 8, 42, "#eeb4be", "#4a3f55", 3)}
    ${circle(208, 659, 4, "#2f2f3a", "none", 0)}${circle(241, 659, 4, "#2f2f3a", "none", 0)}
    ${blob("M168 734 L203 681 L241 738 Z", "#df93ca", "#4a3f55", 5)}
    ${ellipse(536, 638, 48, 66, "#f1a8bf")}
    ${ellipse(512, 562, 16, 58, "#f1a8bf")}${ellipse(556, 562, 16, 58, "#f1a8bf")}
    ${circle(523, 624, 4, "#2f2f3a", "none", 0)}${circle(551, 624, 4, "#2f2f3a", "none", 0)}
    <g filter="url(#soft)">${tail}${ellipse(706, 706, 70, 52, "#df7e3f")}${circle(672, 670, 34, "#df7e3f")}${blob("M646 647 L658 600 L682 646 Z", "#df7e3f", "#4a3f55", 5)}${blob("M681 645 L710 604 L712 661 Z", "#df7e3f", "#4a3f55", 5)}${circle(663, 666, 4, "#2f2f3a", "none", 0)}${circle(688, 670, 4, "#2f2f3a", "none", 0)}</g>
    ${mushroom(205, 744, 0.9)}${extraMushroom}
    ${mushroom(626, 790, 0.78, "#dd8fa1")}
    ${flower(146, 806, "#e9a3c8", 0.8)}${flower(489, 760, "#f1b775", 0.72)}${flower(860, 772, "#dca3c9", 0.78)}
    ${blob("M171 701 L202 650 L235 704 L202 724 Z", "#dda5df", "#8c6d9e", 4, 'opacity="0.8"')}
    ${blob("M872 830 L924 790 L958 844 L908 878 Z", "#b7d9e6", "#7a9eaf", 4, 'opacity="0.75"')}
    ${blob("M764 782 L854 770 L862 818 L771 832 Z", "#d8b57a", "#4a3f55", 5)}
  `;
  return svgWrap(body, "forest");
}

function croissant(x, y, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})" filter="url(#soft)">
    ${blob("M-45 5 C-32 -36 38 -37 52 4 C25 -13 -16 -12 -45 5 Z", "#d99043", "#4a3f55", 5)}
    <path d="M-17 -20 C-5 -6 -5 10 -18 22 M17 -20 C5 -6 6 10 20 21" fill="none" stroke="#b87338" stroke-width="5" stroke-linecap="round"/>
  </g>`;
}

function bread(x, y, fill = "#dba059", scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">${blob("M-42 18 C-50 -23 -23 -49 3 -28 C25 -55 64 -24 45 20 Z", fill, "#4a3f55", 5)}</g>`;
}

function renderBakery(side) {
  const right = side === "right";
  const signColor = right ? "#b65c5a" : "#7b6b8b";
  const potX = right ? 294 : 250;
  const outsideBirds = right ? `${bird(760, 164, 0.65)}${bird(833, 205, 0.58)}${bird(690, 220, 0.55)}` : `${bird(760, 164, 0.65)}${bird(833, 205, 0.58)}`;
  const extraCroissant = right ? croissant(472, 356, 0.82) : "";

  const body = `
    <rect x="102" y="194" width="820" height="650" rx="34" fill="#f7d9a9" stroke="#4a3f55" stroke-width="8"/>
    <path d="M74 236 L512 92 L950 236 Z" fill="#d98268" stroke="#4a3f55" stroke-width="8"/>
    <path d="M146 258 H878" stroke="#b46459" stroke-width="22" stroke-linecap="round" opacity="0.45"/>
    <rect x="660" y="252" width="192" height="106" rx="22" fill="#fff1c4" stroke="#4a3f55" stroke-width="7"/>
    <rect x="704" y="296" width="104" height="24" rx="12" fill="${signColor}" stroke="none"/>
    <rect x="622" y="394" width="212" height="168" rx="28" fill="#d8eef2" stroke="#4a3f55" stroke-width="7"/>
    <path d="M728 398 V559 M625 478 H831" stroke="#4a3f55" stroke-width="6" opacity="0.55"/>
    ${outsideBirds}
    <rect x="180" y="294" width="398" height="300" rx="22" fill="#b9885d" stroke="#4a3f55" stroke-width="7"/>
    <path d="M198 396 H560 M198 494 H560" stroke="#6e4e3d" stroke-width="8" stroke-linecap="round"/>
    ${croissant(288, 358, 0.86)}${croissant(382, 360, 0.8)}${extraCroissant}
    ${bread(280, 462, "#df9e4f", 0.88)}${bread(408, 462, "#c98948", 0.82)}
    ${ellipse(504, 456, 45, 28, "#e7b456")}${ellipse(504, 548, 48, 24, "#bb7d42")}
    ${ellipse(548, 672, 96, 126, "#d28c65")}
    ${circle(507, 560, 38, "#d28c65")}${circle(589, 560, 38, "#d28c65")}
    ${circle(520, 635, 6, "#2f2f3a", "none", 0)}${circle(574, 635, 6, "#2f2f3a", "none", 0)}
    <path d="M539 664 C557 680 576 662 576 662" fill="none" stroke="#4a3f55" stroke-width="5" stroke-linecap="round"/>
    <path d="M474 721 C530 758 596 758 658 720" fill="none" stroke="#f0e1bd" stroke-width="34" stroke-linecap="round"/>
    <g transform="translate(${potX} 746)" filter="url(#soft)">
      ${blob("M-50 -6 H50 L33 80 H-34 Z", "#b86c54", "#4a3f55", 6)}
      <path d="M-7 -11 C-53 -54 -27 -95 2 -36 C13 -94 56 -76 23 -23 C68 -48 85 -5 31 5" fill="none" stroke="#6fa867" stroke-width="15" stroke-linecap="round"/>
    </g>
    ${flower(726, 736, "#de88a3", 0.8)}${flower(806, 732, "#f3c35c", 0.75)}
    <path d="M112 844 H922 L984 1024 H38 Z" fill="#c7d7bb" opacity="0.72"/>
  `;
  return svgWrap(body, "bakery");
}

function fish(x, y, scale = 1, fill = "#e8a24d") {
  return `<g transform="translate(${x} ${y}) scale(${scale})" filter="url(#soft)">
    ${ellipse(0, 0, 45, 25, fill)}
    ${blob("M-42 0 L-78 -28 L-72 0 L-78 28 Z", fill, "#4a3f55", 5)}
    ${circle(23, -7, 4, "#2f2f3a", "none", 0)}
  </g>`;
}

function bubbleGroup(x, y, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})" opacity="0.8" filter="url(#soft)">
    ${circle(0, 0, 20, "#dff8fb", "#77b8c4", 4)}
    ${circle(24, -24, 16, "#dff8fb", "#77b8c4", 4)}
    ${circle(43, -5, 18, "#dff8fb", "#77b8c4", 4)}
  </g>`;
}

function renderUndersea(side) {
  const right = side === "right";
  const roof = right ? "#db8953" : "#d66e76";
  const fifthFish = right ? "" : fish(706, 432, 0.68, "#6fb6d7");
  const bubbles = right ? bubbleGroup(812, 654, 0.82) : "";
  const weedX = right ? 558 : 522;
  const leg = right
    ? '<path d="M22 53 C62 100 54 142 10 132" fill="none" stroke="#d9849b" stroke-width="31" stroke-linecap="round"/>'
    : '<path d="M22 53 C60 90 36 124 -8 108" fill="none" stroke="#d9849b" stroke-width="31" stroke-linecap="round"/>';

  const body = `
    <path d="M0 804 C180 760 290 790 426 824 C612 868 784 810 1024 784 L1024 1024 L0 1024 Z" fill="#8ac9b8"/>
    <path d="M0 180 C156 142 304 174 464 128 C640 76 778 144 1024 100" fill="none" stroke="#ffffff" stroke-width="28" opacity="0.28"/>
    <path d="M60 318 C220 270 345 326 500 282 C670 234 840 284 1008 240" fill="none" stroke="#ffffff" stroke-width="22" opacity="0.22"/>
    ${fish(190, 320, 0.62, "#f2b86c")}${fish(514, 266, 0.72, "#e89cb3")}${fish(784, 318, 0.63, "#ecd06d")}${fish(612, 590, 0.6, "#9ccf7b")}${fifthFish}
    <g transform="translate(502 474)" filter="url(#soft)">
      ${blob("M-126 84 C-106 -72 108 -74 130 86 Z", "#f0d49a", "#4a3f55", 7)}
      ${blob("M-134 -9 C-72 -112 70 -116 137 -11 C72 -35 -72 -35 -134 -9 Z", roof, "#4a3f55", 7)}
      ${ellipse(0, 70, 34, 48, "#8fc8d7", "#4a3f55", 6)}
      ${circle(-64, 28, 28, "#cdeff1", "#4a3f55", 5)}${circle(66, 30, 27, "#cdeff1", "#4a3f55", 5)}
    </g>
    <g transform="translate(250 662)" filter="url(#soft)">
      ${leg}
      <path d="M196 49 C242 88 214 132 170 117" fill="none" stroke="#d9849b" stroke-width="31" stroke-linecap="round"/>
      <path d="M104 72 C124 124 86 154 49 125" fill="none" stroke="#d9849b" stroke-width="31" stroke-linecap="round"/>
      <path d="M20 49 C-31 83 -10 127 32 116" fill="none" stroke="#d9849b" stroke-width="31" stroke-linecap="round"/>
      ${ellipse(98, 0, 108, 86, "#d9849b")}
      ${circle(62, -16, 8, "#2f2f3a", "none", 0)}${circle(130, -16, 8, "#2f2f3a", "none", 0)}
      <path d="M78 20 C100 42 124 18 124 18" fill="none" stroke="#4a3f55" stroke-width="6" stroke-linecap="round"/>
    </g>
    <g transform="translate(${weedX} 786)" filter="url(#soft)">
      <path d="M0 104 C-24 44 -22 -4 -2 -72 M22 104 C8 45 31 -6 66 -70 M-24 104 C-66 51 -52 3 -44 -54" fill="none" stroke="#548f6c" stroke-width="22" stroke-linecap="round"/>
    </g>
    <g transform="translate(762 784)" filter="url(#soft)">
      ${blob("M-72 66 C-42 -62 72 -65 98 66 Z", "#ed956d", "#4a3f55", 6)}
      ${circle(-33, 40, 11, "#f3d584", "#4a3f55", 3)}${circle(15, 20, 13, "#f3d584", "#4a3f55", 3)}${circle(60, 48, 10, "#f3d584", "#4a3f55", 3)}
    </g>
    ${bubbleGroup(104, 196, 0.72)}${bubbleGroup(884, 384, 0.64)}${bubbles}
    ${circle(134, 842, 42, "#edcdb8", "#4a3f55", 5)}${blob("M130 842 C158 816 196 834 190 868 C166 872 148 862 130 842 Z", "#f3dfcf", "#4a3f55", 5)}
  `;
  return svgWrap(body, "sea");
}

await fs.mkdir(OUT_DIR, { recursive: true });

const metadata = [];

for (const stage of stages) {
  const leftFile = path.join(OUT_DIR, `stage${stage.no}_left.png`);
  const rightFile = path.join(OUT_DIR, `stage${stage.no}_right.png`);

  await sharp(Buffer.from(stage.render("left"))).png().toFile(leftFile);
  await sharp(Buffer.from(stage.render("right"))).png().toFile(rightFile);

  metadata.push({
    level: stage.level,
    tier: "subtle",
    title: stage.title,
    readAloud: stage.readAloud,
    leftImg: `/kids/subtle/stage${stage.no}_left.png`,
    rightImg: `/kids/subtle/stage${stage.no}_right.png`,
    mistakes: stage.mistakes,
  });
}

await fs.writeFile(
  path.join(OUT_DIR, "stages.generated.json"),
  `${JSON.stringify(metadata, null, 2)}\n`,
);

console.log(`Generated ${stages.length} subtle stages in ${OUT_DIR}`);
