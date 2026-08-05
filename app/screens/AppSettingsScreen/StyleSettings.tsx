import { useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { useShallow } from 'zustand/react/shallow'

import ThemedButton from '@components/buttons/ThemedButton'
import SectionTitle from '@components/text/SectionTitle'
import Alert from '@components/views/Alert'
import { useBackgroundStore } from '@lib/state/BackgroundImage'

const StyleSettings = () => {
    const router = useRouter()
    const { t } = useTranslation()

    const { chatBackground, importBackground, deleteBackground } = useBackgroundStore(
        useShallow((state) => ({
            chatBackground: state.image,
            importBackground: state.importImage,
            deleteBackground: state.removeImage,
        }))
    )

    return (
        <View style={{ rowGap: 8 }}>
            <SectionTitle>{t('Style')}</SectionTitle>

            <ThemedButton
                label={t('Change Theme')}
                variant="secondary"
                onPress={() => router.push('/screens/AppSettingsScreen/ColorSelector')}
            />
            <ThemedButton
                label={chatBackground ? t('Replace Chat Background') : t('Import Chat Background')}
                variant="secondary"
                onPress={importBackground}
            />
            {chatBackground && (
                <ThemedButton
                    label={t('Delete Chat Background')}
                    variant="critical"
                    onPress={() =>
                        Alert.alert({
                            title: t('Delete Background'),
                            description: t(
                                'Are you sure you want to delete this background? This cannot be undone!'
                            ),
                            buttons: [
                                { label: t('Cancel') },
                                {
                                    label: t('Delete Background'),
                                    type: 'warning',
                                    onPress: deleteBackground,
                                },
                            ],
                        })
                    }
                />
            )}
        </View>
    )
}

export default StyleSettings
