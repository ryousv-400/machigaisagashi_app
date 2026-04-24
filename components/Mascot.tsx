"use client";

import { useEffect, useRef } from "react";
import { speak } from "@/lib/speech";
import styles from "./Mascot.module.css";

export type MascotMood = "idle" | "happy" | "sad" | "hint";

type Props = {
  mood: MascotMood;
  message: string;
  speakOnChange?: boolean; // message 変更時に音声読み上げするか
};

export default function Mascot({ mood, message, speakOnChange = true }: Props) {
  const charRef = useRef<HTMLDivElement | null>(null);
  const lastMessageRef = useRef<string>("");

  // メッセージが変わったら音声読み上げ＋キャラをアニメーションさせる
  useEffect(() => {
    if (!message) return;
    if (message === lastMessageRef.current) return;
    lastMessageRef.current = message;

    if (speakOnChange) speak(message);

    if (charRef.current) {
      charRef.current.animate(
        [
          { transform: "translateY(0) scale(1) rotate(0)" },
          { transform: "translateY(-14px) scale(1.2) rotate(-10deg)" },
          { transform: "translateY(0) scale(1) rotate(0)" },
        ],
        { duration: 500, easing: "cubic-bezier(0.34, 1.8, 0.64, 1)" },
      );
    }
  }, [message, speakOnChange]);

  return (
    <div className={styles.container}>
      <div ref={charRef} className={`${styles.character} ${styles[mood]}`}>
        <img src="/kids/mascot_bunny.png" alt="" className={styles.characterImage} />
      </div>
      {message ? <div className={styles.bubble}>{message}</div> : null}
    </div>
  );
}
