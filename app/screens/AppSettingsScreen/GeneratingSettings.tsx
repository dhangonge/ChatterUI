import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { useMMKVBoolean } from 'react-native-mmkv'

import ThemedSwitch from '@components/input/ThemedSwitch'
import SectionTitle from '@components/text/SectionTitle'
import { AppSettings } from '@lib/constants/GlobalValues'

const GeneratingSettings = () => {
    const { t } = useTranslation()
    const [printContext, setPrintContext] = useMMKVBoolean(AppSettings.PrintContext)
    const [bypassContextLength, setBypassContextLength] = useMMKVBoolean(
        AppSettings.BypassContextLength
    )
    return (
        <View style={{ rowGap: 8 }}>
            <SectionTitle>{t('Generation')}</SectionTitle>

            <ThemedSwitch
                label={t('Print Context')}
                value={printContext}
                onChangeValue={setPrintContext}
                description={t('Prints the generation context to logs for debugging')}
            />

            <ThemedSwitch
                label={t('Bypass Context Length')}
                value={bypassContextLength}
                onChangeValue={setBypassContextLength}
                description={t('Ignores context length limits when building prompts')}
            />
        </View>
    )
}

export default GeneratingSettings
