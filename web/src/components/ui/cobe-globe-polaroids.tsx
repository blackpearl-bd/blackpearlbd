"use client"

import { useEffect, useRef, useCallback } from "react"
import createGlobe from "cobe"

interface PolaroidMarker {
  id: string
  location: [number, number]
  image: string
  caption: string
  rotate: number
  /** Horizontal offset (%) from the marker so polaroids scatter instead of stacking in a neat crown */
  offsetX?: number
}

interface GlobePolaoridsProps {
  markers?: PolaroidMarker[]
  className?: string
  speed?: number
}

const defaultMarkers: PolaroidMarker[] = [
  // Americas
  { id: "polaroid-sf", location: [37.78, -122.44], image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=120&h=120&fit=crop", caption: "San Francisco", rotate: -8, offsetX: -35 },
  { id: "polaroid-niagara", location: [43.08, -79.07], image: "https://images.unsplash.com/photo-1602080858428-57174f9431cf?w=120&h=120&fit=crop", caption: "Niagara Falls", rotate: 4, offsetX: 35 },
  { id: "polaroid-nyc", location: [40.71, -74.01], image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=120&h=120&fit=crop", caption: "New York", rotate: 6, offsetX: -65 },
  { id: "polaroid-amazon", location: [-3.12, -60.02], image: "https://images.unsplash.com/photo-1536147116438-62679a5e01f2?w=120&h=120&fit=crop", caption: "Amazon", rotate: -6, offsetX: -10 },
  { id: "polaroid-rio", location: [-22.91, -43.17], image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=120&h=120&fit=crop", caption: "Rio de Janeiro", rotate: 6, offsetX: -45 },
  // Europe
  { id: "polaroid-paris", location: [48.86, 2.35], image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=120&h=120&fit=crop", caption: "Paris", rotate: -6, offsetX: 0 },
  // Africa & Middle East
  { id: "polaroid-capetown", location: [-33.92, 18.42], image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=120&h=120&fit=crop", caption: "Cape Town", rotate: 8, offsetX: -70 },
  { id: "polaroid-dubai", location: [25.20, 55.27], image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=120&h=120&fit=crop", caption: "Dubai", rotate: -6, offsetX: -60 },
  // South & Southeast Asia, Oceania
  { id: "polaroid-agra", location: [27.17, 78.04], image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=120&h=120&fit=crop", caption: "Agra", rotate: -5, offsetX: -30 },
  { id: "polaroid-bali", location: [-8.34, 115.09], image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=120&h=120&fit=crop", caption: "Bali", rotate: -4, offsetX: -60 },
  { id: "polaroid-tokyo", location: [35.68, 139.65], image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=120&h=120&fit=crop", caption: "Tokyo", rotate: -5, offsetX: -40 },
  { id: "polaroid-sydney", location: [-33.87, 151.21], image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=120&h=120&fit=crop", caption: "Sydney", rotate: 8, offsetX: -70 },
]

export function GlobePolaroids({
  markers = defaultMarkers,
  className = "",
  speed = 0.003,
  onMotionChange,
  onSelect,
}: GlobePolaoridsProps & {
  onMotionChange?: (offset: { phi: number; theta: number } | null) => void;
  /** Called when a visible polaroid is clicked (hidden ones are not clickable) */
  onSelect?: (marker: PolaroidMarker) => void;
} = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
      onMotionChange?.({ phi: phiOffsetRef.current, theta: thetaOffsetRef.current })
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let phi = 0

    function init() {
      // Read the live ref: React can replace the canvas node between effect
      // runs, and a stale closure would initialize a detached element.
      const el = canvasRef.current
      if (!el || globe) return
      const width = el.offsetWidth
      if (width === 0) return

      globe = createGlobe(el, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width, height: width,
        phi: 0, theta: 0.2, dark: 0, diffuse: 1.5,
        mapSamples: 16000, mapBrightness: 9,
        baseColor: [1, 1, 1],
        markerColor: [0.4, 0.6, 0.9],
        glowColor: [0.94, 0.93, 0.91],
        markerElevation: 0,
        markers: markers.map((m) => ({ location: m.location, size: 0.02, id: m.id })),
        arcs: [], arcColor: [0.5, 0.7, 1],
        arcWidth: 0.5, arcHeight: 0.25, opacity: 0.7,
      })

      function animate() {
        if (!isPausedRef.current) phi += speed
        const currentPhi = phi + phiOffsetRef.current + dragOffset.current.phi
        const currentTheta = 0.2 + thetaOffsetRef.current + dragOffset.current.theta
        if (onMotionChange) {
          onMotionChange({ phi: currentPhi, theta: currentTheta })
        }
        globe!.update({
          phi: currentPhi,
          theta: currentTheta,
        })
        animationId = requestAnimationFrame(animate)
      }

      animate()
      setTimeout(() => el && (el.style.opacity = "1"))
    }

    let mounted = true
    const ro = new ResizeObserver((entries) => {
      if (!mounted) return
      const width = entries[0]?.contentRect.width ?? 0
      // init() is idempotent (guarded by `globe`), so no need to disconnect.
      if (width > 0) init()
    })
    ro.observe(canvas)

    // Belt-and-braces: the RO can end up observing a replaced canvas node and
    // never fire again, leaving the globe uninitialized. Poll the live ref.
    const retry = setInterval(() => {
      if (!mounted) {
        clearInterval(retry)
        return
      }
      if (globe || !canvasRef.current) return
      if (canvasRef.current.offsetWidth > 0) init()
    }, 300)

    return () => {
      mounted = false
      ro.disconnect()
      clearInterval(retry)
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [markers, speed])

  return (
    <div className={`relative aspect-square select-none ${className}`} style={{ zIndex: 1 }}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%", height: "100%", cursor: "grab", opacity: 0,
          transition: "opacity 1.2s ease", borderRadius: "50%", touchAction: "none",
        }}
      />
      {markers.map((m) => (
        <div
          key={m.id}
          style={{
            position: "absolute",
            positionAnchor: `--cobe-${m.id}`,
            bottom: "anchor(top)",
            left: "anchor(center)",
            translate: `${m.offsetX ?? -50}% 0`,
            marginBottom: 5,
            transform: `rotate(${m.rotate}deg)`,
            // Root never captures the pointer (so globe dragging works around
            // invisible polaroids); the inner button re-enables hit testing.
            pointerEvents: "none" as const,
            opacity: `var(--cobe-visible-${m.id}, 0)`,
            filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
            transition: "opacity 0.3s, filter 0.3s",
          }}
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label={`View tour deals in ${m.caption}`}
            className="block cursor-pointer bg-white transition-transform duration-200 scale-75 sm:scale-90 md:scale-100 hover:scale-105 focus:outline-none"
            style={{
              padding: "6px 6px 24px",
              boxShadow: "0 3px 10px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.12)",
              pointerEvents: "auto" as const,
            }}
            onClick={(e) => {
              // Ignore clicks on polaroids that are faded out (facing away)
              const card = e.currentTarget.parentElement;
              const visible = card ? parseFloat(getComputedStyle(card).opacity) > 0.5 : false;
              if (visible) onSelect?.(m);
            }}
          >
            <img
              src={m.image}
              alt=""
              style={{ display: "block", width: 58, height: 58, objectFit: "cover" }}
            />
            <span style={{
              position: "absolute", bottom: 5, left: 0, right: 0,
              textAlign: "center", fontFamily: "system-ui, sans-serif",
              fontSize: "0.625rem", fontWeight: 500, color: "#333", letterSpacing: "0.02em",
            }}>{m.caption}</span>
          </button>
        </div>
      ))}
    </div>
  )
}
