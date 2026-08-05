import { useTextIntentStatus } from '@vali98/react-native-process-text'
import { useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { useMMKVBoolean } from 'react-native-mmkv'

import ThemedButton from '@components/buttons/ThemedButton'
import ThemedSwitch from '@components/input/ThemedSwitch'
import SectionTitle from '@components/text/SectionTitle'
import { AppSettings } from '@lib/constants/GlobalValues'

const ChatSettings = () => {
    const { t } = useTranslation()
    const [firstMes, setFirstMes] = useMMKVBoolean(AppSettings.CreateFirstMes)
    const [chatOnStartup, setChatOnStartup] = useMMKVBoolean(AppSettings.ChatOnStartup)
    const [autoLoadUser, setAutoLoadUser] = useMMKVBoolean(AppSettings.AutoLoadUser)
    const [autoTitle, setAutoTitle] = useMMKVBoolean(AppSettings.AutoGenerateTitle)
    const { enabled: textIntent, setEnabled: setTextIntent } = useTextIntentStatus()
    const router = useRouter()
    return (
        <View style={{ rowGap: 8 }}>
            <SectionTitle>{t('Chat')}</SectionTitle>

            <ThemedSwitch
                label={t('Use First Message')}
                value={firstMes}
                onChangeValue={setFirstMes}
                description={t(
                    'Disabling this will make new chats start blank, needed by specific models'
                )}
            />

            <ThemedSwitch
                label={t('Load Chat On Startup')}
                value={chatOnStartup}
                onChangeValue={setChatOnStartup}
                description={t('Loads the most recent chat on startup')}
            />

            <ThemedSwitch
                label={t('Auto Load User')}
                value={autoLoadUser}
                onChangeValue={setAutoLoadUser}
                description={t(
                    'When opening a chat, automatically loads the User the chat was created with'
                )}
            />

            <ThemedSwitch
                label={t('Automatically Generate Titles')}
                value={autoTitle}
                onChangeValue={setAutoTitle}
                description={t('Automatically generates titles for chats (only in Remote mode)')}
            />

            <ThemedSwitch
                label={t('Ask In ChatterUI')}
                value={textIntent}
                onChangeValue={setTextIntent}
                description={t('Adds ChatterUI as a search option when highlighting text')}
            />

            <ThemedButton
                label={t('Chat Style')}
                variant="secondary"
                onPress={() => router.push('/screens/AppSettingsScreen/ChatStyleSettings')}
            />
        </View>
    )
}

export default ChatSettings
