/** Applied to the outer draggable element to opt-in to touch gesture handling. */
export const TOUCH_GESTURE_CLASS = "touch-gesture"

/** Applied to the content area inside a touch gesture to suppress text selection during drag. */
export const TOUCH_GESTURE_CONTENT_CLASS = "touch-gesture-content"

/**
 * Captures the pointer on an element so that all subsequent pointer events
 * (move, up, cancel) are delivered to it regardless of where the cursor goes.
 * This is essential for drag gestures that leave the original target.
 */
export function capturePointer(
  element: HTMLElement | null | undefined,
  pointerId: number,
) {
  element?.setPointerCapture(pointerId);
}
