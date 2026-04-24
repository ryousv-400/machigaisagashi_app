"use client";

import { useEffect } from "react";
import { speak } from "@/lib/speech";
import { playSound } from "@/lib/sound";
import Confetti from "./Confetti";
import styles from "./ClearScreen.module.css";

type Props = {
  stageTitle: string;
  stageIndex: number;
  stageTotal: number;
  totalFound: number;
  onNext: () => void;
  onBack: () => void;
};

export default function ClearScreen({ stageTitle, stageIndex, stageTotal, totalFound, onNext, onBack }: Props) {
  const isFinal = stageIndex >= stageTotal;

  useEffect(() => {
    if (isFinal) {
      speak("ぜんぶ くりあ！ ほんとうに すごいね！ だいせいこう！", { rate: 1.0 });
    } else {
      speak("やったね！ つぎの もんだいに すすもう！", { rate: 1.0 });
    }
  }, [isFinal]);

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
