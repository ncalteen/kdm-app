'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ComponentProps, ReactElement, ReactNode } from 'react'

/**
 * Theme Provider Properties
 */
interface ThemeProviderProps extends ComponentProps<typeof NextThemesProvider> {
  /** Children elements */
  children: ReactNode
}

/**
 * Theme Provider Component
 *
 * Wraps the application with next-themes provider to enable theme switching.
 *
 * @param props Theme Provider Properties
 * @returns Theme Provider Component
 */
export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps): ReactElement {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
