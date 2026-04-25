"use client";

import { useEffect } from "react";
import { speak } from "@/lib/speech";
import { playSound } from "@/lib/sound";
import type { StageCrowns } from "@/lib/store";
import Confetti from "./Confetti";
import styles from "./ClearScreen.module.css";

type Props = {
  stageTitle: string;
  stageIndex: number;
  stageTotal: number;
  totalFound: number;
  crowns?: StageCrowns | null;
  onNext: () => void;
  onBack: () => void;
};

export default function ClearScreen({ stageTitle, stageIndex, stageTotal, totalFound, crowns, onNext, onBack }: Props) {
  const isFinal = stageIndex >= stageTotal;
  const crownCount = crowns ? [crowns.cleared, crowns.hintless, crowns.noMiss].filter(Boolean).length : 0;

  useEffect(() => {
    if (isFinal) {
      speak("ぜんぶ くりあ！ ほんとうに すごいね！ だいせいこう！", { rate: 1.0 });
    } else if (crownCount === 3) {
      speak("やったね！ おうかん ３こ かんぺき！", { rate: 1.0 });
    } else if (crownCount === 2) {
      speak("やったね！ おうかんも もらえたよ！", { rate: 1.0 });
    } else {
      speak("やったね！ つぎの もんだいに すすもう！", { rate: 1.0 });
    }
  }, [isFinal, crownCount]);

  const handleNext = () => {
    playSound("tap");
    onNext();
  };
  const handleBack = () => {
    playSound("tap");
    onBack();
  };

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <Confetti count={isFinal ? 60 : 36} />
      <div className={styles.panel}>
        <div className={styles.starRow}>
          <img src="/kids/ui_star_badge.png" alt="" className={styles.starBig} />
          <img src="/kids/ui_star_badge.png" alt="" className={styles.starBig} />
          <img src="/kids/ui_star_badge.png" alt="" className={styles.starBig} />
        </div>
        <h2 className={`${styles.title} rainbow-text`}>
          {isFinal ? "ぜんぶ くりあ！" : "やったね！"}
        </h2>
        <p className={styles.subtitle}>
          {isFinal ? "ほんとうに すごいよ！" : `${stageTitle} クリア！`}
        </p>

        {crowns ? (
          <div className={styles.crowns} aria-label="このステージの おうかん">
            <CrownItem got={crowns.cleared} label="クリア" emoji="👑" />
            <CrownItem got={crowns.hintless} label="ヒントなし" emoji="💡" />
            <CrownItem got={crowns.noMiss} label="ノーミス" emoji="✨" />
          </div>
        ) : null}
        <div className={styles.stats}>
          <div className={styles.statBadge}>
            <img src="/kids/ui_star_badge.png" alt="" className={styles.statIcon} />
            <span className={styles.statText}>
              みつけた かず <strong>{totalFound}</strong>こ
            </span>
          </div>
          <div className={styles.statBadge}>
            <img src="/kids/ui_hint_magnifier.png" alt="" className={styles.statIcon} />
            <span className={styles.statText}>
              <strong>{stageIndex}</strong> / {stageTotal}
            </span>
          </div>
        </div>
        <div className={styles.buttons}>
          {!isFinal ? (
            <button type="button" onClick={handleNext} className={`${styles.btn} ${styles.btnNext}`}>
              つぎへ
            </button>
          ) : null}
          <button type="button" onClick={handleBack} className={`${styles.btn} ${styles.btnBack}`}>
            {isFinal ? "もう１かい あそぶ" : "タイトルへ"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CrownItem({ got, label, emoji }: { got: boolean; label: string; emoji: string }) {
  return (
    <div className={`${styles.crown} ${got ? styles.crownGot : styles.crownMiss}`}>
      <span className={styles.crownEmoji} aria-hidden="true">{got ? emoji : "・"}</span>
      <span className={styles.crownLabel}>{label}</span>
    </div>
  );
}
