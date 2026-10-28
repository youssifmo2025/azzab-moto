import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PwaInstallPrompt } from '@/shared/ui/PwaInstallPrompt'
import { storage } from '@/shared/lib/storage'

describe('PWA Install Prompt', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('does NOT render if page visits count is less than 3', () => {
    storage.pageVisits.set(1)

    render(
      <MemoryRouter initialEntries={['/']}>
        <PwaInstallPrompt />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders soft prompt when page visits reach 3 or more', async () => {
    storage.pageVisits.set(2)

    render(
      <MemoryRouter initialEntries={['/catalog']}>
        <PwaInstallPrompt />
      </MemoryRouter>,
    )

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText(/تثبيت تطبيق عزاب موتو/i)).toBeInTheDocument()
  })

  it('permanently dismisses when clicking "لاحقاً"', async () => {
    storage.pageVisits.set(3)

    render(
      <MemoryRouter initialEntries={['/catalog']}>
        <PwaInstallPrompt />
      </MemoryRouter>,
    )

    const dismissBtn = await screen.findByText('لاحقاً')
    fireEvent.click(dismissBtn)

    await waitFor(() => {
      expect(storage.pwaDismissed.get()).toBe(true)
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('never shows prompt if previously dismissed, even with high visit counts', () => {
    storage.pageVisits.set(15)
    storage.pwaDismissed.set(true)

    render(
      <MemoryRouter initialEntries={['/']}>
        <PwaInstallPrompt />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
