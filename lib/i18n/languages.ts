export const SYSTEM_LANGUAGE = 'system'

export const supportedLanguages = ['en', 'zh-CN'] as const

export type SupportedLanguage = (typeof supportedLanguages)[number]

export type LanguageSetting = SupportedLanguage | typeof SYSTEM_LANGUAGE

export const fallbackLanguage: SupportedLanguage = 'en'

/**
 * Native names are intentionally not translated - a language picker should
 * always show each option in its own language.
 */
export const languageNames: Record<SupportedLanguage, string> = {
    en: 'English',
    'zh-CN': '简体中文',
}

export const isSupportedLanguage = (value: string): value is SupportedLanguage =>
    supportedLanguages.includes(value as SupportedLanguage)

/**
 * Maps a device locale tag (eg. `zh-Hans-CN`, `zh_TW`, `en-US`) onto a
 * supported language, falling back to English when no match exists.
 */
export const resolveDeviceLanguage = (tags: (string | null | undefined)[]): SupportedLanguage => {
    for (const tag of tags) {
        if (!tag) continue
        const normalized = tag.replace(/_/g, '-')
        if (isSupportedLanguage(normalized)) return normalized

        const lower = normalized.toLowerCase()
        if (lower.startsWith('zh')) {
            // Traditional Chinese scripts/regions are not supported yet, so only
            // simplified variants map onto zh-CN.
            const isTraditional =
                lower.includes('hant') ||
                lower.includes('-tw') ||
                lower.includes('-hk') ||
                lower.includes('-mo')
            if (!isTraditional) return 'zh-CN'
            continue
        }
        if (lower.startsWith('en')) return 'en'
    }
    return fallbackLanguage
}
