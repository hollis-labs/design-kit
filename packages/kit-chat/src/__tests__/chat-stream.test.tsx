import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { useStallDetector } from '../lib/use-stall-detector'
import { ChatStream } from '../components/chat-stream'
import type { ChatItem } from '../lib/types'

const items: readonly ChatItem[] = [
  { kind: 'message', id: 'm1', role: 'user', content: 'ping', author: 'chrispian' },
  { kind: 'marker', id: 'k1', variant: 'date', label: 'Today' },
  { kind: 'message', id: 'm2', role: 'assistant', content: 'pong' },
]

describe('ChatStream', () => {
  it('renders every item the host gives it, in order', () => {
    render(<ChatStream items={items} />)
    expect(screen.getByText('ping')).toBeDefined()
    expect(screen.getByText('Today')).toBeDefined()
    expect(screen.getByText('pong')).toBeDefined()
  })

  it('renders the empty slot only when there is nothing at all', () => {
    const { rerender } = render(<ChatStream items={[]} empty={<span>Nothing yet</span>} />)
    expect(screen.getByText('Nothing yet')).toBeDefined()

    rerender(<ChatStream items={items} empty={<span>Nothing yet</span>} />)
    expect(screen.queryByText('Nothing yet')).toBeNull()
  })

  it('does NOT show the empty slot while a reply is streaming into an empty thread', () => {
    render(
      <ChatStream
        items={[]}
        empty={<span>Nothing yet</span>}
        status={{ status: 'streaming', role: 'assistant', content: 'thinking' }}
      />,
    )
    expect(screen.queryByText('Nothing yet')).toBeNull()
    expect(screen.getByText('thinking')).toBeDefined()
  })

  it('renders streaming content OUTSIDE the item list — it is not a message yet', () => {
    const { container } = render(
      <ChatStream items={items} status={{ status: 'streaming', role: 'assistant', content: 'partial' }} />,
    )
    expect(container.querySelectorAll('[data-slot="chat-stream-item"]')).toHaveLength(3)
    expect(container.querySelector('[data-slot="chat-stream-streaming"]')).not.toBeNull()
  })

  it('marks the streaming row stalled, and says so to a screen reader', () => {
    const { container } = render(
      <ChatStream items={items} status={{ status: 'stalled', role: 'assistant', content: 'partial' }} />,
    )
    const row = container.querySelector('[data-slot="chat-stream-streaming"]')
    expect(row?.hasAttribute('data-stalled')).toBe(true)
    expect(screen.getByRole('status')).toBeDefined()
  })

  it('renders an error as an alert rather than as a message', () => {
    render(<ChatStream items={items} status={{ status: 'error', message: 'stream failed' }} />)
    const alert = screen.getByRole('alert')
    expect(alert.textContent).toBe('stream failed')
  })

  it('lets the host replace item rendering entirely — the seam CW-0129 composes against', () => {
    render(<ChatStream items={items} renderItem={(item) => <div>custom:{item.id}</div>} />)
    expect(screen.getByText('custom:m1')).toBeDefined()
    expect(screen.getByText('custom:k1')).toBeDefined()
    expect(screen.queryByText('ping')).toBeNull()
  })
})

describe('useStallDetector', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  function Probe({ signal, afterMs }: { signal: string | null; afterMs?: number }) {
    const stalled = useStallDetector(signal, afterMs)
    return <span data-testid="s">{String(stalled)}</span>
  }

  it('is not stalled before the threshold', () => {
    render(<Probe signal="a" afterMs={2000} />)
    act(() => { vi.advanceTimersByTime(1999) })
    expect(screen.getByTestId('s').textContent).toBe('false')
  })

  it('becomes stalled once the threshold passes with no new signal', () => {
    render(<Probe signal="a" afterMs={2000} />)
    act(() => { vi.advanceTimersByTime(2000) })
    expect(screen.getByTestId('s').textContent).toBe('true')
  })

  it('clears the moment a new token arrives', () => {
    const { rerender } = render(<Probe signal="a" afterMs={2000} />)
    act(() => { vi.advanceTimersByTime(2000) })
    expect(screen.getByTestId('s').textContent).toBe('true')

    rerender(<Probe signal="ab" afterMs={2000} />)
    expect(screen.getByTestId('s').textContent).toBe('false')
  })

  it('reports not-stalled when there is no stream at all', () => {
    render(<Probe signal={null} afterMs={2000} />)
    act(() => { vi.advanceTimersByTime(10_000) })
    expect(screen.getByTestId('s').textContent).toBe('false')
  })
})
