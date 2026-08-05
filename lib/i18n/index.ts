import 'intl-pluralrules'

import { getLocales } from 'expo-localization'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { mmkv } from '@lib/storage/MMKV'

import {
    fallbackLanguage,
    isSupportedLanguage,
    LanguageSetting,
    resolveDeviceLanguage,
    SupportedLanguage,
    SYSTEM_LANGUAGE,
} from './languages'
import en from './locales/en.json'
import zhCN from './locales/zh-CN.json'

export const LANGUAGE_STORAGE_KEY = 'app-language'

export const resources = {
    en: { translation: en },
    'zh-CN': { translation: zhCN },
} as const

export const getDeviceLanguage = (): SupportedLanguage =>
    resolveDeviceLanguage(
        getLocales().flatMap((locale) => [locale.languageTag, locale.languageCode])
    )

/**
 * Read synchronously from MMKV so the very first render already uses the
 * correct language - waiting for zustand to rehydrate would flash English.
 *
 * The value is written by zustand's `persist` middleware, so it is a JSON
 * envelope shaped like `{ state: { setting }, version }`, not a bare tag.
 */
export const getStoredLanguageSetting = (): LanguageSetting => {
    const stored = mmkv.getString(LANGUAGE_STORAGE_KEY)
    if (!stored) return SYSTEM_LANGUAGE
    try {
        const setting = JSON.parse(stored)?.state?.setting
        if (typeof setting !== 'string' || setting === SYSTEM_LANGUAGE) return SYSTEM_LANGUAGE
        return isSupportedLanguage(setting) ? setting : SYSTEM_LANGUAGE
    } catch {
        return SYSTEM_LANGUAGE
    }
}

export const resolveLanguage = (setting: LanguageSetting): SupportedLanguage =>
    setting === SYSTEM_LANGUAGE ? getDeviceLanguage() : setting

if (!i18n.isInitialized) {
    // eslint-disable-next-line import/no-named-as-default-member
    i18n.use(initReactI18next).init({
        resources: resources,
        lng: resolveLanguage(getStoredLanguageSetting()),
        fallbackLng: fallbackLanguage,
        // Keys are plain English sentences, so nesting separators must be off.
        keySeparator: false,
        nsSeparator: false,
        interpolation: { escapeValue: false },
        // Suspense is unsupported in React Native's root layout here.
        react: { useSuspense: false },
        returnNull: false,
    })
}

export default i18n
