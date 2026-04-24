"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Mistake } from "@/lib/stages";
import Hotspot from "./Hotspot";
import styles from "./Panel.module.css";

type Props = {
  imageUrl: string;
  mistakes: Mistake[];
  foundIds: Set<number>;
  hintId: number | null;
  onHit: (mistakeId: number, ev: React.PointerEvent) => void;
  onMiss: (ev: React.PointerEvent) => void;
  label: string;
  color: "left" | "right";
};

const LONG_PRESS_MS = 380; // 長押し判定までの時間
const ZOOM_SCALE = 2.2;    // 虫眼鏡の拡大率

export default function Panel({ imageUrl, mistakes, foundIds, hintId, onHit, onMiss, label, color }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pressTimerRef = useRef<number | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  // 長押し虫眼鏡: アクティブな拡大座標 (0-100%) と発動中フラグ
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  const clearPressTimer = useCallback(() => {
    if (pressTimerRef.current !== null) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearPressTimer(), [clearPressTimer]);

  const getPct = useCallback((ev: React.PointerEvent | PointerEvent): { x: number; y: number } | null => {
    const el = rootRef.current?.querySelector<HTMLElement>(`.${styles.imageBox}`);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = ((ev.clientX - rect.left) / rect.width) * 100;
    const y = ((ev.clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const pos = getPct(e);
      if (!pos) return;
      startPosRef.current = { x: e.clientX, y: e.clientY };
      clearPressTimer();
      pressTimerRef.current = window.setTimeout(() => {
        setZoom(pos);
      }, LONG_PRESS_MS);
    },
    [clearPressTimer, getPct],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      // ドラッグで動かしたら長押し判定をキャンセル
      if (startPosRef.current && !zoom) {
        const dx = e.clientX - startPosRef.current.x;
        const dy = e.clientY - startPosRef.current.y;
        if (Math.hypot(dx, dy) > 14) clearPressTimer();
      }
      // 虫眼鏡が出ている間は指の移動に合わせて位置を追従
      if (zoom) {
        const pos = getPct(e);
        if (pos) setZoom(pos);
      }
    },
    [zoom, clearPressTimer, getPct],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      clearPressTimer();
      if (zoom) {
        // 虫眼鏡を閉じる（タップ扱いにはしない）
        setZoom(null);
        e.stopPropagation();
        return;
      }
      // 通常の外れタップ（Hotspot が stopPropagation するのでヒット時はここに来ない）
      if (foundIds.size === mistakes.length) return;
      onMiss(e);
    },
    [zoom, clearPressTimer, foundIds.size, mistakes.length, onMiss],
  );

  const handlePointerCancel = useCallback(() => {
    clearPressTimer();
    setZoom(null);
  }, [clearPressTimer]);

  return (
    <div className={`${styles.panel} ${styles[color]}`} ref={rootRef}>
      <div className={styles.labelBadge}>{label}</div>
      <div
        className={styles.imageBox}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <img
          className={styles.bg}
          src={imageUrl}
          alt=""
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        />
        {mistakes.map((m) => (
          <Hotspot
            key={m.id}
            mistake={m}
            found={foundIds.has(m.id)}
            hinting={hintId === m.id}
            onHit={(e) => {
              e.stopPropagation();
              clearPressTimer();
              setZoom(null);
              onHit(m.id, e);
            }}
          />
        ))}
        {zoom ? (
          <div
            className={styles.magnifier}
            style={{
              left: `${zoom.x}%`,
              top: `${zoom.y}%`,
              backgroundImage: `url('${imageUrl}')`,
              backgroundPosition: `${zoom.x}% ${zoom.y}%`,
              backgroundSize: `${ZOOM_SCALE * 100}% ${ZOOM_SCALE * 100}%`,
            }}
            aria-hidden="true"
          />
        ) : null}
      </div>
    </div>
  );
}
