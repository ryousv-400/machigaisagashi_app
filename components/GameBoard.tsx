"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getStage } from "@/lib/stages";
import { useGameStore, getCurrentLevel } from "@/lib/store";
import { stopSpeech, primeVoices } from "@/lib/speech";
import { playSound } from "@/lib/sound";
import Panel from "./Panel";
import Mascot, { type MascotMood } from "./Mascot";
import StarProgress from "./StarProgress";
import Effects, { type EffectType } from "./Effects";
import ClearScreen from "./ClearScreen";
import StickerReveal from "./StickerReveal";
import type { DrawResult } from "@/lib/stickers";
import styles from "./GameBoard.module.css";

const AREA_NAMES = (x: number, y: number): string => {
  const v = y <= 33 ? "うえ" : y <= 66 ? "まんなか" : "した";
  const h = x <= 33 ? "ひだり" : x <= 66 ? "まんなか" : "みぎ";
  if (v === "まんなか" && h === "まんなか") return "まんなか";
  return `${h}の ${v}`;
};

const HINT_MESSAGES = [
  (area: string) => `${area}を よーく みてね`,
  (area: string) => `${area}に なにか あるかも！`,
  (area: string) => `ひんと！ ${area}が あやしいよ`,
];

const FOUND_MESSAGES = ["すごーい！", "みつけたね！", "やったー！", "さすが！", "えらい！"];
const MISS_MESSAGES = ["おしい！", "もういちど みてみよう！", "だいじょうぶ、ゆっくりね！", "ちかいかも！"];

