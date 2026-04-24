"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/store";
import { speak, primeVoices, stopSpeech } from "@/lib/speech";
import { playSound } from "@/lib/sound";
import styles from "./NameInput.module.css";

// 五十音表 (清音のみ、子供が自分で見つけやすいように行ごと)
const KANA_ROWS: string[][] = [
  ["あ", "い", "う", "え", "お"],
  ["か", "き", "く", "け", "こ"],
  ["さ", "し", "す", "せ", "そ"],
  ["た", "ち", "つ", "て", "と"],
  ["な", "に", "ぬ", "ね", "の"],
  ["は", "ひ", "ふ", "へ", "ほ"],
  ["ま", "み", "む", "め", "も"],
  ["や", "", "ゆ", "", "よ"],
  ["ら", "り", "る", "れ", "ろ"],
  ["わ", "", "を", "", "ん"],
];

const MAX_LEN = 6;

export default function NameInput() {
  const router = useRouter();
  const currentName = useGameStore((s) => s.playerName);
  const setPlayerName = useGameStore((s) => s.setPlayerName);

  const [draft, setDraft] = useState<string>(currentName ?? "");

  useEffect(() => {
    primeVoices();
    const t = setTimeout(() => {
      speak("おなまえを おしえてね！ いちじずつ えらんでね！", { rate: 1.0 });
    }, 300);
    return () => {
      clearTimeout(t);
      stopSpeech();
    };
  }, []);

  const append = useCallback((c: string) => {
    if (!c) return;
    playSound("tap");
    setDraft((prev) => {
      if (prev.length >= MAX_LEN) return prev;
      const next = prev + c;
      speak(c, { rate: 1.1 });
      return next;
    });
  }, []);

  const backspace = useCallback(() => {
    playSound("tap");
    setDraft((prev) => prev.slice(0, -1));
  }, []);

  const clearAll = useCallback(() => {
    playSound("tap");
    setDraft("");
  }, []);

  const save = useCallback(() => {
    playSound("correct");
    const name = draft.trim();
    if (name.length === 0) {
      setPlayerName(null);
      speak("おなまえを けしたよ", { rate: 1.0 });
    } else {
      setPlayerName(name);
      speak(`${name}ちゃん、よろしくね！`, { rate: 1.0 });
    }
    setTimeout(() => router.replace("/"), 900);
  }, [draft, router, setPlayerName]);

  const cancel = useCallback(() => {
    playSound("tap");
    router.replace("/");
  }, [router]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={cancel} aria-label="もどる">
          <img src="/kids/ui_home_house.png" alt="" className={styles.backIcon} />
        </button>
        <h1 className={`${styles.title} rainbow-text`}>おなまえ</h1>
      </header>

      <div className={styles.displayBox} aria-live="polite">
        <img src="/kids/mascot_bunny.png" alt="" className={styles.mascot} />
        <div className={styles.nameShown}>
          {draft.length === 0 ? (
            <span className={styles.placeholder}>ここに でるよ</span>
          ) : (
            <span className={styles.draftText}>{draft}</span>
          )}
        </div>
      </div>

      <div className={styles.kanaTable} role="grid" aria-label="ひらがな ひょう">
        {KANA_ROWS.map((row, i) => (
          <div key={i} className={styles.kanaRow} role="row">
            {row.map((c, j) => (
              <button
                key={`${i}-${j}`}
                type="button"
                className={`${styles.kanaCell} ${c ? "" : styles.kanaEmpty}`}
                onClick={() => append(c)}
                disabled={!c || draft.length >= MAX_LEN}
                aria-label={c || "なし"}
              >
                {c}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button type="button" className={`${styles.actionBtn} ${styles.back}`} onClick={backspace}>
          けす
        </button>
        <button type="button" className={`${styles.actionBtn} ${styles.clear}`} onClick={clearAll}>
          ぜんぶけす
        </button>
        <button type="button" className={`${styles.actionBtn} ${styles.save}`} onClick={save}>
          けってい！
        </button>
      </div>
    </div>
  );
}
