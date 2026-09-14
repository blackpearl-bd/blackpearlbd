import React, { useCallback, useEffect, useRef, useState } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";

/**
 * "How it works" pinned-card zigzag timeline (adapted from the 21st.dev
 * how-it-works component).
 *
 * Adaptations for this codebase (Tailwind v3):
 * - Arbitrary values like `rounded-[25px]`, `mb-[10px]`, `pb-25` were replaced
 *   with v3-safe equivalents; the custom tilt is applied via inline transform
 *   (v3 has no rotate-8 utility).
 * - The connector path is computed from actual card anchor points (measured
 *   with ResizeObserver) so it stays glued to the pins for ANY number of
 *   steps, instead of the original five hard-coded bezier segments.
 * - The ambient fades and notebook grid use the shadcn `background` token so
 *   the section blends into any page surface (light + dark).
 */

export interface Step {
  title: string;
  description: string;
  colorTheme?: "orange" | "blue" | "purple";
  colors?: {
    bg: string;
    text: string;
    border: string;
  };
}

export interface StepPosition {
  className?: string;
  rotate?: string;
}

export interface HowItWorksProps {
  features?: Step[];
  className?: string;
  stepPositions?: StepPosition[];
}

const Pin = ({ className, ...rest }: { className?: string } & React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...rest}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M16 3a1 1 0 0 1 .117 1.993l-.117 .007v4.764l1.894 3.789a1 1 0 0 1 .1 .331l.006 .116v2a1 1 0 0 1 -.883 .993l-.117 .007h-4v4a1 1 0 0 1 -1.993 .117l-.007 -.117v-4h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-2a1 1 0 0 1 .06 -.34l.046 -.107l1.894 -3.791v-4.762a1 1 0 0 1 -.117 -1.993l.117 -.007h8z" />
  </svg>
);

const Card = ({
  number,
  title,
  description,
  colorTheme = "blue",
  className,
  rotate,
  colors: customColors,
}: CardProps) => {
  const defaultBgColors = {
    orange: "bg-orange-50 dark:bg-orange-500/10",
    blue: "bg-blue-50 dark:bg-blue-500/10",
    purple: "bg-purple-50 dark:bg-purple-500/10",
  };
  const defaultTextColors = {
    orange: "text-orange-500 dark:text-orange-400",
    blue: "text-blue-600 dark:text-blue-400",
    purple: "text-purple-600 dark:text-purple-400",
  };
  const defaultBorderColors = {
    orange: "border-orange-100 dark:border-orange-500/20",
    blue: "border-blue-100 dark:border-blue-500/20",
    purple: "border-purple-100 dark:border-purple-500/20",
  };

  const bgColor = customColors?.bg || defaultBgColors[colorTheme];
  const textColor = customColors?.text || defaultTextColors[colorTheme];
  const borderColor = customColors?.border || defaultBorderColors[colorTheme];

  const tiltStyle: React.CSSProperties | undefined = rotate
    ? { transform: `rotate(${parseFloat(rotate) || 0}deg)` }
    : undefined;

  const reduceMotion = useReducedMotion();

  return (
    <m.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -64 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={
        reduceMotion
          ? { duration: 0.25 }
          : { type: "spring", stiffness: 190, damping: 18 }
      }
      className={`relative w-full md:w-[340px] hover:z-30 ${className ?? ""}`}
    >
      {/* Tilt lives on its own layer: an inline transform here would otherwise
          override the hover:scale-105 utility on the same element. */}
      <div style={tiltStyle}>
        <div className="bg-white dark:bg-neutral-900 p-2 rounded-3xl shadow-[0px_10px_20px_0px_#D3D3D3] dark:shadow-none border border-neutral-100 dark:border-neutral-800 transition-transform duration-300 hover:scale-105">
          {/* The pin lands just after the card, like it is being pinned in. */}
          <m.div
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -22, scale: 1.15 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={
              reduceMotion
                ? { duration: 0.25, delay: 0.1 }
                : { type: "spring", stiffness: 380, damping: 13, delay: 0.1 }
            }
          >
            {/* data-pin-anchor marks the connector waypoint for the desktop path */}
            <Pin data-pin-anchor="" className={`w-8 h-8 ${textColor} z-20 mb-6 mx-auto`} />
          </m.div>
        <div
          className={`${bgColor} border ${borderColor} rounded-2xl p-4 h-full flex flex-col relative overflow-hidden`}
        >
          <span
            className={`${textColor} text-4xl font-bold mb-5`}
            style={{
              fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
            }}
          >
            {number}
          </span>
          <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 leading-none mb-2.5">
            {title}
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-5 tracking-tight">
            {description}
          </p>
          </div>
        </div>
      </div>
    </m.div>
  );
};

interface CardProps {
  number: string;
  title: string;
  description: string;
  colorTheme?: "orange" | "blue" | "purple";
  className?: string;
  rotate?: string;
  colors?: {
    bg: string;
    text: string;
    border: string;
  };
}

/** Mobile stacks every card with generous rhythm (v3-safe spacing scale). */
const MOBILE_GAP = "space-y-10";

/**
 * Lays cards out in alternating rows on desktop and computes the dashed
 * connector path between pin anchors dynamically.
 */
/** Matches Tailwind's `md:` breakpoint (768 px). */
function useIsMobile() {
  const [mobile, setMobile] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth < 768;
  });
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767.98px)");
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return mobile;
}

