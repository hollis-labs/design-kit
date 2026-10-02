import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useControllableState } from '../lib/use-controllable-state'

describe('useControllableState', () => {
  it('holds its own state when uncontrolled, starting from defaultProp', () => {
    const { result } = renderHook(() => useControllableState({ defaultProp: 'a' }))
    expect(result.current[0]).toBe('a')
    act(() => result.current[1]('b'))
    expect(result.current[0]).toBe('b')
  })

  it('reports changes through onChange in uncontrolled mode', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControllableState({ defaultProp: 0, onChange }))
    act(() => result.current[1](1))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('does not fire onChange for a set to the value already held', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControllableState({ defaultProp: 'x', onChange }))
    act(() => result.current[1]('x'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('follows prop when controlled and does not change until the prop does', () => {
    const onChange = vi.fn()
    const { result, rerender } = renderHook(
      ({ prop }: { prop: string }) => useControllableState({ prop, defaultProp: 'default', onChange }),
      { initialProps: { prop: 'one' } },
    )
    expect(result.current[0]).toBe('one')
    act(() => result.current[1]('two'))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('two')
    expect(result.current[0]).toBe('one') // the host has not accepted it
    rerender({ prop: 'two' })
    expect(result.current[0]).toBe('two')
  })

  it('accepts an updater function and lets two sets in one event see each other', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControllableState({ defaultProp: 0, onChange }))
    act(() => {
      result.current[1]((n) => n + 1)
      result.current[1]((n) => n + 1)
    })
    expect(result.current[0]).toBe(2)
    expect(onChange).toHaveBeenNthCalledWith(2, 2)
  })

  it('keeps setValue stable across renders and always calls the latest onChange', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { result, rerender } = renderHook(
      ({ onChange }: { onChange: (v: number) => void }) => useControllableState({ defaultProp: 0, onChange }),
      { initialProps: { onChange: first } },
    )
    const setter = result.current[1]
    rerender({ onChange: second })
    expect(result.current[1]).toBe(setter)
    act(() => setter(5))
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledWith(5)
  })
})
