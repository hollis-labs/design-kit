import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DataTable } from '../components/data-table/data-table'
import { OperationsTablePage } from '../components/layout/operations-table-page'
import type { ColumnDef } from '@hollis-labs/design-components'

const items = [{ id: 'z', title: 'Zulu' }, { id: 'a', title: 'Alpha' }]
const getRowId = (item: (typeof items)[number]) => item.id
const columns: ColumnDef<(typeof items)[number]>[] = [
  { key: 'title', header: 'Task', width: 'fill', cell: (item) => item.title, sortValue: (item) => item.title },
]

describe('operations composition', () => {
  it('publishes rendered order after sorting and reports sort direction accessibly', () => {
    const onVisibleOrderChange = vi.fn()
    const { getByRole } = render(<DataTable items={items} columns={columns} getRowId={getRowId} onVisibleOrderChange={onVisibleOrderChange} />)
    expect(onVisibleOrderChange).toHaveBeenLastCalledWith(['z', 'a'])
    fireEvent.click(getByRole('button', { name: /Task/ }))
    expect(onVisibleOrderChange).toHaveBeenLastCalledWith(['a', 'z'])
    expect(getByRole('columnheader').getAttribute('aria-sort')).toBe('ascending')
    fireEvent.click(getByRole('button', { name: /Task/ }))
    expect(onVisibleOrderChange).toHaveBeenLastCalledWith(['z', 'a'])
    expect(getByRole('columnheader').getAttribute('aria-sort')).toBe('descending')
  })

  it('publishes new filter results rather than stale ids', () => {
    const onVisibleOrderChange = vi.fn()
    const { rerender } = render(<DataTable items={items} columns={columns} getRowId={getRowId} onVisibleOrderChange={onVisibleOrderChange} />)
    rerender(<DataTable items={items.slice(1)} columns={columns} getRowId={getRowId} onVisibleOrderChange={onVisibleOrderChange} />)
    expect(onVisibleOrderChange).toHaveBeenLastCalledWith(['a'])
  })

  it('keeps request errors distinct from empty results while retaining pinned controls', () => {
    const { getByText, queryByRole } = render(<OperationsTablePage title="Operations" searchQuery="" onSearchChange={() => {}} items={[]} columns={columns} getRowId={getRowId} errorState={<p>Request failed</p>} emptyState={<p>No matches</p>} footer={<p>Result controls</p>} />)
    expect(getByText('Request failed')).toBeTruthy()
    expect(getByText('Result controls')).toBeTruthy()
    expect(queryByRole('table')).toBeNull()
  })
})
