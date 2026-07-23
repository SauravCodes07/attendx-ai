import { useEffect, useState } from 'react'
import type { ThemePreference } from '../types'
import { supabase } from '../supabase'

export function useTheme(profileId?: string, initialPreference: ThemePreference = 'system') {
  const [theme, setTheme] = useState<ThemePreference>(() => {
    // Get from local storage first for speed
    const saved = localStorage.getItem('attendx-theme-pref') as ThemePreference
    return saved || initialPreference
  })

  // Apply class to documentElement
  const applyTheme = (pref: ThemePreference) => {
    const isDark =
      pref === 'dark' ||
      (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Update theme state and save it
  const updateTheme = async (newPref: ThemePreference) => {
    setTheme(newPref)
    localStorage.setItem('attendx-theme-pref', newPref)
    applyTheme(newPref)

    // Save to supabase profiles if profileId is provided
    if (profileId) {
      const isDark =
        newPref === 'dark' ||
        (newPref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

      await supabase.from('profiles').update({
        theme_preference: newPref,
        dark_mode: isDark
      }).eq('id', profileId)
    }
  }

  useEffect(() => {
    applyTheme(theme)

    // Listener for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleSystemChange)
    return () => mediaQuery.removeEventListener('change', handleSystemChange)
  }, [theme])

  // Sync theme when profile changes (e.g., loaded from DB)
  const syncWithProfile = (dbPref: ThemePreference) => {
    if (dbPref && dbPref !== theme) {
      setTheme(dbPref)
      localStorage.setItem('attendx-theme-pref', dbPref)
      applyTheme(dbPref)
    }
  }

  return {
    theme,
    isDark: theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches),
    setTheme: updateTheme,
    syncWithProfile
  }
}
