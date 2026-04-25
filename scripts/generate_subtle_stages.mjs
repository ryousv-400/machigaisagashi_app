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
      { id: 1, label: "ふえた きのこ", x: 28, y: 74, w: 8, h: 8 },
      { id: 2, label: "はっぱの いろ", x: 18, y: 24, w: 32, h: 28 },
      { id: 3, label: "へった ことり", x: 68, y: 23, w: 9, h: 8 },
      { id: 4, label: "しっぽの かたち", x: 79, y: 70, w: 10, h: 8 },
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
      { id: 2, label: "かんばんの いろ", x: 74, y: 30, w: 10, h: 8 },
      { id: 3, label: "うごいた うえきばち", x: 28, y: 73, w: 18, h: 18 },
      { id: 4, label: "ふえた ことり", x: 68, y: 22, w: 8, h: 8 },
    ],
  },
  {
    no: "03",
    level: 103,
    title: "うみの ちかの まち",
    readAloud: "うみの ちかの まち！ ちっちゃな ちがいを みつけてね！",
    render: renderUndersea,
    mistakes: [
      { id: 1, label: "へった さかな", x: 68, y: 42, w: 9, h: 8 },
      { id: 2, label: "やねの いろ", x: 49, y: 41, w: 25, h: 8 },
      { id: 3, label: "たこの あし", x: 27, y: 76, w: 9, h: 9 },
      { id: 4, label: "ふえた あわ", x: 80, y: 63, w: 8, h: 8 },
      { id: 5, label: "うごいた かいそう", x: 53, y: 78, w: 18, h: 20 },
    ],
  },
  {
    no: "04",
    level: 104,
    title: "おへやの ぬいぐるみ",
    readAloud: "おへやの ぬいぐるみ！ ちっちゃな ちがいを みつけてね！",
    render: renderRoom,
    mistakes: [
      { id: 1, label: "ふえた つみき", x: 72, y: 73, w: 8, h: 8 },
      { id: 2, label: "カーテンの いろ", x: 14, y: 29, w: 10, h: 34 },
      { id: 3, label: "へった ほし", x: 86, y: 42, w: 8, h: 8 },
      { id: 4, label: "リボンの かたち", x: 49, y: 58, w: 18, h: 8 },
    ],
  },
  {
    no: "05",
    level: 105,
    title: "こうえんの ひる",
    readAloud: "こうえんの ひる！ ちっちゃな ちがいを みつけてね！",
    render: renderPark,
    mistakes: [
      { id: 1, label: "ふえた ふうせん", x: 79, y: 31, w: 8, h: 22 },
      { id: 2, label: "すべりだいの いろ", x: 47, y: 47, w: 25, h: 32 },
      { id: 3, label: "へった はな", x: 21, y: 78, w: 8, h: 8 },
      { id: 4, label: "いぬの しっぽ", x: 74, y: 71, w: 8, h: 8 },
    ],
  },
  {
    no: "06",
    level: 106,
    title: "よぞらの ぼうけん",
    readAloud: "よぞらの ぼうけん！ ちっちゃな ちがいを みつけてね！",
    render: renderNight,
    mistakes: [
      { id: 1, label: "へった ほし", x: 24, y: 24, w: 8, h: 8 },
      { id: 2, label: "つきの ぼうし", x: 74, y: 18, w: 14, h: 8 },
      { id: 3, label: "ロケットの はね", x: 52, y: 71, w: 10, h: 9 },
      { id: 4, label: "ふえた くも", x: 76, y: 78, w: 12, h: 8 },
    ],
  },
  {
    no: "07",
    level: 107,
    title: "ちいさな のりもの",
    readAloud: "ちいさな のりもの！ ちっちゃな ちがいを みつけてね！",
    render: renderVehicles,
    mistakes: [
      { id: 1, label: "でんしゃの まど", x: 52, y: 53, w: 9, h: 8 },
      { id: 2, label: "しんごうの いろ", x: 18, y: 37, w: 8, h: 10 },
      { id: 3, label: "ふえた くも", x: 78, y: 18, w: 10, h: 8 },
      { id: 4, label: "バスの タイヤ", x: 75, y: 73, w: 8, h: 8 },
    ],
  },
  {
    no: "08",
    level: 108,
    title: "おかしの テーブル",
    readAloud: "おかしの テーブル！ ちっちゃな ちがいを みつけてね！",
    render: renderSweets,
    mistakes: [
      { id: 1, label: "ふえた クッキー", x: 24, y: 61, w: 8, h: 8 },
      { id: 2, label: "クリームの いろ", x: 52, y: 37, w: 18, h: 10 },
      { id: 3, label: "スプーンの むき", x: 77, y: 67, w: 9, h: 8 },
      { id: 4, label: "いちごの かたち", x: 48, y: 31, w: 8, h: 8 },
    ],
  },
  {
    no: "09",
    level: 109,
    title: "ひみつの はなぞの",
    readAloud: "ひみつの はなぞの！ ちっちゃな ちがいを みつけてね！",
    render: renderGarden,
    mistakes: [
      { id: 1, label: "ふえた はな", x: 75, y: 69, w: 8, h: 8 },
      { id: 2, label: "じょうろの いろ", x: 28, y: 58, w: 12, h: 8 },
      { id: 3, label: "へった ちょう", x: 66, y: 25, w: 8, h: 8 },
      { id: 4, label: "かたつむりの から", x: 46, y: 76, w: 9, h: 8 },
    ],
  },
  {
    no: "10",
    level: 110,
    title: "おんがくの へや",
    readAloud: "おんがくの へや！ ちっちゃな ちがいを みつけてね！",
    render: renderMusic,
    mistakes: [
      { id: 1, label: "ふえた おんぷ", x: 78, y: 24, w: 8, h: 8 },
      { id: 2, label: "たいこの いろ", x: 30, y: 69, w: 18, h: 18 },
      { id: 3, label: "へった けんばん", x: 54, y: 48, w: 8, h: 8 },
      { id: 4, label: "ねこの しっぽ", x: 81, y: 70, w: 9, h: 8 },
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

function star(x, y, scale = 1, fill = "#f5d66d") {
  return `<g transform="translate(${x} ${y}) scale(${scale})" filter="url(#soft)">
    ${blob("M0 -38 L11 -11 L40 -10 L17 8 L25 36 L0 20 L-25 36 L-17 8 L-40 -10 L-11 -11 Z", fill, "#4a3f55", 5)}
  </g>`;
}

function cloud(x, y, scale = 1, fill = "#f5fbf7") {
  return `<g transform="translate(${x} ${y}) scale(${scale})" filter="url(#soft)">
    ${ellipse(-34, 10, 42, 28, fill, "#4a3f55", 5)}
    ${ellipse(7, -4, 52, 36, fill, "#4a3f55", 5)}
    ${ellipse(54, 12, 42, 28, fill, "#4a3f55", 5)}
    <rect x="-62" y="5" width="142" height="38" rx="19" fill="${fill}" stroke="#4a3f55" stroke-width="5"/>
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

function renderRoom(side) {
  const right = side === "right";
  const curtain = right ? "#d58a82" : "#8fb5d7";
  const roomStar = right ? "" : star(878, 426, 0.58, "#f1cf63");
  const extraBlock = right
    ? '<rect x="716" y="728" width="76" height="58" rx="10" fill="#9ecb86" stroke="#4a3f55" stroke-width="6"/>'
    : "";
  const bow = right
    ? `${blob("M486 590 C448 556 410 589 430 626 C458 626 475 612 486 590 Z", "#dc7fa8", "#4a3f55", 5)}${blob("M514 590 C550 548 596 582 572 626 C542 626 526 611 514 590 Z", "#dc7fa8", "#4a3f55", 5)}`
    : `${blob("M488 590 C452 562 414 586 434 620 C462 625 476 610 488 590 Z", "#dc7fa8", "#4a3f55", 5)}${blob("M512 590 C548 562 586 586 566 620 C538 625 524 610 512 590 Z", "#dc7fa8", "#4a3f55", 5)}`;

  const body = `
    <rect x="0" y="0" width="1024" height="720" fill="#f4dfc8" opacity="0.65"/>
    <path d="M0 742 C170 708 322 725 512 752 C694 778 850 742 1024 716 L1024 1024 L0 1024 Z" fill="#c8d9b7"/>
    <rect x="132" y="128" width="260" height="250" rx="26" fill="#d9eef3" stroke="#4a3f55" stroke-width="7"/>
    <path d="M262 132 V374 M136 252 H388" stroke="#4a3f55" stroke-width="6" opacity="0.55"/>
    <path d="M122 118 C130 260 128 346 104 462 C152 450 194 392 190 298 C188 232 170 160 122 118 Z" fill="${curtain}" stroke="#4a3f55" stroke-width="7"/>
    <path d="M402 118 C394 260 396 346 420 462 C372 450 330 392 334 298 C336 232 354 160 402 118 Z" fill="#f0b4c5" stroke="#4a3f55" stroke-width="7"/>
    ${cloud(256, 216, 0.45, "#f8fbff")}
    ${star(710, 156, 0.5, "#f1cf63")}
    <rect x="604" y="160" width="236" height="172" rx="22" fill="#f5e3a7" stroke="#4a3f55" stroke-width="7"/>
    <path d="M650 230 C700 196 746 268 806 224" fill="none" stroke="#b4856b" stroke-width="9" stroke-linecap="round"/>
    ${roomStar}
    <g filter="url(#soft)">
      ${ellipse(500, 632, 116, 148, "#b98568")}
      ${circle(438, 504, 40, "#b98568")}${circle(564, 504, 40, "#b98568")}
      ${circle(466, 606, 7, "#2f2f3a", "none", 0)}${circle(536, 606, 7, "#2f2f3a", "none", 0)}
      ${ellipse(502, 642, 36, 25, "#e6b898", "#4a3f55", 4)}
      <path d="M480 682 C502 704 528 682 528 682" fill="none" stroke="#4a3f55" stroke-width="6" stroke-linecap="round"/>
      ${bow}
      ${circle(501, 590, 12, "#eab8c8", "#4a3f55", 4)}
    </g>
    <rect x="172" y="740" width="92" height="66" rx="10" fill="#e3b458" stroke="#4a3f55" stroke-width="6"/>
    <rect x="278" y="716" width="74" height="88" rx="12" fill="#8fc2d5" stroke="#4a3f55" stroke-width="6"/>
    <rect x="612" y="738" width="86" height="66" rx="10" fill="#df8c78" stroke="#4a3f55" stroke-width="6"/>
    ${extraBlock}
    ${ellipse(228, 626, 94, 52, "#eed08a", "#4a3f55", 6)}
    ${ellipse(816, 658, 96, 42, "#d69bc2", "#4a3f55", 6)}
  `;
  return svgWrap(body, "bakery");
}

function renderPark(side) {
  const right = side === "right";
  const slideColor = right ? "#83b9c9" : "#e49468";
  const extraBalloon = right ? '<path d="M804 284 C806 352 780 372 786 430" fill="none" stroke="#6f6a6a" stroke-width="4"/>' + ellipse(804, 248, 34, 48, "#d989b4") : "";
  const leftFlower = right ? "" : flower(214, 808, "#f0c25d", 0.72);
  const dogTail = right
    ? '<path d="M718 718 C790 682 796 742 760 750" fill="none" stroke="#b98255" stroke-width="22" stroke-linecap="round"/>'
    : '<path d="M718 718 C778 676 802 716 770 740" fill="none" stroke="#b98255" stroke-width="22" stroke-linecap="round"/>';

  const body = `
    <path d="M0 580 C190 532 332 560 512 594 C690 628 836 586 1024 548 L1024 1024 L0 1024 Z" fill="#9bcf80"/>
    <path d="M0 862 C196 822 344 826 492 856 C668 892 826 868 1024 834" fill="none" stroke="#d8e9ba" stroke-width="54" stroke-linecap="round"/>
    ${cloud(186, 166, 0.72)}${cloud(548, 110, 0.55)}
    <g filter="url(#soft)">
      <path d="M306 352 H520 L426 638 H206 Z" fill="#e9c46a" stroke="#4a3f55" stroke-width="8"/>
      <path d="M386 350 L566 604" fill="none" stroke="${slideColor}" stroke-width="72" stroke-linecap="round"/>
      <path d="M386 350 L566 604" fill="none" stroke="#4a3f55" stroke-width="8" stroke-linecap="round"/>
      <rect x="248" y="626" width="196" height="82" rx="18" fill="#e7c58c" stroke="#4a3f55" stroke-width="7"/>
    </g>
    <g filter="url(#soft)">
      <path d="M728 726 C736 794 652 816 608 762 C570 714 610 650 670 656 C700 658 722 682 728 726 Z" fill="#b98255" stroke="#4a3f55" stroke-width="7"/>
      ${dogTail}
      ${circle(620, 646, 30, "#b98255")}${circle(666, 642, 28, "#b98255")}
      ${circle(642, 704, 5, "#2f2f3a", "none", 0)}${circle(690, 704, 5, "#2f2f3a", "none", 0)}
      <path d="M658 734 C678 748 698 732 698 732" fill="none" stroke="#4a3f55" stroke-width="5" stroke-linecap="round"/>
    </g>
    <path d="M760 300 C750 370 766 394 752 454" fill="none" stroke="#6f6a6a" stroke-width="4"/>
    <path d="M842 300 C830 370 838 410 820 466" fill="none" stroke="#6f6a6a" stroke-width="4"/>
    ${ellipse(760, 252, 35, 50, "#f1cf63")}${ellipse(842, 250, 35, 50, "#83b9c9")}${extraBalloon}
    ${leftFlower}${flower(274, 824, "#e49bb6", 0.7)}${flower(826, 808, "#eebf59", 0.75)}
    ${mushroom(126, 754, 0.65, "#dc7a75")}
  `;
  return svgWrap(body, "forest");
}

function renderNight(side) {
  const right = side === "right";
  const missingStar = right ? "" : star(244, 248, 0.56, "#f2d66a");
  const hat = right ? "#d68b69" : "#8eb0d2";
  const fin = right
    ? blob("M-2 78 L74 148 L-12 158 Z", "#e58c72", "#4a3f55", 6)
    : blob("M-2 78 L62 120 L-2 158 Z", "#e58c72", "#4a3f55", 6);
  const extraCloud = right ? cloud(778, 798, 0.62, "#e9edf3") : "";

  const body = `
    <rect x="0" y="0" width="1024" height="1024" fill="#9bb4d3" opacity="0.42"/>
    <path d="M0 792 C190 746 360 780 512 812 C692 850 854 806 1024 774 L1024 1024 L0 1024 Z" fill="#b7caa1" opacity="0.72"/>
    ${missingStar}${star(380, 158, 0.45, "#f2d66a")}${star(614, 236, 0.5, "#f2d66a")}${star(828, 424, 0.44, "#f2d66a")}${star(164, 466, 0.42, "#f2d66a")}
    <g filter="url(#soft)">
      ${circle(738, 264, 78, "#f4df8a", "#4a3f55", 7)}
      ${circle(770, 238, 70, "#9bb4d3", "none", 0)}
      ${blob("M682 198 C724 134 784 144 826 204 C770 190 728 190 682 198 Z", hat, "#4a3f55", 6)}
    </g>
    ${cloud(210, 730, 0.7, "#e9edf3")}${cloud(570, 166, 0.44, "#e9edf3")}${extraCloud}
    <g transform="translate(500 604)" filter="url(#soft)">
      ${blob("M0 -152 C82 -86 82 56 0 150 C-82 56 -82 -86 0 -152 Z", "#f3efe2", "#4a3f55", 8)}
      ${circle(0, -46, 42, "#8fc6d6", "#4a3f55", 6)}
      ${blob("M-48 56 L-126 130 L-42 112 Z", "#83b6c9", "#4a3f55", 6)}
      ${fin}
      ${blob("M-28 140 C-6 186 4 186 28 140 Z", "#f0c15e", "#4a3f55", 5)}
    </g>
    ${ellipse(226, 596, 54, 42, "#e2a0bd")}${circle(204, 580, 8, "#fff8dd", "#4a3f55", 3)}
    ${ellipse(848, 612, 58, 42, "#9dc078")}${circle(824, 596, 8, "#fff8dd", "#4a3f55", 3)}
  `;
  return svgWrap(body, "sea");
}

function renderVehicles(side) {
  const right = side === "right";
  const extraWindow = right ? '<rect x="512" y="512" width="58" height="52" rx="8" fill="#dff0f3" stroke="#4a3f55" stroke-width="5"/>' : "";
  const signal = right ? "#d9b85d" : "#81b96d";
  const extraCloud = right ? cloud(800, 184, 0.52) : "";
  const tire = right ? "#6f5972" : "#333641";

  const body = `
    <path d="M0 668 C172 628 340 656 506 688 C692 724 856 682 1024 640 L1024 1024 L0 1024 Z" fill="#bfd0b3"/>
    <path d="M0 792 H1024 V1024 H0 Z" fill="#8c9aa0"/>
    <path d="M0 840 H1024" stroke="#f4e4a5" stroke-width="14" stroke-dasharray="72 52"/>
    ${cloud(224, 194, 0.62)}${extraCloud}
    <g filter="url(#soft)">
      <rect x="288" y="444" width="346" height="178" rx="24" fill="#e9b665" stroke="#4a3f55" stroke-width="8"/>
      <rect x="318" y="512" width="58" height="52" rx="8" fill="#dff0f3" stroke="#4a3f55" stroke-width="5"/>
      <rect x="414" y="512" width="58" height="52" rx="8" fill="#dff0f3" stroke="#4a3f55" stroke-width="5"/>
      ${extraWindow}
      ${circle(356, 626, 28, "#353844", "#4a3f55", 5)}${circle(564, 626, 28, "#353844", "#4a3f55", 5)}
    </g>
    <g filter="url(#soft)">
      <rect x="642" y="642" width="230" height="116" rx="24" fill="#85bdd0" stroke="#4a3f55" stroke-width="7"/>
      <path d="M684 642 L728 584 H820 C850 588 868 612 872 642 Z" fill="#85bdd0" stroke="#4a3f55" stroke-width="7"/>
      <rect x="714" y="604" width="54" height="38" rx="8" fill="#dff0f3" stroke="#4a3f55" stroke-width="5"/>
      ${circle(704, 760, 27, "#333641", "#4a3f55", 5)}${circle(812, 760, 27, tire, "#4a3f55", 5)}
    </g>
    <g filter="url(#soft)">
      <path d="M176 280 V642" stroke="#78604c" stroke-width="18" stroke-linecap="round"/>
      <rect x="128" y="286" width="96" height="156" rx="28" fill="#4f504e" stroke="#4a3f55" stroke-width="7"/>
      ${circle(176, 330, 20, "#d96d65", "#4a3f55", 4)}
      ${circle(176, 386, 20, signal, "#4a3f55", 4)}
    </g>
    ${flower(156, 706, "#e7a0c2", 0.72)}${flower(926, 710, "#eec15d", 0.7)}
  `;
  return svgWrap(body, "forest");
}

function cookie(x, y, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})" filter="url(#soft)">
    ${circle(0, 0, 36, "#c98a54", "#4a3f55", 5)}
    ${circle(-13, -9, 4, "#6f4d3b", "none", 0)}${circle(12, -12, 4, "#6f4d3b", "none", 0)}${circle(7, 13, 4, "#6f4d3b", "none", 0)}
  </g>`;
}

function renderSweets(side) {
  const right = side === "right";
  const extraCookie = right ? cookie(246, 618, 0.78) : "";
  const cream = right ? "#dca2bf" : "#f7e5b6";
  const spoon = right
    ? '<path d="M746 694 C808 634 842 618 874 594" fill="none" stroke="#9b8d83" stroke-width="15" stroke-linecap="round"/><ellipse cx="884" cy="588" rx="26" ry="14" fill="#c6bab0" stroke="#4a3f55" stroke-width="5" transform="rotate(-28 884 588)"/>'
    : '<path d="M746 694 C812 654 844 648 884 642" fill="none" stroke="#9b8d83" stroke-width="15" stroke-linecap="round"/><ellipse cx="896" cy="640" rx="26" ry="14" fill="#c6bab0" stroke="#4a3f55" stroke-width="5" transform="rotate(-8 896 640)"/>';
  const strawberry = right
    ? blob("M468 304 C438 254 500 220 528 282 C544 250 590 264 574 314 C554 366 486 364 468 304 Z", "#d95f65", "#4a3f55", 5)
    : blob("M468 304 C444 256 502 236 528 284 C548 248 588 270 570 316 C548 358 488 358 468 304 Z", "#d95f65", "#4a3f55", 5);

  const body = `
    <path d="M76 642 C250 584 406 596 548 636 C718 684 846 650 980 610 L1024 1024 L0 1024 L0 690 Z" fill="#d7b98a"/>
    <ellipse cx="512" cy="666" rx="404" ry="142" fill="#e7c99d" stroke="#4a3f55" stroke-width="8"/>
    <g filter="url(#soft)">
      <rect x="382" y="380" width="236" height="164" rx="28" fill="#e5a766" stroke="#4a3f55" stroke-width="7"/>
      <path d="M386 392 C452 328 552 332 614 394" fill="${cream}" stroke="#4a3f55" stroke-width="7"/>
      ${strawberry}
      ${circle(506, 300, 5, "#fff2d4", "none", 0)}${circle(536, 318, 5, "#fff2d4", "none", 0)}
    </g>
    ${cookie(176, 606, 0.82)}${cookie(304, 666, 0.74)}${extraCookie}
    ${spoon}
    <g filter="url(#soft)">
      ${ellipse(710, 512, 76, 52, "#f3d7b4", "#4a3f55", 6)}
      <path d="M642 508 C622 410 746 392 778 496" fill="none" stroke="#d989a7" stroke-width="20" stroke-linecap="round"/>
    </g>
    ${flower(134, 778, "#de88a3", 0.65)}${flower(890, 786, "#f1c25f", 0.65)}
  `;
  return svgWrap(body, "bakery");
}

function butterfly(x, y, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})" filter="url(#soft)">
    ${ellipse(-22, 0, 24, 34, "#d795be", "#4a3f55", 4)}
    ${ellipse(22, 0, 24, 34, "#8fc2d5", "#4a3f55", 4)}
    <path d="M0 -26 V28" stroke="#4a3f55" stroke-width="6" stroke-linecap="round"/>
  </g>`;
}

function renderGarden(side) {
  const right = side === "right";
  const can = right ? "#82b7c6" : "#87ad6d";
  const butterflyOne = right ? "" : butterfly(676, 254, 0.78);
  const extraFlower = right ? flower(770, 708, "#e58cab", 0.74) : "";
  const shellLine = right
    ? '<path d="M450 762 C506 714 556 770 512 816 C480 848 424 820 444 780 C458 752 496 760 486 790" fill="none" stroke="#8f6d87" stroke-width="9" stroke-linecap="round"/>'
    : '<path d="M450 762 C496 718 548 758 524 806 C502 850 424 824 444 780 C456 756 492 758 486 790" fill="none" stroke="#8f6d87" stroke-width="9" stroke-linecap="round"/>';

  const body = `
    <path d="M0 660 C170 610 336 630 520 668 C704 706 862 668 1024 628 L1024 1024 L0 1024 Z" fill="#9ccf7a"/>
    <path d="M56 838 C220 802 350 816 510 842 C700 874 826 850 988 812" fill="none" stroke="#d9e8b7" stroke-width="50" stroke-linecap="round"/>
    ${cloud(244, 156, 0.6)}${cloud(812, 134, 0.5)}
    ${butterflyOne}${butterfly(578, 194, 0.58)}
    <g filter="url(#soft)">
      <path d="M218 548 H340 C368 550 384 576 368 602 L330 666 H196 L162 604 C148 576 174 550 218 548 Z" fill="${can}" stroke="#4a3f55" stroke-width="7"/>
      <path d="M338 570 C424 530 438 622 356 622" fill="none" stroke="#4a3f55" stroke-width="13" stroke-linecap="round"/>
      <path d="M176 548 L126 504" stroke="#4a3f55" stroke-width="13" stroke-linecap="round"/>
    </g>
    ${flower(206, 744, "#e6a0bf", 0.8)}${flower(286, 794, "#f0c360", 0.78)}${flower(686, 768, "#d495bf", 0.76)}${extraFlower}
    <g filter="url(#soft)">
      ${ellipse(520, 806, 86, 42, "#d69b77", "#4a3f55", 6)}
      ${circle(470, 772, 64, "#c795bc", "#4a3f55", 6)}
      ${shellLine}
      ${circle(584, 784, 7, "#2f2f3a", "none", 0)}
    </g>
    ${mushroom(850, 790, 0.62, "#d06d78")}
  `;
  return svgWrap(body, "forest");
}

function musicNote(x, y, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})" filter="url(#soft)">
    <path d="M0 -54 V26" stroke="#4a3f55" stroke-width="9" stroke-linecap="round"/>
    <path d="M0 -52 C34 -30 48 -36 72 -18" fill="none" stroke="#4a3f55" stroke-width="9" stroke-linecap="round"/>
    ${ellipse(-13, 34, 22, 16, "#4a3f55", "#4a3f55", 1)}
  </g>`;
}

function renderMusic(side) {
  const right = side === "right";
  const extraNote = right ? musicNote(800, 250, 0.72) : "";
  const drum = right ? "#8fb9d2" : "#d89073";
  const missingKey = right ? "" : '<rect x="540" y="482" width="32" height="76" fill="#2f2f3a"/>';
  const tail = right
    ? '<path d="M780 720 C850 660 884 716 836 748" fill="none" stroke="#c58b68" stroke-width="22" stroke-linecap="round"/>'
    : '<path d="M780 720 C832 666 876 694 852 732" fill="none" stroke="#c58b68" stroke-width="22" stroke-linecap="round"/>';

  const body = `
    <rect x="0" y="0" width="1024" height="704" fill="#ead6c8" opacity="0.62"/>
    <path d="M0 718 C176 680 342 706 516 732 C690 760 858 720 1024 690 L1024 1024 L0 1024 Z" fill="#bdd0bb"/>
    ${musicNote(224, 226, 0.65)}${musicNote(658, 178, 0.58)}${extraNote}
    <g filter="url(#soft)">
      <rect x="350" y="430" width="276" height="154" rx="18" fill="#b88361" stroke="#4a3f55" stroke-width="8"/>
      <rect x="378" y="470" width="222" height="92" rx="8" fill="#fff3d6" stroke="#4a3f55" stroke-width="6"/>
      <rect x="408" y="482" width="32" height="76" fill="#2f2f3a"/>
      <rect x="474" y="482" width="32" height="76" fill="#2f2f3a"/>
      ${missingKey}
      <path d="M386 584 V668 M594 584 V668" stroke="#4a3f55" stroke-width="13" stroke-linecap="round"/>
    </g>
    <g filter="url(#soft)">
      ${ellipse(308, 690, 92, 50, drum, "#4a3f55", 7)}
      <rect x="216" y="690" width="184" height="118" rx="28" fill="${drum}" stroke="#4a3f55" stroke-width="7"/>
      ${ellipse(308, 808, 92, 42, "#f4ddb3", "#4a3f55", 6)}
      <path d="M210 600 L318 660 M400 598 L312 660" stroke="#8d6c52" stroke-width="11" stroke-linecap="round"/>
    </g>
    <g filter="url(#soft)">
      ${ellipse(744, 734, 74, 64, "#c58b68")}
      ${circle(704, 682, 32, "#c58b68")}${circle(746, 678, 30, "#c58b68")}
      ${tail}
      ${circle(716, 724, 5, "#2f2f3a", "none", 0)}${circle(758, 724, 5, "#2f2f3a", "none", 0)}
      <path d="M730 752 C748 766 766 750 766 750" fill="none" stroke="#4a3f55" stroke-width="5" stroke-linecap="round"/>
    </g>
    <g filter="url(#soft)">
      <rect x="136" y="430" width="132" height="36" rx="18" fill="#e6b358" stroke="#4a3f55" stroke-width="6" transform="rotate(-18 202 448)"/>
      <rect x="154" y="472" width="132" height="36" rx="18" fill="#87b98a" stroke="#4a3f55" stroke-width="6" transform="rotate(-18 220 490)"/>
    </g>
  `;
  return svgWrap(body, "bakery");
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
