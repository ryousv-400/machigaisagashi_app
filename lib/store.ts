// ゲーム状態管理。Zustand を使って軽量に一元管理。
// 永続データ（スタンプ帳・累計・お名前）は localStorage に自動保存する。

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { GameMode } from "./modes";
import { getLevelsForMode } from "./modes";
import type { OwnedSticker, DrawResult } from "./stickers";
import { drawSticker } from "./stickers";

type Progress = {
  mode: GameMode;
  levels: number[];       // そのモードで遊ぶステージ番号の順序
  currentIndex: number;   // levels の何番目を今遊んでいるか
  foundCount: number;     // そのステージで見つけた間違いの数
  totalFound: number;     // このセッションで累計見つけた数
};

// アルバムページに配置されたシール 1 枚分
export type AlbumPlacement = {
  uid: string;       // ユニーク識別子
  stickerId: number; // どのシールを貼ったか
  xPct: number;      // 位置 0-100
  yPct: number;
  scale: number;     // 大きさ 0.6 - 1.6 (将来拡張用、MVP では 1.0 固定)
  rotation: number;  // 回転 -30..30 度
  zIndex: number;    // 重ね順（大きいほど手前）
};

// ページ数（MVP は 3 ページ）
export const ALBUM_PAGE_COUNT = 3;

type PersistState = {
  // ずっと残る: クリアしたことのあるステージ番号
  clearedLevels: number[];
  // ずっと残る: 累計で見つけた間違いの数
  totalFoundAllTime: number;
  // ずっと残る: プレイヤーの名前（未設定なら null）
  playerName: string | null;
  // ずっと残る: 所持シール一覧
  ownedStickers: OwnedSticker[];
  // ずっと残る: じぶんのシール帳の貼り付けデータ。インデックス = ページ番号 (0-based)
  albumPages: AlbumPlacement[][];
};

type GameStore = PersistState & {
  // セッション状態（永続化しない）
  progress: Progress | null;

  // セッション操作
  startGame: (mode: GameMode) => void;
  startFreePlay: (level: number) => void;
  markFound: () => void;
  resetFoundForNextStage: () => void;
  advanceStage: () => void;
  reset: () => void;

  // 永続データ操作
  addClearedLevel: (level: number) => void;
  setPlayerName: (name: string | null) => void;
  resetStamps: () => void;
  // シール帳（ガチャ）
  drawAndAddSticker: () => DrawResult;
  resetStickers: () => void;

  // じぶんのシール帳（自由貼り付け）
  addPlacement: (page: number, placement: Omit<AlbumPlacement, "uid" | "zIndex">) => void;
  updatePlacement: (page: number, uid: string, patch: Partial<AlbumPlacement>) => void;
  removePlacement: (page: number, uid: string) => void;
  clearAlbumPage: (page: number) => void;
};

const initialProgress = (mode: GameMode, levels?: number[]): Progress => ({
  mode,
  levels: levels ?? getLevelsForMode(mode),
  currentIndex: 0,
  foundCount: 0,
  totalFound: 0,
});