export default function HowItWorks({
  features,
  className,
  stepPositions,
}: HowItWorksProps) {
  const data = features && features.length > 0 ? features : [];
  const positions = stepPositions || [];
  const isMobile = useIsMobile();

  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [drawProgress, setDrawProgress] = useState(0);
  const [size, setSize] = useState({ width: 1000, height: 400 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setSize({ width: rect.width, height: rect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Compute pin anchor points (top-center of each card) in container
  // coordinates and draw a smooth dashed connector through them.
  const [anchors, setAnchors] = useState<Array<{ x: number; y: number }>>([]);
  useEffect(() => {
    const el = containerRef.current;
    if (!el || data.length === 0) return;
    const measure = () => {
      const base = el.getBoundingClientRect();
      const points: Array<{ x: number; y: number }> = [];
      el.querySelectorAll<HTMLElement>("[data-pin-anchor]").forEach((pin) => {
        const r = pin.getBoundingClientRect();
        points.push({
          x: r.left - base.left + r.width / 2,
          y: r.top - base.top + r.height / 2,
        });
      });
      setAnchors(points);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    // Re-measure once fonts/images settle.
    const t = setTimeout(measure, 300);
    return () => {
      observer.disconnect();
      clearTimeout(t);
    };
  }, [data.length, size.width, size.height]);

  // Measure the SVG path length whenever anchors change so the
  // stroke-dasharray / stroke-dashoffset draw-on animation can span
  // the full connector.
  useEffect(() => {
    const path = pathRef.current;
    if (path) setPathLength(path.getTotalLength());
  }, [anchors]);

  // Drive the draw-on progress from the container's scroll position.
  // 0 = top of section visible, 1 = section fully scrolled past.
  const measureDraw = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    // Start drawing when the top of the section enters the viewport;
    // finish when the bottom leaves.
    const raw = 1 - rect.bottom / (vh + rect.height);
    setDrawProgress(Math.min(1, Math.max(0, raw)));
  }, []);

  useEffect(() => {
    measureDraw();
    window.addEventListener("scroll", measureDraw, { passive: true });
    window.addEventListener("resize", measureDraw, { passive: true });
    return () => {
      window.removeEventListener("scroll", measureDraw);
      window.removeEventListener("resize", measureDraw);
    };
  }, [measureDraw]);

  // On mobile, snap every anchor x-coordinate to the container center
  // so the connector is perfectly vertical between the centered pins.
  const resolvedAnchors = isMobile
    ? anchors.map((a) => ({ x: size.width / 2, y: a.y }))
    : anchors;

  const buildPath = (
    points: Array<{ x: number; y: number }>,
    vertical: boolean,
  ) => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const curr = points[i];
      if (vertical) {
        // Straight vertical line – no curves on mobile.
        d += ` L ${curr.x} ${curr.y}`;
      } else {
        const prev = points[i - 1];
        const midY = (prev.y + curr.y) / 2;
        d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
      }
    }
    return d;
  };

  if (data.length === 0) return null;

  return (
    <LazyMotion features={domAnimation}>
      <div
        className={`bg-background max-md:pt-10 max-md:pb-20 md:py-16 px-4 sm:px-8 relative ${className ?? ""}`}
      >
        {/* Notebook grid backdrop */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.15]"
          style={{
            backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "100% 32px",
            marginTop: "4px",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-[0.1]"
          style={{
            backgroundImage: "linear-gradient(hsl(var(--background)) 1px, transparent 1px)",
            backgroundSize: "100% 32px",
            marginTop: "4px",
          }}
        />
        {/* Soft edges into the page background */}
        <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r" />
        <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div
            ref={containerRef}
            className={`relative w-full max-w-[1000px] mx-auto flex flex-col ${MOBILE_GAP} md:space-y-0 h-auto`}
          >
            {/* Connector drawn on all breakpoints: on desktop it follows the
                zigzag between card rows; on mobile it becomes a vertical line
                linking the centered pins, visible in the gaps between cards. */}
            {data.length > 1 && anchors.length >= 2 && (
              <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible"
                width={size.width}
                height={size.height}
                viewBox={`0 0 ${Math.max(size.width, 1)} ${Math.max(size.height, 1)}`}
                preserveAspectRatio="none"
              >
                {/* Subtle dashed guide always visible */}
                <path
                  d={buildPath(resolvedAnchors, isMobile)}
                  stroke="currentColor"
                  className="text-neutral-200 dark:text-neutral-800"
                  strokeWidth="2"
                  strokeDasharray="8 6"
                  fill="none"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Draw-on overlay: solid line revealed by scroll progress */}
                <path
                  ref={pathRef}
                  d={buildPath(resolvedAnchors, isMobile)}
                  stroke="currentColor"
                  className="text-neutral-400 dark:text-neutral-500"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray={pathLength || undefined}
                  strokeDashoffset={pathLength ? pathLength * (1 - drawProgress) : undefined}
                  style={{ transition: "stroke-dashoffset 0.08s linear" }}
                />
              </svg>
            )}

            {data.map((step, index) => {
              const position = positions[index % Math.max(positions.length, 1)];
              const left = index % 2 === 0;
              return (
                <div
                  key={`${step.title}-${index}`}
                  className="md:w-full md:flex md:justify-start"
                >
                  <div className={left ? "md:pl-[12%]" : "md:pl-[52%]"}>
                    <Card
                      number={`0${index + 1}`}
                      title={step.title}
                      description={step.description}
                      colorTheme={step.colorTheme || "blue"}
                      colors={step.colors}
                      rotate={position?.rotate ?? (left ? "1.5" : "-1.5")}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </LazyMotion>
  );
}
