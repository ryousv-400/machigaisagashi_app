import stickerData from "../public/kids/stamps/stamps.generated.json";

// シール帳のシール定義。
// public/kids/stamps/stamps.generated.json を生成元にして、通常版とキラキラ版を表示する。

export type StickerDef = {
  id: number;
  slug: string;
  title: string;
  src: string;
  shinySrc: string;
  fallbackEmoji: string;
  baseColor: string;
  width: number;
  height: number;
  alphaBounds?: [number, number, number, number] | null;
};

export const STICKERS = stickerData as StickerDef[];

export const TOTAL_STICKERS = STICKERS.length;

export function getSticker(id: number): StickerDef | undefined {
  return STICKERS.find((s) => s.id === id);
}

export function stickerImagePath(sticker: StickerDef, shiny = false): string {
  return shiny ? sticker.shinySrc : sticker.src;
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
