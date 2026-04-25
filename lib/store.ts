// ゲーム状態管理。Zustand を使って軽量に一元管理。
// 永続データ（スタンプ帳・累計・お名前）は localStorage に自動保存する。

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { GameMode, Difficulty } from "./modes";
import { buildLevelSequence, shouldMirrorPanels } from "./modes";
import type { OwnedSticker, DrawResult } from "./stickers";
import { drawSticker } from "./stickers";

// ステージごとに獲得できる王冠
export type StageCrowns = {
  cleared: boolean;   // クリアしたか
  hintless: boolean;  // ヒントを 1 回も使わずクリアしたか
  noMiss: boolean;    // お手つき 0 回でクリアしたか
};

export type CrownsByDifficulty = Record<Difficulty, Record<number, StageCrowns>>;

const emptyCrowns = (): CrownsByDifficulty => ({
  easy: {},
  normal: {},
  hard: {},
});

type Progress = {
  mode: GameMode;
  difficulty: Difficulty;
  levels: number[];       // そのモードで遊ぶステージ番号の順序（hard 時はシャッフル）
  mirroredLevels: number[]; // 左右入れ替えるステージ番号の集合
  currentIndex: number;   // levels の何番目を今遊んでいるか
  foundCount: number;     // そのステージで見つけた間違いの数
  totalFound: number;     // このセッションで累計見つけた数
  hintUsedThisStage: boolean; // 現ステージでヒントを使ったか
  missCountThisStage: number; // 現ステージのお手つき数
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
  // ずっと残る: 直近に選んだむずかしさ（タイトルに復元）
  preferredDifficulty: Difficulty;
  // ずっと残る: ステージごとの王冠獲得状況（むずかしさ別）
  stageCrowns: CrownsByDifficulty;
};

type GameStore = PersistState & {
  // セッション状態（永続化しない）
  progress: Progress | null;

  // セッション操作
  startGame: (mode: GameMode, difficulty?: Difficulty) => void;
  startFreePlay: (level: number, difficulty?: Difficulty) => void;
  markFound: () => void;
  markHintUsed: () => void;
  markMiss: () => void;
  resetFoundForNextStage: () => void;
  advanceStage: () => void;
  reset: () => void;

  // 永続データ操作
  addClearedLevel: (level: number) => void;
  setPlayerName: (name: string | null) => void;
  setPreferredDifficulty: (d: Difficulty) => void;
  awardCrowns: (level: number, difficulty: Difficulty, crowns: StageCrowns) => void;
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

const initialProgress = (
  mode: GameMode,
  difficulty: Difficulty,
  levelsOverride?: number[],
): Progress => {
  const levels = levelsOverride ?? buildLevelSequence(mode, difficulty);
  const mirroredLevels = shouldMirrorPanels(difficulty)
    ? levels.filter(() => Math.random() < 0.5)
    : [];
  return {
    mode,
    difficulty,
    levels,
    mirroredLevels,
    currentIndex: 0,
    foundCount: 0,
    totalFound: 0,
    hintUsedThisStage: false,
    missCountThisStage: 0,
  };
};

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
      preferredDifficulty: "normal",
      stageCrowns: emptyCrowns(),

      // --- セッション初期値 ---
      progress: null,

      // --- セッション操作 ---
      startGame: (mode, difficulty) => {
        const d = difficulty ?? get().preferredDifficulty ?? "normal";
        set({ progress: initialProgress(mode, d), preferredDifficulty: d });
      },
      startFreePlay: (level, difficulty) => {
        const d = difficulty ?? get().preferredDifficulty ?? "normal";
        set({ progress: initialProgress("ten", d, [level]), preferredDifficulty: d });
      },

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

      markHintUsed: () =>
        set((state) => {
          if (!state.progress) return {};
          if (state.progress.hintUsedThisStage) return {};
          return { progress: { ...state.progress, hintUsedThisStage: true } };
        }),

      markMiss: () =>
        set((state) => {
          if (!state.progress) return {};
          return {
            progress: { ...state.progress, missCountThisStage: state.progress.missCountThisStage + 1 },
          };
        }),

      resetFoundForNextStage: () =>
        set((state) => {
          if (!state.progress) return {};
          return {
            progress: {
              ...state.progress,
              foundCount: 0,
              hintUsedThisStage: false,
              missCountThisStage: 0,
            },
          };
        }),

      advanceStage: () =>
        set((state) => {
          if (!state.progress) return {};
          return {
            progress: {
              ...state.progress,
              currentIndex: state.progress.currentIndex + 1,
              foundCount: 0,
              hintUsedThisStage: false,
              missCountThisStage: 0,
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

      setPreferredDifficulty: (d) => set({ preferredDifficulty: d }),

      awardCrowns: (level, difficulty, crowns) =>
        set((state) => {
          const existing = ensureCrowns(state.stageCrowns)[difficulty][level];
          // 一度取った王冠は失わない（OR で合成）
          const merged: StageCrowns = {
            cleared: existing?.cleared || crowns.cleared,
            hintless: existing?.hintless || crowns.hintless,
            noMiss: existing?.noMiss || crowns.noMiss,
          };
          const all = ensureCrowns(state.stageCrowns);
          return {
            stageCrowns: {
              ...all,
              [difficulty]: { ...all[difficulty], [level]: merged },
            },
          };
        }),

      resetStamps: () => set({ clearedLevels: [], totalFoundAllTime: 0, stageCrowns: emptyCrowns() }),

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
        preferredDifficulty: state.preferredDifficulty,
        stageCrowns: state.stageCrowns,
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

// 永続化データに stageCrowns が無い・形が古い時の補正
function ensureCrowns(crowns: CrownsByDifficulty | undefined): CrownsByDifficulty {
  const base = emptyCrowns();
  if (!crowns) return base;
  return {
    easy: { ...base.easy, ...(crowns.easy ?? {}) },
    normal: { ...base.normal, ...(crowns.normal ?? {}) },
    hard: { ...base.hard, ...(crowns.hard ?? {}) },
  };
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

/** 現ステージで左右パネルを反転表示すべきか（リミックス）。 */
export function isCurrentStageMirrored(progress: Progress | null): boolean {
  if (!progress) return false;
  const level = progress.levels[progress.currentIndex];
  if (level === undefined) return false;
  return progress.mirroredLevels.includes(level);
}

/** ステージ王冠の合計（cleared/hintless/noMiss それぞれ集計）。 */
export function getCrownTotals(crowns: CrownsByDifficulty): {
  cleared: number;
  hintless: number;
  noMiss: number;
  total: number;
} {
  let cleared = 0, hintless = 0, noMiss = 0;
  for (const d of ["easy", "normal", "hard"] as Difficulty[]) {
    for (const lv of Object.keys(crowns[d] ?? {})) {
      const c = crowns[d][Number(lv)];
      if (!c) continue;
      if (c.cleared) cleared++;
      if (c.hintless) hintless++;
      if (c.noMiss) noMiss++;
    }
  }
  return { cleared, hintless, noMiss, total: cleared + hintless + noMiss };
}
