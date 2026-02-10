import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Language } from '@/i18n'

type Theme = 'light' | 'dark' | 'system'

interface PreferencesState {
  language: Language
  theme: Theme
}

interface PreferencesActions {
  setLanguage: (language: Language) => void
  setTheme: (theme: Theme) => void
  setPreferences: (prefs: Partial<PreferencesState>) => void
}

interface PreferencesStore extends PreferencesState {
  actions: PreferencesActions
}

const initialState: PreferencesState = {
  language: 'es',
  theme: 'dark',
}

const usePreferencesStore = create<PreferencesStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        actions: {
          setLanguage: (language) =>
            set({ language }, undefined, 'actions/setLanguage'),
          setTheme: (theme) => set({ theme }, undefined, 'actions/setTheme'),
          setPreferences: (prefs) =>
            set(prefs, undefined, 'actions/setPreferences'),
        },
      }),
      { name: 'preferences-store' },
    ),
    { name: 'PreferencesStore' },
  ),
)

export const useLanguage = () => usePreferencesStore((s) => s.language)

export const usePreferredTheme = () => usePreferencesStore((s) => s.theme)

export const usePreferencesActions = () => usePreferencesStore((s) => s.actions)
