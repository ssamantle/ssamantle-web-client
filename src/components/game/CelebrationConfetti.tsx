import { useEffect, useRef, useState } from "react";
import confetti, { type CreateTypes } from "canvas-confetti";

interface CelebrationConfettiProps {
  burstId: number;
}

const COLORS = ["#11a4d3", "#ffb703", "#ff6b6b", "#8cc63f", "#8d99ae", "#fb8500"];
const BURST_DURATION_MS = 2200;
const CLEANUP_BUFFER_MS = 280;

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
    let isCancelled = false;

    const launch = () => {
      if (isCancelled || !fireRef.current) {
        return;
      }

      const elapsed = Date.now() - startAt;
      const progress = Math.min(1, elapsed / BURST_DURATION_MS);

      const burstStrength = 1 - progress;
      const particleCount = Math.max(7, Math.round(28 * burstStrength));
      const spread = 34 + progress * 24;
      const velocity = 62 - progress * 24;

      [
        { x: 0.08, angle: 60 },
        { x: 0.92, angle: 120 },
      ].forEach((origin) => {
        fireRef.current?.({
          particleCount,
          angle: origin.angle + randomInRange(-8, 8),
          spread,
          startVelocity: velocity,
          gravity: 1.0,
          drift: randomInRange(-0.18, 0.18),
          scalar: randomInRange(0.78, 1.12),
          ticks: 230,
          origin: { x: origin.x, y: 0.98 },
          colors: COLORS,
        });
      });

      if (progress < 0.55) {
        fireRef.current({
          particleCount: Math.max(4, Math.round(11 * burstStrength)),
          angle: 90 + randomInRange(-16, 16),
          spread: 55,
          startVelocity: 38,
          gravity: 1.05,
          scalar: randomInRange(0.72, 0.92),
          ticks: 185,
          origin: { x: 0.5 + randomInRange(-0.06, 0.06), y: 0.94 },
          colors: COLORS,
        });
      }

      if (progress < 1) {
        frameId = window.setTimeout(launch, 120);
      }
    };

    launch();

    const timeoutId = window.setTimeout(
      () => setIsVisible(false),
      BURST_DURATION_MS + CLEANUP_BUFFER_MS,
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
