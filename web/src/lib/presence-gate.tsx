import { useCallback, useState, type ReactNode } from 'react'

interface PresenceGateProps {
  children: (props: {
    isPresent: boolean
    gate: { onPointerDownCapture: (e: React.PointerEvent) => void }
  }) => ReactNode
}

/**
 * Wraps AnimatePresence children so that interaction (pointer events) is
 * released in the same commit that starts the exit, not when the exit ends.
 */
export function PresenceGate({ children }: PresenceGateProps) {
  const [present, setPresent] = useState(true)

  // The gate blocks pointer events once the exit begins.
  const gate = {
    onPointerDownCapture: () => {
      // Once triggered, mark as not present to block interaction.
      setPresent(false)
    },
  }

  return <>{children({ isPresent: present, gate })}</>
}
