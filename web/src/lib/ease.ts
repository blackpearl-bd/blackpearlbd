// Standard ease-out curve for smooth deceleration
export const EASE_OUT = [0, 0, 0.2, 1] as const

// Spring used for layout transitions (position, size)
export const SPRING_LAYOUT = { type: "spring" as const, duration: 0.45, bounce: 0.15 }

// Spring used for press/tap feedback
export const SPRING_PRESS = { type: "spring" as const, duration: 0.3, bounce: 0.1 }

// Spring used for smooth glide transitions (tab position, surface)
export const SPRING_GLIDE = { type: "spring" as const, duration: 0.5, bounce: 0.1 }
