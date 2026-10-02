import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Controlled/uncontrolled state in one hook — the local replacement for Radix's
 * `useControllableState`, which AI Elements imports and Base UI has no public
 * equivalent of.
 *
 * A value is *controlled* when `prop` is not `undefined`. That is Radix's rule, kept
 * so ported components behave the same, and it has one consequence worth knowing:
 * a controlled value of `undefined` ("nothing selected") is indistinguishable from
 * uncontrolled. Pass `null` as the empty controlled value if you need the difference.
 *
 * `onChange` fires when the value actually changes, in both modes, and never for a
 * set to the value already held.
 */
export interface UseControllableStateParams<T> {
  readonly prop?: T | undefined
  readonly defaultProp: T
  readonly onChange?: ((value: T) => void) | undefined
}

export type SetControllableState<T> = (next: T | ((previous: T) => T)) => void

export function useControllableState<T>({
  prop,
  defaultProp,
  onChange,
}: UseControllableStateParams<T>): [T, SetControllableState<T>] {
  const [uncontrolled, setUncontrolled] = useState<T>(defaultProp)
  const isControlled = prop !== undefined
  const value = isControlled ? (prop as T) : uncontrolled

  // Refs let `setValue` keep a stable identity while always seeing the latest props.
  // They are synced in an effect, not during render.
  const valueRef = useRef(value)
  const controlledRef = useRef(isControlled)
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    valueRef.current = value
    controlledRef.current = isControlled
    onChangeRef.current = onChange
  })

  const setValue = useCallback<SetControllableState<T>>((next) => {
    const resolved = typeof next === 'function' ? (next as (previous: T) => T)(valueRef.current) : next
    if (Object.is(resolved, valueRef.current)) return
    if (!controlledRef.current) {
      // Uncontrolled: record it now so two sets in one event see each other.
      valueRef.current = resolved
      setUncontrolled(resolved)
    }
    onChangeRef.current?.(resolved)
  }, [])

  return [value, setValue]
}
