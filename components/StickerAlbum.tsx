"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/store";
import { ALBUM_PAGE_THEMES } from "@/lib/albumPages";
import { STICKERS, getSticker, type StickerDef, type OwnedSticker } from "@/lib/stickers";
import { speak, primeVoices } from "@/lib/speech";
import { playSound } from "@/lib/sound";
import { StickerImage } from "./StickerBook";
import styles from "./StickerAlbum.module.css";

/**
 * じぶんのシールちょう (MVP)
 * - 3 ページ固定、テーマ: にじ / うみ / おかし
 * - 下部ストックから獲得済みシールをタップ → ページ中央に配置
 * - 配置済みシールはドラッグで移動、タップで選択、「おかたづけ」で削除
 * - 未所持シールは薄く表示、タップで「まだだよ」
 * - ページめくりは左右ボタン
 * - 貼るたびに少しランダム角度
 */
export default function StickerAlbum() {
  const router = useRouter();
  const playerName = useGameStore((s) => s.playerName);
  const owned = useGameStore((s) => s.ownedStickers);
  const albumPages = useGameStore((s) => s.albumPages);
  const addPlacement = useGameStore((s) => s.addPlacement);
  const updatePlacement = useGameStore((s) => s.updatePlacement);
  const removePlacement = useGameStore((s) => s.removePlacement);

  const [pageIdx, setPageIdx] = useState(0);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [draggingUid, setDraggingUid] = useState<string | null>(null);

  const pageRef = useRef<HTMLDivElement | null>(null);
  const dragOriginRef = useRef<{ startX: number; startY: number; placementX: number; placementY: number } | null>(null);

  const theme = ALBUM_PAGE_THEMES[pageIdx] ?? ALBUM_PAGE_THEMES[0];
  const placements = albumPages[pageIdx] ?? [];
  const ownedMap = useMemo(() => new Map(owned.map((o) => [o.id, o])), [owned]);
  const ownedCount = owned.length;

  useEffect(() => {
    primeVoices();
    const t = setTimeout(() => {
      const who = playerName ? `${playerName}ちゃんの ` : "";
      if (ownedCount === 0) {
        speak(`${who}じぶんの シールちょう！ まずは シールを あつめよう！`, { rate: 1.0 });
      } else {
        speak(`${who}じぶんの シールちょう！ すきな ばしょに はってね！`, { rate: 1.0 });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [ownedCount, playerName]);

  // ページ遷移時に選択解除
  useEffect(() => {
    setSelectedUid(null);
    const t = setTimeout(() => speak(theme.readAloud, { rate: 1.05 }), 150);
    return () => clearTimeout(t);
  }, [pageIdx, theme.readAloud]);

  // --- ストックからタップで配置 ---
  const handleStockTap = useCallback(
    (sticker: StickerDef, ownedInfo: OwnedSticker | undefined) => {
      playSound("tap");
      if (!ownedInfo) {
        speak("この シールは まだだよ！ ゲームで あつめよう！", { rate: 1.0 });
        return;
      }
      // 中央付近にランダムな少しオフセット
      const jitterX = 40 + Math.random() * 20; // 40-60%
      const jitterY = 35 + Math.random() * 20; // 35-55%
      const rotation = Math.random() * 40 - 20; // -20..20 度
      addPlacement(pageIdx, {
        stickerId: sticker.id,
        xPct: jitterX,
        yPct: jitterY,
        scale: 1.0,
        rotation,
      });
      speak(sticker.title, { rate: 1.05 });
    },
    [addPlacement, pageIdx],
  );

  // --- ページ内シールのドラッグ ---
  const handlePlacementPointerDown = useCallback(
    (ev: React.PointerEvent, uid: string) => {
      ev.stopPropagation();
      const page = pageRef.current;
      if (!page) return;
      const placement = placements.find((p) => p.uid === uid);
      if (!placement) return;
      page.setPointerCapture?.(ev.pointerId);
      setSelectedUid(uid);
      setDraggingUid(uid);
      dragOriginRef.current = {
        startX: ev.clientX,
        startY: ev.clientY,
        placementX: placement.xPct,
        placementY: placement.yPct,
      };
    },
    [placements],
  );

  const handlePagePointerMove = useCallback(
    (ev: React.PointerEvent) => {
      if (!draggingUid) return;
      const page = pageRef.current;
      const origin = dragOriginRef.current;
      if (!page || !origin) return;
      const rect = page.getBoundingClientRect();
      const dxPct = ((ev.clientX - origin.startX) / rect.width) * 100;
      const dyPct = ((ev.clientY - origin.startY) / rect.height) * 100;
      const nextX = Math.max(0, Math.min(100, origin.placementX + dxPct));
      const nextY = Math.max(0, Math.min(100, origin.placementY + dyPct));
      updatePlacement(pageIdx, draggingUid, { xPct: nextX, yPct: nextY });
    },
    [draggingUid, pageIdx, updatePlacement],
  );

  const handlePagePointerUp = useCallback(() => {
    setDraggingUid(null);
    dragOriginRef.current = null;
  }, []);

  // --- 台紙の空白タップで選択解除 ---
  const handlePageTap = useCallback(
    (ev: React.PointerEvent) => {
      if (draggingUid) return; // ドラッグ中は無視
      if (ev.target !== pageRef.current) return; // 空白のみ
      setSelectedUid(null);
    },
    [draggingUid],
  );

  // --- 選択中シールを削除 ---
  const handleTidyUp = useCallback(() => {
    if (!selectedUid) {
      playSound("tap");
      speak("シールを えらんでね！", { rate: 1.0 });
      return;
    }
    playSound("tap");
    removePlacement(pageIdx, selectedUid);
    setSelectedUid(null);
  }, [selectedUid, pageIdx, removePlacement]);

  // --- ページめくり ---
  const handlePrev = () => {
    if (pageIdx <= 0) return;
    playSound("tap");
    setPageIdx((p) => p - 1);
  };
  const handleNext = () => {
    if (pageIdx >= ALBUM_PAGE_THEMES.length - 1) return;
    playSound("tap");
    setPageIdx((p) => p + 1);
  };

  const handleBack = () => {
    playSound("tap");
    router.replace("/stickers");
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={handleBack} aria-label="もどる">
          <img src="/kids/ui_home_house.png" alt="" className={styles.backIcon} />
        </button>
        <h1 className={`${styles.title} rainbow-text`}>じぶんの シールちょう</h1>
        <button
          type="button"
          className={`${styles.tidyBtn} ${selectedUid ? styles.tidyActive : ""}`}
          onClick={handleTidyUp}
          aria-label="おかたづけ"
        >
          🗑️ おかたづけ
        </button>
      </header>

      <div className={styles.pageStage}>
        <button
          type="button"
          className={`${styles.flipBtn} ${styles.flipPrev}`}
          onClick={handlePrev}
          disabled={pageIdx === 0}
          aria-label="まえのページ"
        >
          ◀
        </button>

        <div
          ref={pageRef}
          className={styles.page}
          style={{ background: theme.gradient, borderColor: theme.accent }}
          onPointerMove={handlePagePointerMove}
          onPointerUp={handlePagePointerUp}
          onPointerCancel={handlePagePointerUp}
          onPointerDown={handlePageTap}
          key={theme.id}
        >
          <div className={styles.pageTitleBadge} style={{ borderColor: theme.accent }}>
            {theme.title}
          </div>
          {placements.map((p) => {
            const sticker = getSticker(p.stickerId);
            if (!sticker) return null;
            const isSelected = selectedUid === p.uid;
            return (
              <div
                key={p.uid}
                className={`${styles.placement} ${isSelected ? styles.placementSelected : ""} ${draggingUid === p.uid ? styles.placementDragging : ""}`}
                style={{
                  left: `${p.xPct}%`,
                  top: `${p.yPct}%`,
                  transform: `translate(-50%, -50%) rotate(${p.rotation}deg) scale(${p.scale})`,
                  zIndex: p.zIndex,
                }}
                onPointerDown={(e) => handlePlacementPointerDown(e, p.uid)}
              >
                <StickerImage sticker={sticker} className={styles.placementImg} />
              </div>
            );
          })}
          {placements.length === 0 ? (
            <div className={styles.emptyHint} aria-hidden="true">
              したから シールを タップして はってね！
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className={`${styles.flipBtn} ${styles.flipNext}`}
          onClick={handleNext}
          disabled={pageIdx === ALBUM_PAGE_THEMES.length - 1}
          aria-label="つぎのページ"
        >
          ▶
        </button>
      </div>

      <div className={styles.pageDots}>
        {ALBUM_PAGE_THEMES.map((t, i) => (
          <span
            key={t.id}
            className={`${styles.dot} ${i === pageIdx ? styles.dotActive : ""}`}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className={styles.stockBar} aria-label="もっている シール">
        <div className={styles.stockInner}>
          {STICKERS.map((s) => {
            const info = ownedMap.get(s.id);
            return (
              <button
                key={s.id}
                type="button"
                className={`${styles.stockItem} ${info ? "" : styles.stockLocked}`}
                onClick={() => handleStockTap(s, info)}
                aria-label={info ? s.title : "みしゅとく"}
                style={info ? { background: s.baseColor } : undefined}
              >
                <StickerImage sticker={s} className={styles.stockArt} />
                {info?.shiny ? <span className={styles.stockShinyMark} aria-hidden="true">✨</span> : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
