"use client";

import { useEffect, useState } from "react";
import styles from "./Confetti.module.css";

type Piece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  rotate: number;
  swayX: number;
  isImage: boolean;
  imageUrl?: string;
  color?: string;
};

const IMAGE_URLS = [
  "/kids/ui_star_badge.png",
  "/kids/diff_heart_balloon.png",
  "/kids/diff_star_cookie.png",
  "/kids/ui_hint_magnifier.png",
  "/kids/diff_smile_planet.png",
];
const COLORS = ["#ff6fa8", "#ffcf3a", "#3ccf7a", "#3fb0ff", "#d4b3ff", "#ff9a3c"];

export default function Confetti({ count = 40 }: { count?: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    const list: Piece[] = Array.from({ length: count }, (_, i) => {
      const isImage = Math.random() > 0.45;
      return {
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1200,
        duration: 2400 + Math.random() * 1600,
        rotate: Math.random() * 720 - 360,
        swayX: (Math.random() - 0.5) * 120,
        isImage,
        imageUrl: isImage ? IMAGE_URLS[Math.floor(Math.random() * IMAGE_URLS.length)] : undefined,
        color: !isImage ? COLORS[Math.floor(Math.random() * COLORS.length)] : undefined,
      };
    });
    setPieces(list);
  }, [count]);

  return (
    <div className={styles.container} aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className={`${styles.piece} ${p.isImage ? styles.imagePiece : styles.chip}`}
          style={
            {
              left: `${p.left}%`,
              animationDelay: `${p.delay}ms`,
              animationDuration: `${p.duration}ms`,
              "--sway": `${p.swayX}px`,
              "--rot": `${p.rotate}deg`,
              background: p.color,
            } as React.CSSProperties
          }
        >
          {p.imageUrl ? <img src={p.imageUrl} alt="" className={styles.pieceImage} /> : null}
        </span>
      ))}
    </div>
  );
}
