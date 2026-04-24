// シール帳のシール定義。
// Codex が生成した /public/kids/stamps/ の 30 種類を使用。
// 画像が欠けた場合のために fallbackEmoji も持たせる。

export type StickerDef = {
  id: number;
  slug: string;
  title: string;
  src: string;
  fallbackEmoji: string;
  baseColor: string;
};

export const STICKERS: StickerDef[] = [
  { id: 1,  slug: "stamp_01_rainbow_star",       title: "にじいろスター",       src: "/kids/stamps/stamp_01_rainbow_star.png",       fallbackEmoji: "⭐",  baseColor: "#fff4c2" },
  { id: 2,  slug: "stamp_02_heart_jewel",        title: "ハートジュエル",       src: "/kids/stamps/stamp_02_heart_jewel.png",        fallbackEmoji: "💎",  baseColor: "#ffd1e5" },
  { id: 3,  slug: "stamp_03_tiny_crown",         title: "ちいさなクラウン",     src: "/kids/stamps/stamp_03_tiny_crown.png",         fallbackEmoji: "👑",  baseColor: "#fff1b8" },
  { id: 4,  slug: "stamp_04_strawberry_cupcake", title: "いちごカップケーキ",   src: "/kids/stamps/stamp_04_strawberry_cupcake.png", fallbackEmoji: "🧁",  baseColor: "#ffe0ec" },
  { id: 5,  slug: "stamp_05_bunny_face",         title: "うさぎフェイス",       src: "/kids/stamps/stamp_05_bunny_face.png",         fallbackEmoji: "🐰",  baseColor: "#ffe3ef" },
  { id: 6,  slug: "stamp_06_crown_fish",         title: "おうかんフィッシュ",   src: "/kids/stamps/stamp_06_crown_fish.png",         fallbackEmoji: "🐟",  baseColor: "#dcecff" },
  { id: 7,  slug: "stamp_07_rainbow_train",      title: "にじいろトレイン",     src: "/kids/stamps/stamp_07_rainbow_train.png",      fallbackEmoji: "🚂",  baseColor: "#ffe8f4" },
  { id: 8,  slug: "stamp_08_smile_planet",       title: "スマイルプラネット",   src: "/kids/stamps/stamp_08_smile_planet.png",       fallbackEmoji: "🪐",  baseColor: "#e6dfff" },
  { id: 9,  slug: "stamp_09_music_drum",         title: "ミュージックドラム",   src: "/kids/stamps/stamp_09_music_drum.png",         fallbackEmoji: "🥁",  baseColor: "#ffe8b3" },
  { id: 10, slug: "stamp_10_rainbow_umbrella",   title: "にじいろアンブレラ",   src: "/kids/stamps/stamp_10_rainbow_umbrella.png",   fallbackEmoji: "☂️",  baseColor: "#ffe8f4" },
  { id: 11, slug: "stamp_11_teddy_heart",        title: "ハートテディ",         src: "/kids/stamps/stamp_11_teddy_heart.png",        fallbackEmoji: "🧸",  baseColor: "#f5dcb8" },
  { id: 12, slug: "stamp_12_tiny_dragon",        title: "ちびドラゴン",         src: "/kids/stamps/stamp_12_tiny_dragon.png",        fallbackEmoji: "🐉",  baseColor: "#dcf5d9" },
  { id: 13, slug: "stamp_13_flower_pinwheel",    title: "おはなかざぐるま",     src: "/kids/stamps/stamp_13_flower_pinwheel.png",    fallbackEmoji: "🌸",  baseColor: "#ffe0ee" },
  { id: 14, slug: "stamp_14_winged_ball",        title: "つばさボール",         src: "/kids/stamps/stamp_14_winged_ball.png",        fallbackEmoji: "⚾",  baseColor: "#fff7e0" },
  { id: 15, slug: "stamp_15_rainbow_rocket",     title: "にじいろロケット",     src: "/kids/stamps/stamp_15_rainbow_rocket.png",     fallbackEmoji: "🚀",  baseColor: "#e0f4ff" },
  { id: 16, slug: "stamp_16_treasure_chest",     title: "たからばこ",           src: "/kids/stamps/stamp_16_treasure_chest.png",     fallbackEmoji: "💰",  baseColor: "#f4d9b1" },
  { id: 17, slug: "stamp_17_ice_cream",          title: "アイスクリーム",       src: "/kids/stamps/stamp_17_ice_cream.png",          fallbackEmoji: "🍦",  baseColor: "#fff1e4" },
  { id: 18, slug: "stamp_18_rainbow_butterfly",  title: "にじいろバタフライ",   src: "/kids/stamps/stamp_18_rainbow_butterfly.png",  fallbackEmoji: "🦋",  baseColor: "#dcecff" },
  { id: 19, slug: "stamp_19_magic_wand",         title: "まほうのステッキ",     src: "/kids/stamps/stamp_19_magic_wand.png",         fallbackEmoji: "✨",  baseColor: "#f1e1ff" },
  { id: 20, slug: "stamp_20_gold_medal",         title: "きんメダル",           src: "/kids/stamps/stamp_20_gold_medal.png",         fallbackEmoji: "🏅",  baseColor: "#fff4c2" },
  { id: 21, slug: "stamp_21_rainbow_gem",        title: "にじいろジュエル",     src: "/kids/stamps/stamp_21_rainbow_gem.png",        fallbackEmoji: "💎",  baseColor: "#e0f4ff" },
  { id: 22, slug: "stamp_22_castle_tower",       title: "おしろタワー",         src: "/kids/stamps/stamp_22_castle_tower.png",       fallbackEmoji: "🏰",  baseColor: "#ffe0ec" },
  { id: 23, slug: "stamp_23_chocolate_donut",    title: "チョコドーナツ",       src: "/kids/stamps/stamp_23_chocolate_donut.png",    fallbackEmoji: "🍩",  baseColor: "#f4d9b1" },
  { id: 24, slug: "stamp_24_toy_car",            title: "おもちゃカー",         src: "/kids/stamps/stamp_24_toy_car.png",            fallbackEmoji: "🚗",  baseColor: "#ffe1cc" },
  { id: 25, slug: "stamp_25_pearl_shell",        title: "パールシェル",         src: "/kids/stamps/stamp_25_pearl_shell.png",        fallbackEmoji: "🐚",  baseColor: "#dcecff" },
  { id: 26, slug: "stamp_26_red_apple",          title: "りんごスマイル",       src: "/kids/stamps/stamp_26_red_apple.png",          fallbackEmoji: "🍎",  baseColor: "#ffdde0" },
  { id: 27, slug: "stamp_27_fluffy_cloud",       title: "ふわふわクラウド",     src: "/kids/stamps/stamp_27_fluffy_cloud.png",       fallbackEmoji: "☁️",  baseColor: "#e5f1ff" },
  { id: 28, slug: "stamp_28_crescent_moon",      title: "おつきさま",           src: "/kids/stamps/stamp_28_crescent_moon.png",      fallbackEmoji: "🌙",  baseColor: "#e6dfff" },
  { id: 29, slug: "stamp_29_lucky_clover",       title: "ラッキークローバー",   src: "/kids/stamps/stamp_29_lucky_clover.png",       fallbackEmoji: "🍀",  baseColor: "#dcf5d9" },
  { id: 30, slug: "stamp_30_dinosaur_egg",       title: "きょうりゅうエッグ",   src: "/kids/stamps/stamp_30_dinosaur_egg.png",       fallbackEmoji: "🥚",  baseColor: "#fff2c2" },
];

