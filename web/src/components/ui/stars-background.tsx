"use client";

import * as React from "react";
import {
  type HTMLMotionProps,
  motion,
  type SpringOptions,
  type Transition,
  useMotionValue,
  useSpring,
} from "motion/react";

import { cn } from "@/lib/utils";

const lightModeStyles = {
  "--star-color-dark": "#fff",
  "--star-color-light": "#000",
  "--bg-color-start-dark": "#262626",
  "--bg-color-end-dark": "#000",
  "--bg-color-start-light": "#ccc",
  "--bg-color-end-light": "#fff"
};

const getStarColor = (isLight: boolean) => {
  return isLight
    ? lightModeStyles["--star-color-light"]
    : lightModeStyles["--star-color-dark"];
};

type StarLayerProps = HTMLMotionProps<"div"> & {
  count: number;
  size: number;
  transition: Transition;
  isLight: boolean;
};

function generateStars(count: number, starColor: string) {
  const shadows: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 4000) - 2000;
    const y = Math.floor(Math.random() * 4000) - 2000;
    shadows.push(`${x}px ${y}px ${starColor}`);
  }
  return shadows.join(", ");
}

function StarLayer({
  count = 1000,
  size = 1,
  transition = { repeat: Infinity, duration: 50, ease: "linear" },
  isLight,
  className,
  ...props
}: StarLayerProps) {
  const [boxShadow, setBoxShadow] = React.useState<string>("");
  const starColor = getStarColor(isLight);

  React.useEffect(() => {
    setBoxShadow(generateStars(count, starColor));
  }, [count, starColor]);

  return (
    <motion.div
      data-slot="star-layer"
      animate={{ y: [0, -2000] }}
      transition={transition}
      className={cn(
        "absolute top-0 left-0 h-[2000px] w-full",
        // Denser fields read as a rich night sky on dark, but full-strength
        // black speckles look like noise on the light radial gradient.
        isLight ? "opacity-40" : "opacity-100",
        className,
      )}
      {...props}>
      <div
        className="absolute rounded-full bg-transparent"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          boxShadow: boxShadow,
        }}
      />
      <div
        className="absolute top-[2000px] rounded-full bg-transparent"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          boxShadow: boxShadow,
        }}
      />
    </motion.div>
  );
}

type StarsBackgroundProps = React.ComponentProps<"div"> & {
  factor?: number;
  speed?: number;
  transition?: SpringOptions;
  /**
   * Optional globe motion offset (phi in radians, normalized drag delta).
   * When provided, the star field drifts in the opposite direction of the
   * globe for both manual drag and auto-orbit motion.
   */
  globeOffset?: { phi: number; theta: number } | null;
};

export function StarsBackground({
  children,
  className,
  factor = 0.05,
  speed = 50,
  transition = { stiffness: 50, damping: 20 },
  globeOffset,
  ...props
}: StarsBackgroundProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, transition);
  const springY = useSpring(mouseY, transition);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const newOffsetX = -(e.clientX - centerX) * factor;
      const newOffsetY = -(e.clientY - centerY) * factor;
      mouseX.set(newOffsetX);
      mouseY.set(newOffsetY);
    },
    [mouseX, mouseY, factor]
  );

  const [isLight, setIsLight] = React.useState(false);

  React.useEffect(() => {
    const checkLightMode = () => {
      const isLightMode =
        document.documentElement.classList.contains("light") ||
        document.documentElement.getAttribute("data-theme") === "light";
      setIsLight(isLightMode);
    };

    checkLightMode();

    const observer = new MutationObserver(checkLightMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const bgColorStart = isLight
    ? lightModeStyles["--bg-color-start-light"]
    : lightModeStyles["--bg-color-start-dark"];
  const bgColorEnd = isLight
    ? lightModeStyles["--bg-color-end-light"]
    : lightModeStyles["--bg-color-end-dark"];
  const backgroundStyle = `radial-gradient(ellipse_at_bottom, ${bgColorStart} 0%, ${bgColorEnd} 100%)`;

  // When a globe offset is provided, we move the stars in the *opposite*
  // direction. The conversion factors below roughly match the globe camera's
  // sensitivity so auto-orbit and manual drag both read as "stars drifting
  // against the globe".
  const globeMotionX = React.useMemo(() => {
    if (!globeOffset) return 0;
    // Globe theta is intentionally subtle, so we convert it into the dominant
    // horizontal parallax while keeping phi as the vertical counterpart.
    return -(globeOffset.theta * 320 + globeOffset.phi * 180);
  }, [globeOffset]);

  const globeMotionY = React.useMemo(() => {
    if (!globeOffset) return 0;
    // Vertical star drift is mainly fed by phi so auto-orbit and drag stay
    // in clear opposition to the globe's camera motion.
    return -(globeOffset.phi * 180 + globeOffset.theta * 90);
  }, [globeOffset]);

  const containerClassName = cn("relative size-full overflow-hidden", className);
  const containerStyle: React.CSSProperties = {};

  return (
    <div
      data-slot="stars-background"
      className={containerClassName}
      style={{
        ...containerStyle,
        background: backgroundStyle,
      }}
      onMouseMove={handleMouseMove}
      {...props}>
      <motion.div style={{ x: springX, y: springY }}>
        <StarLayer
          count={1500}
          size={1}
          transition={{
            repeat: Infinity,
            duration: speed,
            ease: "linear",
          }}
          isLight={isLight}
        />
        <StarLayer
          count={650}
          size={2}
          transition={{
            repeat: Infinity,
            duration: speed * 2,
            ease: "linear",
          }}
          isLight={isLight}
        />
        <StarLayer
          count={300}
          size={3}
          transition={{
            repeat: Infinity,
            duration: speed * 3,
            ease: "linear",
          }}
          isLight={isLight}
        />
      </motion.div>

      {/* Opposite-direction drift tied to globe motion (manual + auto) */}
      <motion.div
        data-slot="globe-parallax"
        style={{
          x: globeMotionX,
          y: globeMotionY,
        }}
        transition={{
          duration: 120,
          ease: "linear",
        }}>
        {/* invisible anchor so the layer exists only to carry the parallax transform */}
      </motion.div>

      {children}
    </div>
  );
}
