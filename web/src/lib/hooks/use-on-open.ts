import { useEffect, useRef } from 'react'

/**
 * Runs `callback` whenever `open` transitions from `false` to `true`.
 * Does not fire on the initial render regardless of `open`'s value.
 */
export function useOnOpen(open: boolean, callback: () => void) {
  const prev = useRef(open)

  useEffect(() => {
    if (open && !prev.current) {
      callback()
    }
    prev.current = open
  }, [open, callback])
}
