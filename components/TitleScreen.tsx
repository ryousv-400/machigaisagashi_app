"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/store";
import { speak, primeVoices } from "@/lib/speech";
import { playSound } from "@/lib/sound";
import type { GameMode } from "@/lib/modes";
import { MODE_READ_ALOUD } from "@/lib/modes";
import SoundToggle from "./SoundToggle";
import styles from "./TitleScreen.module.css";

export default function TitleScreen() {
  const router = useRouter();
  const startGame = useGameStore((s) => s.startGame);
  const playerName = useGameStore((s) => s.playerName);
  const totalFoundAllTime = useGameStore((s) => s.totalFoundAllTime);
  const ownedStickers = useGameStore((s) => s.ownedStickers);

  useEffect(() => {
    primeVoices();
    // ウェルカム音声（少し遅延させて VO の初期化を待つ）
    const t = setTimeout(() => {
      const greet = playerName
        ? `${playerName}ちゃん、おかえり！ あそぶ もーどを えらんでね！`
        : "まちがいさがし！ あそぶ もーどを えらんでね！";
      speak(greet, { rate: 1.0 });
    }, 400);
    return () => clearTimeout(t);
  }, [playerName]);

  const start = (mode: GameMode) => {
    playSound("tap");
    speak(MODE_READ_ALOUD[mode], { rate: 1.05 });
    startGame(mode);
    router.push("/play");
  };

  const goto = (path: string) => {
    playSound("tap");
    router.push(path);
  };

  return (
    <div className={styles.container}>
      {/* タイトル */}
      <div className={styles.titleWrap}>
        <h1 className={`${styles.title} rainbow-text`}>まちがいさがし</h1>
        <div className={styles.floaters} aria-hidden="true">
          <img src="/kids/ui_star_badge.png" alt="" className={styles.floater} style={{ left: "10%", animationDelay: "0s" }} />
          <img src="/kids/diff_heart_balloon.png" alt="" className={styles.floater} style={{ left: "25%", animationDelay: "0.4s" }} />
          <img src="/kids/diff_star_cookie.png" alt="" className={styles.floater} style={{ left: "70%", animationDelay: "0.8s" }} />
          <img src="/kids/diff_smile_planet.png" alt="" className={styles.floater} style={{ left: "85%", animationDelay: "1.2s" }} />
          <img src="/kids/ui_hint_magnifier.png" alt="" className={styles.floater} style={{ left: "50%", animationDelay: "1.6s" }} />
        </div>
      </div>

      <button
        type="button"
        className={styles.nameChip}
        onClick={() => goto("/name")}
        aria-label={playerName ? "おなまえを かえる" : "おなまえを とうろく"}
      >
        <img src="/kids/mascot_bunny.png" alt="" className={styles.nameChipIcon} />
        <span className={styles.nameChipText}>
          {playerName ? (
            <>
              <strong>{playerName}</strong>ちゃん
            </>
          ) : (
            "おなまえを おしえてね"
          )}
        </span>
      </button>

      <div className={styles.statsRow}>
        <div className={styles.statPill}>
          <img src="/kids/ui_star_badge.png" alt="" className={styles.statIcon} />
          <span>
            みつけた <strong>{totalFoundAllTime}</strong>こ
          </span>
        </div>
        <div className={styles.statPill}>
          <img src="/kids/ui_hint_magnifier.png" alt="" className={styles.statIcon} />
          <span>
            シール <strong>{ownedStickers.length}</strong>まい
          </span>
        </div>
      </div>

      <p className={styles.subtitle}>どっちで あそぶ？</p>

      <div className={styles.preview} aria-hidden="true">
        <img src="/kids/kids_stage1_left.png" alt="" className={styles.previewScene} />
        <img src="/kids/mascot_bunny.png" alt="" className={styles.previewMascot} />
      </div>

      {/* モード選択ボタン */}
      <div className={styles.modes}>
        <button
          type="button"
          onClick={() => start("ten")}
          className={`${styles.modeBtn} ${styles.modeTen}`}
          aria-label="じゅうもん モード"
        >
          <img src="/kids/ui_star_badge.png" alt="" className={styles.modeIcon} />
          <span className={styles.modeNumber}>１０</span>
          <span className={styles.modeLabel}>もん</span>
          <span className={styles.modeHint}>はじめてに おすすめ！</span>
        </button>

        <button
          type="button"
          onClick={() => start("thirty")}
          className={`${styles.modeBtn} ${styles.modeThirty}`}
          aria-label="さんじゅうもん モード"
        >
          <img src="/kids/mascot_bunny.png" alt="" className={styles.modeIcon} />
          <span className={styles.modeNumber}>３０</span>
          <span className={styles.modeLabel}>もん</span>
          <span className={styles.modeHint}>ぜんぶ あそぶ！</span>
        </button>
      </div>

      <div className={styles.extraRow}>
        <button
          type="button"
          className={`${styles.extraBtn} ${styles.extraFree}`}
          onClick={() => goto("/picker")}
        >
          <img src="/kids/ui_hint_magnifier.png" alt="" className={styles.extraIcon} />
          <span>じゆうに あそぶ</span>
        </button>
        <button
          type="button"
          className={`${styles.extraBtn} ${styles.extraStamp}`}
          onClick={() => goto("/stickers")}
        >
          <img src="/kids/ui_star_badge.png" alt="" className={styles.extraIcon} />
          <span>シールちょう</span>
        </button>
      </div>

      <div className={styles.footer}>
        <SoundToggle />
      </div>
    </div>
  );
}
