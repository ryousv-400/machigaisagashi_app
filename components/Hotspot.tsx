"use client";

import { useEffect, useRef } from "react";
import type { Mistake } from "@/lib/stages";
import styles from "./Hotspot.module.css";

type Props = {
  mistake: Mistake;
  found: boolean;
  hinting: boolean;
  onHit: (ev: React.PointerEvent) => void;
};

export default function Hotspot({ mistake, found, hinting, onHit }: Props) {
  const ref = useRef<HTMLButtonElement | null>(null);

  // 見つけたときの演出（○をその場に残す）
  useEffect(() => {
    if (!found || !ref.current) return;
    ref.current.animate(
      [
        { transform: "translate(-50%, -50%) scale(0.3)", opacity: 0 },
        { transform: "translate(-50%, -50%) scale(1.3)", opacity: 1, offset: 0.6 },
        { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
      ],
      { duration: 500, easing: "cubic-bezier(0.34, 1.8, 0.64, 1)" },
    );
  }, [found]);

  return (
    <button
      ref={ref}
      type="button"
      className={`${styles.hotspot} ${found ? styles.found : ""} ${hinting && !found ? styles.hinting : ""}`}
      style={{
        left: `${mistake.x}%`,
        top: `${mistake.y}%`,
        width: `${mistake.w}%`,
        height: `${mistake.h}%`,
      }}
      onPointerDown={(e) => {
        if (found) return;
        onHit(e);
      }}
      onPointerUp={(e) => {
        // Panel 側の onPointerUp が onMiss を発火するのを防ぐ
        e.stopPropagation();
      }}
      aria-label={found ? "みつけた" : "まちがい"}
    >
      {found ? <span className={styles.mark}>⭕️</span> : null}
    </button>
  );
}
