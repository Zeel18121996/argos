// Re-export from @/app/store. Keeps existing `@/hooks/useRedux` imports
// working but consolidates the typed hooks to a single source of truth.
// New code should import directly from '@/app/store'.
export { useAppDispatch, useAppSelector } from '@/app/store'
