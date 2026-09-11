import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * `cn()` comes from sysop-ui's `lib/utils.ts`, which the CW-0116 triage split by
 * measurement rather than by argument: this goes here because every component
 * needs it and no transport code does, and the four display formatters that
 * shared the file went to `design-app-runtime` because **zero kit components use
 * them** — verified. Nothing was left behind; the other half is
 * `@hollis-labs/design-app-runtime`'s `lib/format.ts`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
