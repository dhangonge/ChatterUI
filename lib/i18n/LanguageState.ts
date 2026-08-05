import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { createMMKVStorage } from '@lib/storage/MMKV'

import i18n, { LANGUAGE_STORAGE_KEY, resolveLanguage } from './index'
import { LanguageSetting, SupportedLanguage, SYSTEM_LANGUAGE } from './languages'

interface LanguageStoreProps {
    /** User choice, may be `system` to follow the device locale. */
    setting: LanguageSetting
    /** Concrete language actually in use. */
    resolved: SupportedLanguage
    setLanguage: (setting: LanguageSetting) => void
}

export const useLanguageStore = create<LanguageStoreProps>()(
    persist(
        (set) => ({
            setting: SYSTEM_LANGUAGE,
            resolved: resolveLanguage(SYSTEM_LANGUAGE),
            setLanguage: (setting) => {
                const resolved = resolveLanguage(setting)
                i18n.changeLanguage(resolved)
                set({ setting, resolved })
            },
        }),
        {
            name: LANGUAGE_STORAGE_KEY,
            storage: createMMKVStorage(),
            version: 1,
            partialize: (data) => ({ setting: data.setting }),
            onRehydrateStorage: () => (state) => {
                if (!state) return
                const resolved = resolveLanguage(state.setting)
                i18n.changeLanguage(resolved)
                state.resolved = resolved
            },
        }
    )
)
