"use client";

import styles from "./StarProgress.module.css";

type Props = {
  total: number;
  found: number;
};

export default function StarProgress({ total, found }: Props) {
  return (
    <div className={styles.container} aria-label={`${found} / ${total} みつけた`}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`${styles.star} ${i < found ? styles.filled : styles.empty}`}>
          <img src="/kids/ui_star_badge.png" alt="" className={styles.starImage} />
        </span>
      ))}
    </div>
  );
}
