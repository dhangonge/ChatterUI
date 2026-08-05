import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'

import DropdownSheet from '@components/input/DropdownSheet'
import SectionTitle from '@components/text/SectionTitle'
import {
    LanguageSetting,
    languageNames,
    supportedLanguages,
    SYSTEM_LANGUAGE,
} from '@lib/i18n/languages'
import { useLanguageStore } from '@lib/i18n/LanguageState'
import { Theme } from '@lib/theme/ThemeManager'

const options: LanguageSetting[] = [SYSTEM_LANGUAGE, ...supportedLanguages]

const LanguageSettings = () => {
    const { t } = useTranslation()
    const { color, spacing, fontSize } = Theme.useTheme()
    const setting = useLanguageStore((state) => state.setting)
    const setLanguage = useLanguageStore((state) => state.setLanguage)

    const labelExtractor = (value: LanguageSetting) =>
        value === SYSTEM_LANGUAGE ? t('Use System Language') : languageNames[value]

    return (
        <View style={{ rowGap: spacing.m }}>
            <SectionTitle>{t('Language')}</SectionTitle>

            <DropdownSheet
                data={options}
                selected={setting}
                onChangeValue={setLanguage}
                labelExtractor={labelExtractor}
                modalTitle={t('Select Language')}
            />

            <Text
                style={{
                    color: color.text._400,
                    fontSize: fontSize.s,
                }}>
                {t('Translations are community contributed and may be incomplete.')}
            </Text>
        </View>
    )
}

export default LanguageSettings
