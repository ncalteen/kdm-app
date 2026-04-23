import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Laptop, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useTransition } from 'react'

/**
 * Theme Switcher
 *
 * Dropdown control that lets the player toggle between light, dark, and system
 * color schemes via `next-themes`. Defers the active theme update inside
 * `startTransition` to avoid cascading re-renders, and renders nothing on the
 * first paint until `next-themes` has resolved the active theme.
 *
 * @returns Theme Switcher Component
 */
const ThemeSwitcher = () => {
  const [, startTransition] = useTransition()
  const { theme, setTheme } = useTheme()

  // Use startTransition to defer the theme value update and avoid cascading
  // renders
  if (theme === undefined) {
    // Wait for theme to be defined by next-themes
    startTransition(() => {})
    return null
  }

  const ICON_SIZE = 16

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={'sm'}>
          {theme === 'light' ? (
            <Sun
              key="light"
              size={ICON_SIZE}
              className={'text-muted-foreground'}
            />
          ) : theme === 'dark' ? (
            <Moon
              key="dark"
              size={ICON_SIZE}
              className={'text-muted-foreground'}
            />
          ) : (
            <Laptop
              key="system"
              size={ICON_SIZE}
              className={'text-muted-foreground'}
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-content" align="start">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(e) => setTheme(e)}>
          <DropdownMenuRadioItem className="flex gap-2" value="light">
            <Sun size={ICON_SIZE} className="text-muted-foreground" /> Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="dark">
            <Moon size={ICON_SIZE} className="text-muted-foreground" /> Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="system">
            <Laptop size={ICON_SIZE} className="text-muted-foreground" /> System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ThemeSwitcher }