export default function GameBoard() {
  const router = useRouter();
  const progress = useGameStore((s) => s.progress);
  const markFound = useGameStore((s) => s.markFound);
  const advanceStage = useGameStore((s) => s.advanceStage);
  const reset = useGameStore((s) => s.reset);
  const addClearedLevel = useGameStore((s) => s.addClearedLevel);
  const playerName = useGameStore((s) => s.playerName);
  const drawAndAddSticker = useGameStore((s) => s.drawAndAddSticker);

  const level = getCurrentLevel(progress);

  // progress が null（直接 URL アクセスされたとか）のときはタイトルに戻す
  useEffect(() => {
    if (!progress) router.replace("/");
  }, [progress, router]);

  useEffect(() => {
    primeVoices();
  }, []);

  // ---- ゲーム状態 ----
  const stage = useMemo(() => (level ? getStage(level) : null), [level]);
  const [foundIds, setFoundIds] = useState<Set<number>>(new Set());
  const [mascotMood, setMascotMood] = useState<MascotMood>("idle");
  const [mascotMessage, setMascotMessage] = useState<string>("");
  const [hintId, setHintId] = useState<number | null>(null);
  const [isClear, setIsClear] = useState(false);
  const [stickerResult, setStickerResult] = useState<DrawResult | null>(null);
  const [effects, setEffects] = useState<{ id: number; type: EffectType; x: number; y: number }[]>([]);
  const effectIdRef = useRef(0);

  // ステージ切り替わり時にリセット
  useEffect(() => {
    if (!stage) return;
    setFoundIds(new Set());
    setHintId(null);
    setIsClear(false);
    setStickerResult(null);
    setMascotMood("idle");
    const intro = playerName
      ? `${playerName}ちゃん、${stage.readAloud}`
      : stage.readAloud;
    setMascotMessage(intro);
    // speak() は Mascot 側が message 変更に応じて行う（二重読み上げ防止）
  }, [stage, playerName]);

  // ページ離脱時に音声停止
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // 間違いを押した
  const handleHit = useCallback(
    (mistakeId: number, ev: React.PointerEvent) => {
      if (!stage || isClear) return;
      if (foundIds.has(mistakeId)) return;

      playSound("correct");
      const praise = FOUND_MESSAGES[Math.floor(Math.random() * FOUND_MESSAGES.length)];
      const hit = stage.mistakes.find((m) => m.id === mistakeId);
      const spoken = hit?.label
        ? `${praise} ${hit.label}！`
        : praise;
      setMascotMood("happy");
      setMascotMessage(spoken);
      // speak() は Mascot 側が行う
      markFound();

      setFoundIds((prev) => {
        const next = new Set(prev);
        next.add(mistakeId);
        return next;
      });

      // エフェクト
      effectIdRef.current += 1;
      setEffects((prev) => [
        ...prev,
        { id: effectIdRef.current, type: "correct", x: ev.clientX, y: ev.clientY },
      ]);

      // ヒントをクリア
      setHintId(null);

      // クリア判定
      const willBeFound = foundIds.size + 1;
      if (willBeFound >= stage.mistakes.length) {
        setTimeout(() => {
          playSound("clear");
          setMascotMood("happy");
          const who = playerName ? `${playerName}ちゃん、` : "";
          const clearMsg = `${who}ぜんぶ みつけたね！`;
          setMascotMessage(clearMsg);
          addClearedLevel(stage.level);
          // シール抽選 → Reveal 演出を先に表示、閉じたら ClearScreen
          const result = drawAndAddSticker();
          setStickerResult(result);
        }, 900);
      }
    },
    [stage, isClear, foundIds, markFound, addClearedLevel, playerName, drawAndAddSticker],
  );

  // 外れ場所を押した
  const handleMiss = useCallback(
    (ev: React.PointerEvent) => {
      if (!stage || isClear) return;
      playSound("wrong");
      const msg = MISS_MESSAGES[Math.floor(Math.random() * MISS_MESSAGES.length)];
      setMascotMood("sad");
      setMascotMessage(msg);
      effectIdRef.current += 1;
      setEffects((prev) => [
        ...prev,
        { id: effectIdRef.current, type: "wrong", x: ev.clientX, y: ev.clientY },
      ]);
      // 少ししたら idle に戻す
      setTimeout(() => setMascotMood("idle"), 1200);
    },
    [stage, isClear],
  );

  const handleHint = useCallback(() => {
    if (!stage || isClear) return;
    const remaining = stage.mistakes.filter((m) => !foundIds.has(m.id));
    if (remaining.length === 0) return;
    const target = remaining[Math.floor(Math.random() * remaining.length)];
    const area = AREA_NAMES(target.x, target.y);
    const tmpl = HINT_MESSAGES[Math.floor(Math.random() * HINT_MESSAGES.length)];
    const msg = tmpl(area);
    setHintId(target.id);
    setMascotMood("hint");
    setMascotMessage(msg);
    playSound("sparkle");
  }, [stage, isClear, foundIds]);

  const handleNext = useCallback(() => {
    if (!progress) return;
    if (progress.currentIndex + 1 >= progress.levels.length) {
      // 最終ステージクリア → タイトルへ
      reset();
      router.replace("/");
      return;
    }
    advanceStage();
  }, [progress, advanceStage, reset, router]);

  const handleBackToTitle = useCallback(() => {
    reset();
    router.replace("/");
  }, [reset, router]);

  const removeEffect = useCallback((id: number) => {
    setEffects((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleStickerDone = useCallback(() => {
    setStickerResult(null);
    setIsClear(true);
  }, []);

  if (!progress || !stage) return null;

  const stageIndex = progress.currentIndex + 1;
  const stageTotal = progress.levels.length;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.leftHeader}>
          <div className={styles.stageBadge}>
            <img src="/kids/ui_star_badge.png" alt="" className={styles.stageBadgeIcon} />
            <span className={styles.stageBadgeText}>
              <strong>{stageIndex}</strong>
              <span className={styles.slash}> / </span>
              {stageTotal}
            </span>
          </div>
          <h1 className={styles.title}>{stage.title}</h1>
        </div>
        <div className={styles.rightHeader}>
          <StarProgress total={stage.mistakes.length} found={foundIds.size} />
          <button
            type="button"
            onClick={handleBackToTitle}
            className={styles.homeBtn}
            aria-label="タイトルに もどる"
          >
            <img src="/kids/ui_home_house.png" alt="" className={styles.homeIcon} />
          </button>
        </div>
      </header>

      <div className={styles.mascotRow}>
        <Mascot mood={mascotMood} message={mascotMessage} />
        <button type="button" className={styles.hintBtn} onClick={handleHint} aria-label="ヒント">
          <img src="/kids/ui_hint_magnifier.png" alt="" className={styles.hintIcon} />
          <span>ヒント</span>
        </button>
      </div>

      <main className={styles.panels}>
        <Panel
          imageUrl={stage.leftImg}
          mistakes={stage.mistakes}
          foundIds={foundIds}
          hintId={hintId}
          onHit={handleHit}
          onMiss={handleMiss}
          label="おてほん"
          color="left"
        />
        <Panel
          imageUrl={stage.rightImg}
          mistakes={stage.mistakes}
          foundIds={foundIds}
          hintId={hintId}
          onHit={handleHit}
          onMiss={handleMiss}
          label="もんだい"
          color="right"
        />
      </main>

      <Effects events={effects} onDone={removeEffect} />

      {stickerResult ? (
        <StickerReveal
          result={stickerResult}
          playerName={playerName}
          onDone={handleStickerDone}
        />
      ) : null}

      {isClear ? (
        <ClearScreen
          stageTitle={stage.title}
          stageIndex={stageIndex}
          stageTotal={stageTotal}
          totalFound={progress.totalFound}
          onNext={handleNext}
          onBack={handleBackToTitle}
        />
      ) : null}
    </div>
  );
}
