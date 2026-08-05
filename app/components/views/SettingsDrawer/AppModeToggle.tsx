import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'

import HorizontalSelector from '@components/input/HorizontalSelector'
import { useAppMode } from '@lib/state/AppMode'

const AppModeToggle = () => {
    const { t } = useTranslation()
    const { appMode, setAppMode } = useAppMode()

    return (
        <HorizontalSelector
            style={{ flex: 0, paddingBottom: 4, paddingHorizontal: 8 }}
            label={t('App Mode')}
            values={[
                {
                    value: 'local',
                    label: t('Local'),
                    icon: Platform.OS === 'android' ? 'phone-android' : 'phone-iphone',
                },
                { value: 'remote', label: t('Remote'), icon: 'cloud' },
            ]}
            selected={appMode}
            onPress={setAppMode}
        />
    )
}

export default AppModeToggle
