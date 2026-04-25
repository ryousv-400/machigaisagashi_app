"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/store";
import { STICKERS, TOTAL_STICKERS, stickerImagePath, type StickerDef, type OwnedSticker } from "@/lib/stickers";
import { speak, primeVoices } from "@/lib/speech";
import { playSound } from "@/lib/sound";
import styles from "./StickerBook.module.css";

export default function StickerBook() {
  const router = useRouter();
  const owned = useGameStore((s) => s.ownedStickers);
  const playerName = useGameStore((s) => s.playerName);

  const ownedMap = new Map(owned.map((o) => [o.id, o]));
  const ownedCount = owned.length;
  const shinyCount = owned.filter((o) => o.shiny).length;
  const allCollected = ownedCount >= TOTAL_STICKERS;
  const allShiny = shinyCount >= TOTAL_STICKERS;

  const [focused, setFocused] = useState<StickerDef | null>(null);

  useEffect(() => {
    primeVoices();
    const t = setTimeout(() => {
      const who = playerName ? `${playerName}ちゃんの ` : "";
      if (allShiny) {
        speak(`${who}シールちょう！ ぜんぶ キラキラ！ さいこう！`, { rate: 1.0 });
      } else if (allCollected) {
        speak(`${who}シールちょう！ ぜんぶ あつまったよ！ キラキラも あつめよう！`, { rate: 1.0 });
      } else if (ownedCount === 0) {
        speak(`${who}シールちょう！ すてーじを くりあ すると シールが もらえるよ！`, { rate: 1.0 });
      } else {
        speak(`${who}シールは ${ownedCount}まい！ のこり ${TOTAL_STICKERS - ownedCount}まい！`, { rate: 1.0 });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [allCollected, allShiny, ownedCount, playerName]);

  const handleBack = useCallback(() => {
    playSound("tap");
    router.replace("/");
  }, [router]);

  const handleOpenAlbum = useCallback(() => {
    playSound("tap");
    router.push("/album");
  }, [router]);

  const handleTap = (s: StickerDef) => {
    const got = ownedMap.get(s.id);
    playSound("tap");
    if (got) {
      setFocused(s);
      speak(s.title, { rate: 1.0 });
    } else {
      speak("まだ もらって ないよ！", { rate: 1.0 });
    }
  };

  const handleCloseFocus = () => {
    setFocused(null);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={handleBack} aria-label="タイトルに もどる">
          <img src="/kids/ui_home_house.png" alt="" className={styles.backIcon} />
        </button>
        <h1 className={`${styles.title} rainbow-text`}>シールちょう</h1>
      </header>

      <div className={styles.summary}>
        <div className={styles.summaryBadge}>
          <img src="/kids/ui_star_badge.png" alt="" className={styles.summaryIcon} />
          <span>
            <strong>{ownedCount}</strong> / {TOTAL_STICKERS}まい
          </span>
        </div>
        <div className={`${styles.summaryBadge} ${styles.summaryShiny}`}>
          <span className={styles.sparkleEmoji} aria-hidden="true">✨</span>
          <span>
            キラキラ <strong>{shinyCount}</strong>まい
          </span>
        </div>
        <button
          type="button"
          className={styles.albumLinkBtn}
          onClick={handleOpenAlbum}
          aria-label="じぶんの シールちょうへ"
        >
          <span aria-hidden="true">📖</span>
          <span>じぶんの シールちょう</span>
        </button>
      </div>

      {allShiny ? (
        <div className={styles.allShinyBanner}>
          <img src="/kids/mascot_bunny.png" alt="" className={styles.bannerMascot} />
          <p className={`${styles.bannerText} rainbow-text`}>
            ぜんぶ キラキラ！
            <br />
            てんさい！
          </p>
        </div>
      ) : allCollected ? (
        <div className={styles.allCollectedBanner}>
          <img src="/kids/mascot_bunny.png" alt="" className={styles.bannerMascot} />
          <p className={styles.bannerText}>
            ぜんぶ あつまったよ！
            <br />
            つぎは キラキラに しよう！
          </p>
        </div>
      ) : null}

      <div className={styles.grid}>
        {STICKERS.map((s) => (
          <StickerCell
            key={s.id}
            sticker={s}
            owned={ownedMap.get(s.id)}
            onTap={() => handleTap(s)}
          />
        ))}
      </div>

      {focused ? (
        <FocusOverlay
          sticker={focused}
          owned={ownedMap.get(focused.id)!}
          onClose={handleCloseFocus}
        />
      ) : null}
    </div>
  );
}

function StickerCell({
  sticker,
  owned,
  onTap,
}: {
  sticker: StickerDef;
  owned: OwnedSticker | undefined;
  onTap: () => void;
}) {
  const isOwned = !!owned;
  const isShiny = !!owned?.shiny;
  return (
    <button
      type="button"
      className={`${styles.cell} ${isOwned ? styles.cellOwned : styles.cellLocked} ${isShiny ? styles.cellShiny : ""}`}
      onClick={onTap}
      aria-label={isOwned ? sticker.title : "みしゅとく"}
      style={isOwned ? { background: sticker.baseColor } : undefined}
    >
      {isOwned ? (
        <StickerImage sticker={sticker} shiny={isShiny} className={styles.cellArt} />
      ) : (
        <span className={styles.lockMark} aria-hidden="true">?</span>
      )}
      {isShiny ? <span className={styles.shinyRing} aria-hidden="true" /> : null}
    </button>
  );
}

function FocusOverlay({
  sticker,
  owned,
  onClose,
}: {
  sticker: StickerDef;
  owned: OwnedSticker;
  onClose: () => void;
}) {
  return (
    <div className={styles.focusBackdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={`${styles.focusCard} ${owned.shiny ? styles.focusShiny : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.focusArtWrap} style={{ background: sticker.baseColor }}>
          <StickerImage sticker={sticker} shiny={owned.shiny} className={styles.focusArt} />
          {owned.shiny ? <span className={styles.shinyRing} aria-hidden="true" /> : null}
        </div>
        <p className={styles.focusName}>{sticker.title}</p>
        {owned.shiny ? <p className={styles.focusTag}>✨ キラキラ ✨</p> : null}
        <div className={styles.compareRow} aria-label="ふつうと キラキラの ちがい">
          <div className={styles.compareItem}>
            <div className={styles.compareArtWrap} style={{ background: sticker.baseColor }}>
              <StickerImage sticker={sticker} className={styles.compareArt} />
            </div>
            <span>ふつう</span>
          </div>
          <div className={styles.compareItem}>
            <div className={`${styles.compareArtWrap} ${styles.compareShiny}`} style={{ background: sticker.baseColor }}>
              <StickerImage sticker={sticker} shiny className={styles.compareArt} />
            </div>
            <span>{owned.shiny ? "キラキラ" : "キラキラみほん"}</span>
          </div>
        </div>
        <button type="button" className={styles.focusClose} onClick={onClose}>
          とじる
        </button>
      </div>
    </div>
  );
}

/** 画像 fallback 付きシール表示。 */
export function StickerImage({ sticker, shiny = false, className }: { sticker: StickerDef; shiny?: boolean; className?: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <span className={className} style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }} aria-hidden="true">
        {sticker.fallbackEmoji}
      </span>
    );
  }
  return (
    <img
      src={stickerImagePath(sticker, shiny)}
      alt={sticker.title}
      className={className}
      draggable={false}
      onError={() => setErrored(true)}
    />
  );
}