export const TOTAL_STICKERS = STICKERS.length;

export function getSticker(id: number): StickerDef | undefined {
  return STICKERS.find((s) => s.id === id);
}

export function stickerImagePath(sticker: StickerDef): string {
  return sticker.src;
}

export type OwnedSticker = {
  id: number;
  shiny: boolean;
  acquiredAt: number;
};

export type DrawResult =
  | { kind: "new"; sticker: StickerDef }
  | { kind: "shiny"; sticker: StickerDef }
  | { kind: "duplicate"; sticker: StickerDef };

/**
 * シールを1枚引く。
 * - 未所持があればそこからランダム (new)
 * - 全部所持済みなら未キラキラからランダム (shiny)
 * - 全部キラキラ済みならランダム (duplicate)
 */
export function drawSticker(owned: OwnedSticker[]): DrawResult {
  const ownedMap = new Map(owned.map((o) => [o.id, o]));
  const unowned = STICKERS.filter((s) => !ownedMap.has(s.id));

  if (unowned.length > 0) {
    const picked = unowned[Math.floor(Math.random() * unowned.length)];
    return { kind: "new", sticker: picked };
  }

  const notShiny = STICKERS.filter((s) => !ownedMap.get(s.id)?.shiny);
  if (notShiny.length > 0) {
    const picked = notShiny[Math.floor(Math.random() * notShiny.length)];
    return { kind: "shiny", sticker: picked };
  }

  const picked = STICKERS[Math.floor(Math.random() * STICKERS.length)];
  return { kind: "duplicate", sticker: picked };
}