type PersistedShape = PersistState;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // --- 永続データ初期値 ---
      clearedLevels: [],
      totalFoundAllTime: 0,
      playerName: null,
      ownedStickers: [],
      albumPages: Array.from({ length: ALBUM_PAGE_COUNT }, () => [] as AlbumPlacement[]),

      // --- セッション初期値 ---
      progress: null,

      // --- セッション操作 ---
      startGame: (mode) => set({ progress: initialProgress(mode) }),
      startFreePlay: (level) => set({ progress: initialProgress("ten", [level]) }),

      markFound: () =>
        set((state) => {
          if (!state.progress) return {};
          return {
            progress: {
              ...state.progress,
              foundCount: state.progress.foundCount + 1,
              totalFound: state.progress.totalFound + 1,
            },
            totalFoundAllTime: state.totalFoundAllTime + 1,
          };
        }),

      resetFoundForNextStage: () =>
        set((state) => {
          if (!state.progress) return {};
          return { progress: { ...state.progress, foundCount: 0 } };
        }),

      advanceStage: () =>
        set((state) => {
          if (!state.progress) return {};
          return {
            progress: {
              ...state.progress,
              currentIndex: state.progress.currentIndex + 1,
              foundCount: 0,
            },
          };
        }),

      reset: () => set({ progress: null }),

      // --- 永続データ操作 ---
      addClearedLevel: (level) =>
        set((state) => {
          if (state.clearedLevels.includes(level)) return {};
          return { clearedLevels: [...state.clearedLevels, level].sort((a, b) => a - b) };
        }),

      setPlayerName: (name) => set({ playerName: name }),

      resetStamps: () => set({ clearedLevels: [], totalFoundAllTime: 0 }),

      drawAndAddSticker: () => {
        const current = get().ownedStickers;
        const result = drawSticker(current);
        const now = Date.now();
        if (result.kind === "new") {
          set({
            ownedStickers: [
              ...current,
              { id: result.sticker.id, shiny: false, acquiredAt: now },
            ],
          });
        } else if (result.kind === "shiny") {
          set({
            ownedStickers: current.map((o) =>
              o.id === result.sticker.id ? { ...o, shiny: true, acquiredAt: now } : o,
            ),
          });
        }
        // duplicate は何も変えない（ダブったことだけ通知）
        return result;
      },

      resetStickers: () => set({ ownedStickers: [] }),

      addPlacement: (page, placement) =>
        set((state) => {
          const pages = ensurePages(state.albumPages);
          if (page < 0 || page >= pages.length) return {};
          const maxZ = pages[page].reduce((m, p) => Math.max(m, p.zIndex), 0);
          const uid = `p${page}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const newOne: AlbumPlacement = { ...placement, uid, zIndex: maxZ + 1 };
          const next = pages.map((p, i) => (i === page ? [...p, newOne] : p));
          return { albumPages: next };
        }),

      updatePlacement: (page, uid, patch) =>
        set((state) => {
          const pages = ensurePages(state.albumPages);
          if (page < 0 || page >= pages.length) return {};
          const next = pages.map((p, i) =>
            i === page
              ? p.map((placement) => (placement.uid === uid ? { ...placement, ...patch } : placement))
              : p,
          );
          return { albumPages: next };
        }),

      removePlacement: (page, uid) =>
        set((state) => {
          const pages = ensurePages(state.albumPages);
          if (page < 0 || page >= pages.length) return {};
          const next = pages.map((p, i) => (i === page ? p.filter((x) => x.uid !== uid) : p));
          return { albumPages: next };
        }),

      clearAlbumPage: (page) =>
        set((state) => {
          const pages = ensurePages(state.albumPages);
          if (page < 0 || page >= pages.length) return {};
          const next = pages.map((p, i) => (i === page ? [] : p));
          return { albumPages: next };
        }),
    }),
    {
      name: "machigaisagashi-v1",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : dummyStorage)),
      partialize: (state): PersistedShape => ({
        clearedLevels: state.clearedLevels,
        totalFoundAllTime: state.totalFoundAllTime,
        playerName: state.playerName,
        ownedStickers: state.ownedStickers,
        albumPages: state.albumPages,
      }),
    },
  ),
);

// SSR (Next.js) 時に window が無くても壊れないようダミーを用意
const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

// 永続化データが古い（ページ配列が短い/無い）時に補正するヘルパー
function ensurePages(pages: AlbumPlacement[][] | undefined): AlbumPlacement[][] {
  const src = Array.isArray(pages) ? pages : [];
  if (src.length >= ALBUM_PAGE_COUNT) return src;
  const filled = [...src];
  while (filled.length < ALBUM_PAGE_COUNT) filled.push([]);
  return filled;
}

/** 現在遊ぶべきステージの level 番号を返す。progress がない場合は null。 */
export function getCurrentLevel(progress: Progress | null): number | null {
  if (!progress) return null;
  if (progress.currentIndex >= progress.levels.length) return null;
  return progress.levels[progress.currentIndex];
}

/** 残りステージ数（自分含まず）。 */
export function getRemainingStages(progress: Progress | null): number {
  if (!progress) return 0;
  return Math.max(0, progress.levels.length - progress.currentIndex - 1);
}
