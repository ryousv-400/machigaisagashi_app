"use client";

import { useEffect, useState } from "react";
import type { DrawResult } from "@/lib/stickers";
import { speak } from "@/lib/speech";
import { playSound } from "@/lib/sound";
import { StickerImage } from "./StickerBook";
import styles from "./StickerReveal.module.css";

type Props = {
  result: DrawResult;
  playerName: string | null;
  onDone: () => void;
};

type Phase = "intro" | "capsule" | "reveal";

/**
 * シール獲得演出。
 * - intro: マスコットが「きょうの シールは〜？」と言う (約 900ms)
 * - capsule: カプセルがくるくる回る (約 1400ms)
 * - reveal: シールがどーんと出現。ボタンを押して閉じる。
 */
export default function StickerReveal({ result, playerName, onDone }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");

  useEffect(() => {
    const who = playerName ? `${playerName}ちゃん、` : "";
    speak(`${who}きょうの シールは なにかな？`, { rate: 1.0 });

    const t1 = setTimeout(() => {
      setPhase("capsule");
      playSound("sparkle");
    }, 900);
    const t2 = setTimeout(() => {
      setPhase("reveal");
      playSound("clear");
      const name = result.sticker.title;
      const announcement =
        result.kind === "new"
          ? `あたらしい！ ${name}！`
          : result.kind === "shiny"
            ? `キラキラに なったよ！ ${name}！`
            : `また ${name}！ うれしいね！`;
      speak(announcement, { rate: 1.0 });
    }, 900 + 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [result, playerName]);

  const handleClose = () => {
    playSound("tap");
    onDone();
  };

  const tagText =
    result.kind === "new" ? "あたらしい！" :
    result.kind === "shiny" ? "✨ キラキラに なった！ ✨" :
    "また ゲット！";

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.stage}>
        {phase === "intro" ? (
          <div className={styles.intro}>
            <img src="/kids/mascot_bunny.png" alt="" className={styles.mascot} />
            <p className={styles.introText}>きょうの シールは〜？</p>
          </div>
        ) : null}

        {phase === "capsule" ? (
          <div className={styles.capsuleWrap}>
            <div className={styles.capsule} aria-hidden="true">
              <span className={styles.capsuleMark}>?</span>
            </div>
            <div className={styles.sparkles} aria-hidden="true">
              <span className={styles.sparkle1}>✨</span>
              <span className={styles.sparkle2}>⭐</span>
              <span className={styles.sparkle3}>💖</span>
              <span className={styles.sparkle4}>🌟</span>
            </div>
          </div>
        ) : null}

        {phase === "reveal" ? (
          <div className={`${styles.reveal} ${result.kind === "shiny" ? styles.revealShiny : ""}`}>
            <div
              className={styles.revealArtWrap}
              style={{ background: result.sticker.baseColor }}
            >
              <StickerImage sticker={result.sticker} className={styles.revealArt} />
              {result.kind === "shiny" ? <span className={styles.shinyRing} aria-hidden="true" /> : null}
            </div>
            <p className={`${styles.revealName} ${result.kind === "shiny" ? "rainbow-text" : ""}`}>
              {result.sticker.title}
            </p>
            <p className={styles.revealTag}>{tagText}</p>
            <button type="button" className={styles.okBtn} onClick={handleClose}>
              やったー！
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
