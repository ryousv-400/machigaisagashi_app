"use client";

import { useEffect, useState } from "react";
import { isSoundEnabled, setSoundEnabled, primeVoices } from "@/lib/speech";
import { playSound } from "@/lib/sound";
import styles from "./SoundToggle.module.css";

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    primeVoices();
    setEnabled(isSoundEnabled());
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setSoundEnabled(next);
    if (next) playSound("tap");
  };

  return (
    <button
      type="button"
      className={`${styles.toggle} ${enabled ? styles.on : styles.off}`}
      onClick={toggle}
      aria-label={enabled ? "おんせいを けす" : "おんせいを つける"}
    >
      <span className={styles.icon}>
        <img src={enabled ? "/kids/ui_sound_on.png" : "/kids/ui_sound_off.png"} alt="" className={styles.iconImage} />
      </span>
      <span className={styles.label}>{enabled ? "おんせい おん" : "おんせい おふ"}</span>
    </button>
  );
}
