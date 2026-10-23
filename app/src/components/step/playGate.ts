import { createContext } from 'react'

/**
 * Tells a scene whether it may play yet. `open` is false until the step reaches its `play` sentence;
 * `epoch` goes up every time a step is entered, so a scene replays from t = 0 when it comes back.
 */
export const PlayGate = createContext<{ open: boolean; epoch: number } | null>(null)
