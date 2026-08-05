import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { useMMKVBoolean } from 'react-native-mmkv'

import ThemedSwitch from '@components/input/ThemedSwitch'
import SectionTitle from '@components/text/SectionTitle'
import { AppSettings } from '@lib/constants/GlobalValues'

const ChatWindowSettings = () => {
    const { t } = useTranslation()
    const [autoScroll, setAutoScroll] = useMMKVBoolean(AppSettings.AutoScroll)
    const [sendOnEnter, setSendOnEnter] = useMMKVBoolean(AppSettings.SendOnEnter)
    const [quickDelete, setQuickDelete] = useMMKVBoolean(AppSettings.QuickDelete)
    const [saveScroll, setSaveScroll] = useMMKVBoolean(AppSettings.SaveScrollPosition)
    const [alternate, setAlternate] = useMMKVBoolean(AppSettings.AlternatingChatMode)
    const [wide, setWide] = useMMKVBoolean(AppSettings.WideChatMode)

    const [showTokensPerSecond, setShowTokensPerSecond] = useMMKVBoolean(
        AppSettings.ShowTokenPerSecond
    )

    return (
        <View style={{ rowGap: 8 }}>
            <SectionTitle>{t('Chat Window')}</SectionTitle>

            <ThemedSwitch
                label={t('Auto Scroll')}
                value={autoScroll}
                onChangeValue={setAutoScroll}
                description={t('Autoscrolls text during generations')}
            />

            <ThemedSwitch
                label={t('Send on Enter')}
                value={sendOnEnter}
                onChangeValue={setSendOnEnter}
                description={t('Submits messages when Enter is pressed')}
            />

            <ThemedSwitch
                label={t('Show Tokens Per Second')}
                value={showTokensPerSecond}
                onChangeValue={setShowTokensPerSecond}
                description={t('Show tokens per second when using local models')}
            />

            <ThemedSwitch
                label={t('Quick Delete')}
                value={quickDelete}
                onChangeValue={setQuickDelete}
                description={t('Toggle delete button in chat options bar')}
            />

            <ThemedSwitch
                label={t('Save Scroll Position')}
                value={saveScroll}
                onChangeValue={setSaveScroll}
                description={t('Automatically move to last scrolled position in chat')}
            />

            <ThemedSwitch
                label={t('Wide Chat')}
                value={wide}
                onChangeValue={setWide}
                description={t('Removes whitespace for wider chat')}
            />

            <ThemedSwitch
                label={t('Alternate User and Character Positions')}
                value={alternate}
                onChangeValue={setAlternate}
                description={t('Left align character chats and right aligns user chats')}
            />
        </View>
    )
}

export default ChatWindowSettings
