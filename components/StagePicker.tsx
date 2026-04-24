"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/store";
import { STAGES } from "@/lib/stages";
import { speak, primeVoices } from "@/lib/speech";
import { playSound } from "@/lib/sound";
import styles from "./StagePicker.module.css";

export default function StagePicker() {
  const router = useRouter();
  const clearedLevels = useGameStore((s) => s.clearedLevels);
  const startFreePlay = useGameStore((s) => s.startFreePlay);

  const clearedSet = new Set(clearedLevels);

  useEffect(() => {
    primeVoices();
    const t = setTimeout(() => {
      speak("すきな すてーじを えらんでね！", { rate: 1.0 });
    }, 300);
    return () => clearTimeout(t);
  }, []);

  const handlePick = (level: number, title: string) => {
    playSound("tap");
    speak(title, { rate: 1.05 });
    startFreePlay(level);
    router.push("/play");
  };

  const handleBack = () => {
    playSound("tap");
    router.replace("/");
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={handleBack} aria-label="もどる">
          <img src="/kids/ui_home_house.png" alt="" className={styles.backIcon} />
        </button>
        <h1 className={`${styles.title} rainbow-text`}>じゆうに あそぶ</h1>
      </header>

      <p className={styles.hint}>
        <img src="/kids/ui_hint_magnifier.png" alt="" className={styles.hintIcon} />
        すきな すてーじを えらんでね
      </p>

      <div className={styles.grid}>
        {STAGES.map((s) => {
          const done = clearedSet.has(s.level);
          return (
            <button
              key={s.level}
              type="button"
              className={styles.pickCard}
              onClick={() => handlePick(s.level, s.title)}
            >
              <div className={styles.thumbWrap}>
                <img src={s.leftImg} alt="" className={styles.thumb} />
                {done ? (
                  <img
                    src="/kids/ui_star_badge.png"
                    alt=""
                    className={styles.doneBadge}
                    aria-label="クリアずみ"
                  />
                ) : null}
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.levelTag}>{s.level}</span>
                <span className={styles.cardTitle}>{s.title}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
