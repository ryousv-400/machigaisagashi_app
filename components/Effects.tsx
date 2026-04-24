"use client";

import { useEffect, useRef } from "react";
import styles from "./Effects.module.css";

export type EffectType = "correct" | "wrong";

type Event = {
  id: number;
  type: EffectType;
  x: number;
  y: number;
};

type Props = {
  events: Event[];
  onDone: (id: number) => void;
};

const PARTICLE_IMAGES = [
  "/kids/ui_star_badge.png",
  "/kids/diff_heart_balloon.png",
  "/kids/diff_star_cookie.png",
  "/kids/diff_smile_planet.png",
  "/kids/ui_hint_magnifier.png",
];

export default function Effects({ events, onDone }: Props) {
  return (
    <div className={styles.container} aria-hidden="true">
      {events.map((e) =>
        e.type === "correct" ? (
          <CorrectBurst key={e.id} x={e.x} y={e.y} onDone={() => onDone(e.id)} />
        ) : (
          <WrongX key={e.id} x={e.x} y={e.y} onDone={() => onDone(e.id)} />
        ),
      )}
    </div>
  );
}

function CorrectBurst({ x, y, onDone }: { x: number; y: number; onDone: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const t = setTimeout(onDone, 1400);
    return () => clearTimeout(t);
  }, [onDone]);

  const particles = Array.from({ length: 12 }, (_, i) => {
    const imageUrl = PARTICLE_IMAGES[i % PARTICLE_IMAGES.length];
    const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.4;
    const distance = 80 + Math.random() * 60;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 40;
    const rotate = Math.random() * 600 - 300;
    return { imageUrl, tx, ty, rotate, delay: Math.random() * 120 };
  });

  return (
    <div ref={ref} className={styles.correctBurst} style={{ left: x, top: y }}>
      <div className={styles.burstRing} />
      <div className={styles.burstRing2} />
      <div className={styles.yattaText}>やったー！</div>
      {particles.map((p, i) => (
        <img
          key={i}
          className={styles.particle}
          src={p.imageUrl}
          alt=""
          style={
            {
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
              "--rot": `${p.rotate}deg`,
              animationDelay: `${p.delay}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function WrongX({ x, y, onDone }: { x: number; y: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 700);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={styles.wrongX} style={{ left: x, top: y }}>
      ×
    </div>
  );
}
