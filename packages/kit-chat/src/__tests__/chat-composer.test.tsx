import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChatComposer } from '../components/chat-composer'

afterEach(cleanup)
const box = () => screen.getByRole('combobox') as HTMLTextAreaElement
const type = (v: string) => fireEvent.change(box(), { target: { value: v } })
const enter = () => fireEvent.keyDown(box(), { key: 'Enter' })

describe('ChatComposer', () => {
  it('owns the draft and clears after a successful submit', () => {
    const onSubmit = vi.fn()
    render(<ChatComposer onSubmit={onSubmit} />)
    type('  hello ')
    enter()
    expect(onSubmit).toHaveBeenCalledWith('hello')
    expect(box().value).toBe('')
  })
  it('keeps the draft when the host returns false or the send rejects', async () => {
    const onSubmit = vi.fn().mockReturnValueOnce(false).mockRejectedValueOnce(new Error('x')).mockResolvedValueOnce(undefined)
    render(<ChatComposer onSubmit={onSubmit} />)
    type('hi'); enter()
    expect(box().value).toBe('hi')
    enter()
    await Promise.resolve(); await Promise.resolve()
    expect(box().value).toBe('hi')
    enter()
    await waitFor(() => expect(box().value).toBe(''))
  })
  it('does not submit an empty draft and does not re-render on parent renders', () => {
    const onSubmit = vi.fn()
    const { rerender } = render(<ChatComposer onSubmit={onSubmit} />)
    enter()
    expect(onSubmit).not.toHaveBeenCalled()
    type('keep')
    rerender(<ChatComposer onSubmit={onSubmit} />)
    expect(box().value).toBe('keep')
  })
})
