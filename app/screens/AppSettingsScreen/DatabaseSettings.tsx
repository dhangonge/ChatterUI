import { localDownload } from '@vali98/react-native-fs'
import { reloadAppAsync } from 'expo'
import { getDocumentAsync } from 'expo-document-picker'
import { Paths } from 'expo-file-system'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'

import ThemedButton from '@components/buttons/ThemedButton'
import SectionTitle from '@components/text/SectionTitle'
import Alert from '@components/views/Alert'
import i18n from '@lib/i18n'
import { Logger } from '@lib/state/Logger'
import { Theme } from '@lib/theme/ThemeManager'
import { copyFile, deleteFile } from '@lib/utils/File'
import appConfig from 'app.config'

const appVersion = appConfig.expo.version

const dbPath = Paths.document.uri + '/SQLite/db.db'

const exportDB = async (notify: boolean = true) => {
    await localDownload(dbPath.replace('file://', ''))
        .then(() => {
            if (notify) Logger.infoToast(i18n.t('Download Successful!'))
        })
        .catch((e: string) =>
            Logger.errorToast(i18n.t('Failed to copy database: {{error}}', { error: e }))
        )
}

const importDB = async (uri: string, name: string) => {
    const copyDB = async () => {
        await exportDB(false)
        deleteFile(dbPath)
        if (
            copyFile({
                from: uri,
                to: dbPath,
            })
        )
            reloadAppAsync()
    }

    const dbAppVersion = name.split('-')?.[0]
    if (dbAppVersion !== appVersion) {
        Alert.alert({
            title: i18n.t('WARNING: Different Version'),
            description: i18n.t(
                'The imported database file has a different app version ({{dbVersion}}) to installed version ({{appVersion}}).\n\nImporting this database may break or corrupt the database. It is recommended to use the same app version.',
                { dbVersion: dbAppVersion, appVersion: appVersion }
            ),
            buttons: [
                { label: i18n.t('Cancel') },
                { label: i18n.t('Import Anyways'), onPress: copyDB, type: 'warning' },
            ],
        })
    } else copyDB()
}

const DatabaseSettings = () => {
    const { t } = useTranslation()
    const { color, spacing } = Theme.useTheme()
    return (
        <View style={{ rowGap: 8 }}>
            <SectionTitle>{t('Database Management')}</SectionTitle>

            <Text
                style={{
                    color: color.text._500,
                    paddingBottom: spacing.xs,
                    marginBottom: spacing.m,
                }}>
                {t('WARNING: ensure imported database is from the same app version!')}
            </Text>
            <ThemedButton
                label={t('Export Database')}
                variant="secondary"
                onPress={() => {
                    Alert.alert({
                        title: t('Export Database'),
                        description: t(
                            'Are you sure you want to export the database file?\n\nIt will automatically be downloaded to Downloads'
                        ),
                        buttons: [
                            { label: t('Cancel') },
                            { label: t('Export Database'), onPress: exportDB },
                        ],
                    })
                }}
            />

            <ThemedButton
                label={t('Import Database')}
                variant="secondary"
                onPress={async () => {
                    getDocumentAsync({ type: ['application/*'] }).then(async (result) => {
                        if (result.canceled) return
                        Alert.alert({
                            title: t('Import Database'),
                            description: t(
                                'Are you sure you want to import this database? This may will destroy the current database!\n\nA backup will automatically be downloaded.\n\nApp will restart automatically'
                            ),
                            buttons: [
                                { label: t('Cancel') },
                                {
                                    label: t('Import'),
                                    onPress: () =>
                                        importDB(result.assets[0].uri, result.assets[0].name),
                                    type: 'warning',
                                },
                            ],
                        })
                    })
                }}
            />
        </View>
    )
}

export default DatabaseSettings
