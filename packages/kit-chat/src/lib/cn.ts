import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'
import { TEXT_TOKENS } from '@hollis-labs/design-tokens'

// Without the contract's type scale, tailwind-merge treats text-control as a
// color and removes it beside text-fg. The consumer then inherits 16px even
// though Tailwind emitted the right utility. Keep this package's overrides
// token-aware until the shared primitive helper adopts the same vocabulary.
const merge = extendTailwindMerge({
  extend: { classGroups: { 'font-size': [{ text: [...TEXT_TOKENS] }] } },
})

export function cn(...inputs: ClassValue[]) {
  return merge(clsx(inputs))
}
