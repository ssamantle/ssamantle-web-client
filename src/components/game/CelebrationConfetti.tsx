import { useEffect, useRef, useState } from "react";
import confetti, { type CreateTypes } from "canvas-confetti";

interface CelebrationConfettiProps {
  burstId: number;
}

const COLORS = ["#11a4d3", "#ffb703", "#ff6b6b", "#8cc63f", "#8d99ae", "#fb8500"];

// Tune these values to adjust confetti feel without touching the launch logic.
const CONFETTI_TUNING = {
  durationMs: 2200,
  cleanupBufferMs: 280,
  emissionCount: 16,
  emitIntervalMs: 120,
  sideParticleMin: 7,
  sideParticleMax: 28,
  sideSpreadStart: 34,
  sideSpreadEnd: 58,
  sideVelocityStart: 62,
  sideVelocityEnd: 38,
  sideGravity: 1,
  sideTicks: 230,
  sideScalarMin: 0.78,
  sideScalarMax: 1.12,
  sideAngleJitter: 8,
  sideDriftMin: -0.18,
  sideDriftMax: 0.18,
  centerBurstUntilProgress: 0.55,
  centerParticleMin: 4,
  centerParticleMax: 11,
  centerAngleJitter: 16,
  centerSpread: 55,
  centerVelocity: 38,
  centerGravity: 1.05,
  centerTicks: 185,
  centerScalarMin: 0.72,
  centerScalarMax: 0.92,
  centerOriginJitter: 0.06,
} as const;

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function CelebrationConfetti({ burstId }: CelebrationConfettiProps) {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const fireRef = useRef<CreateTypes | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (burstId <= 0) {
      setIsVisible(false);
      return;
    }

    const layer = layerRef.current;
    if (!layer) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.className = "celebration-confetti-canvas";
    layer.appendChild(canvas);

    const fire = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });
    fireRef.current = fire;

    setIsVisible(true);

    const startAt = Date.now();
    let frameId = 0;
    let emissionIndex = 0;
    let isCancelled = false;

    const launch = () => {
      if (isCancelled || !fireRef.current) {
        return;
      }

      const elapsed = Date.now() - startAt;
      const progressByTime = Math.min(1, elapsed / CONFETTI_TUNING.durationMs);
      const progressByEmission =
        CONFETTI_TUNING.emissionCount > 1
          ? emissionIndex / (CONFETTI_TUNING.emissionCount - 1)
          : 1;
      const progress = Math.min(1, Math.max(progressByTime, progressByEmission));

      const burstStrength = 1 - progress;
      const particleCount = Math.max(
        CONFETTI_TUNING.sideParticleMin,
        Math.round(CONFETTI_TUNING.sideParticleMax * burstStrength),
      );
      const spread =
        CONFETTI_TUNING.sideSpreadStart
        + progress * (CONFETTI_TUNING.sideSpreadEnd - CONFETTI_TUNING.sideSpreadStart);
      const velocity =
        CONFETTI_TUNING.sideVelocityStart
        - progress * (CONFETTI_TUNING.sideVelocityStart - CONFETTI_TUNING.sideVelocityEnd);

      [
        { x: 0.08, angle: 60 },
        { x: 0.92, angle: 120 },
      ].forEach((origin) => {
        fireRef.current?.({
          particleCount,
          angle: origin.angle + randomInRange(-CONFETTI_TUNING.sideAngleJitter, CONFETTI_TUNING.sideAngleJitter),
          spread,
          startVelocity: velocity,
          gravity: CONFETTI_TUNING.sideGravity,
          drift: randomInRange(CONFETTI_TUNING.sideDriftMin, CONFETTI_TUNING.sideDriftMax),
          scalar: randomInRange(CONFETTI_TUNING.sideScalarMin, CONFETTI_TUNING.sideScalarMax),
          ticks: CONFETTI_TUNING.sideTicks,
          origin: { x: origin.x, y: 0.98 },
          colors: COLORS,
        });
      });

      if (progress < CONFETTI_TUNING.centerBurstUntilProgress) {
        fireRef.current({
          particleCount: Math.max(
            CONFETTI_TUNING.centerParticleMin,
            Math.round(CONFETTI_TUNING.centerParticleMax * burstStrength),
          ),
          angle: 90 + randomInRange(-CONFETTI_TUNING.centerAngleJitter, CONFETTI_TUNING.centerAngleJitter),
          spread: CONFETTI_TUNING.centerSpread,
          startVelocity: CONFETTI_TUNING.centerVelocity,
          gravity: CONFETTI_TUNING.centerGravity,
          scalar: randomInRange(CONFETTI_TUNING.centerScalarMin, CONFETTI_TUNING.centerScalarMax),
          ticks: CONFETTI_TUNING.centerTicks,
          origin: {
            x: 0.5 + randomInRange(-CONFETTI_TUNING.centerOriginJitter, CONFETTI_TUNING.centerOriginJitter),
            y: 0.94,
          },
          colors: COLORS,
        });
      }

      emissionIndex += 1;
      if (progress < 1 && emissionIndex < CONFETTI_TUNING.emissionCount) {
        frameId = window.setTimeout(launch, CONFETTI_TUNING.emitIntervalMs);
      }
    };

    launch();

    const timeoutId = window.setTimeout(
      () => setIsVisible(false),
      CONFETTI_TUNING.durationMs + CONFETTI_TUNING.cleanupBufferMs,
    );

    return () => {
      isCancelled = true;
      window.clearTimeout(frameId);
      window.clearTimeout(timeoutId);
      fireRef.current = null;
      canvas.remove();
    };
  }, [burstId]);

  return (
    <div
      ref={layerRef}
      className="celebration-confetti-layer"
      data-confetti-active={isVisible ? "true" : "false"}
      aria-hidden="true"
    />
  );
}
