import { useLiveQuery } from 'drizzle-orm/expo-sqlite'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import Markdown from 'react-native-markdown-display'
import { useMMKVBoolean } from 'react-native-mmkv'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useShallow } from 'zustand/react/shallow'

import ThemedButton from '@components/buttons/ThemedButton'
import DropdownSheet from '@components/input/DropdownSheet'
import StringArrayEditor from '@components/input/StringArrayEditor'
import ThemedCheckbox from '@components/input/ThemedCheckbox'
import ThemedSwitch from '@components/input/ThemedSwitch'
import ThemedTextInput from '@components/input/ThemedTextInput'
import SectionTitle from '@components/text/SectionTitle'
import Alert from '@components/views/Alert'
import ContextMenu from '@components/views/ContextMenu'
import HeaderButton from '@components/views/HeaderButton'
import HeaderTitle from '@components/views/HeaderTitle'
import InputSheet from '@components/views/InputSheet'
import { AppSettings } from '@lib/constants/GlobalValues'
import useAutosave from '@lib/hooks/AutoSave'
import { useTextFilterStore } from '@lib/hooks/TextFilter'
import { MarkdownStyle } from '@lib/markdown/Markdown'
import { Instructs } from '@lib/state/Instructs'
import { Logger } from '@lib/state/Logger'
import { Theme } from '@lib/theme/ThemeManager'
import { saveStringToDownload } from '@lib/utils/File'

const autoformatterData = [
    { label: 'Disabled', example: '*<No Formatting>*' },
    { label: 'Plain Action, Quote Speech', example: 'Some action, "Some speech"' },
    { label: 'Asterisk Action, Plain Speech', example: '*Some action* Some speech' },
    { label: 'Asterisk Action, Quote Speech', example: '*Some action* "Some speech"' },
]

const FormattingManager = () => {
    const { t } = useTranslation()
    const markdownStyle = MarkdownStyle.useMarkdownStyle()
    const [useTemplate, setUseTemplate] = useMMKVBoolean(AppSettings.UseModelTemplate)
    const { currentInstruct, loadInstruct, setCurrentInstruct } = Instructs.useInstruct(
        useShallow((state) => ({
            currentInstruct: state.data,
            loadInstruct: state.load,
            setCurrentInstruct: state.setData,
        }))
    )
    const instructID = currentInstruct?.id
    const { color, spacing, borderRadius } = Theme.useTheme()
    const { data } = useLiveQuery(Instructs.db.query.instructListQuery())
    const instructList = data
    const selectedItem = data.filter((item) => item.id === instructID)?.[0]
    const [showNewInstruct, setShowNewInstruct] = useState<boolean>(false)
    const { textFilter, setTextFilter, sendFilteredText, setSendFilteredText } = useTextFilterStore(
        useShallow((state) => ({
            sendFilteredText: state.sendFilteredText,
            setSendFilteredText: state.setSendFilteredText,
            textFilter: state.filter,
            setTextFilter: state.setFilter,
        }))
    )

    const handleSaveInstruct = (log: boolean) => {
        if (currentInstruct && instructID)
            Instructs.db.mutate.updateInstruct(instructID, currentInstruct)
    }

    const handleRegenerateDefaults = () => {
        Alert.alert({
            title: t('Regenerate Default Instructs'),
            description: t("Are you sure you want to regenerate default Instructs'?"),
            buttons: [
                { label: t('Cancel') },
                {
                    label: t('Regenerate Default Presets'),
                    onPress: async () => {
                        await Instructs.generateInitialDefaults()
                    },
                },
            ],
        })
    }

    const handleExportPreset = async () => {
        if (!instructID) return
        const name = (currentInstruct?.name ?? 'Default') + '.json'
        await saveStringToDownload(JSON.stringify(currentInstruct), name, 'utf8')
        Logger.infoToast(t('Saved "{{name}}" to Downloads', { name }))
    }

    const handleDeletePreset = () => {
        if (instructList.length === 1) {
            Logger.warnToast(t('Cannot delete last Instruct preset.'))
            return
        }

        Alert.alert({
            title: t('Delete Config'),
            description: t("Are you sure you want to delete '{{name}}'?", {
                name: currentInstruct?.name,
            }),
            buttons: [
                { label: t('Cancel') },
                {
                    label: t('Delete Instruct'),
                    onPress: async () => {
                        if (!instructID) return
                        const leftover = data.filter((item) => item.id !== instructID)
                        if (leftover.length === 0) {
                            Logger.warnToast(t('Cannot delete last instruct'))
                            return
                        }
                        Instructs.db.mutate.deleteInstruct(instructID)
                        loadInstruct(leftover[0].id)
                    },
                    type: 'warning',
                },
            ],
        })
    }

    const headerRight = () => (
        <ContextMenu
            triggerIcon="setting"
            triggerIconSize={24}
            placement="bottom"
            buttons={[
                {
                    label: t('Create Config'),
                    icon: 'file-add',
                    onPress: (close) => {
                        setShowNewInstruct(true)

                        close()
                    },
                },
                {
                    label: t('Export Config'),
                    icon: 'download',
                    onPress: (close) => {
                        handleExportPreset()
                        close()
                    },
                },
                {
                    label: t('Delete Config'),
                    icon: 'delete',
                    onPress: (close) => {
                        handleDeletePreset()
                        close()
                    },
                    variant: 'warning',
                },
                {
                    label: t('Regenerate Default'),
                    icon: 'reload',
                    onPress: (close) => {
                        handleRegenerateDefaults()
                        close()
                    },
                },
            ]}
        />
    )

    useAutosave({ data: currentInstruct, onSave: () => handleSaveInstruct(false), interval: 1000 })

    if (currentInstruct)
        return (
            <SafeAreaView
                edges={['bottom']}
                key={currentInstruct.id}
                style={{
                    marginVertical: spacing.xl,
                    flex: 1,
                }}>
                <HeaderTitle title={t('Formatting')} />
                <HeaderButton headerRight={headerRight} />
                <View>
                    <InputSheet
                        title={t('New Instruct Preset')}
                        visible={showNewInstruct}
                        setVisible={setShowNewInstruct}
                        verifyText={(text) =>
                            instructList.some((item) => item.name === text)
                                ? t('Config already exists')
                                : ''
                        }
                        onConfirm={(text) => {
                            if (instructList.some((item) => item.name === text)) {
                                Logger.warnToast(t('Config name already exists.'))
                                return
                            }
                            if (!currentInstruct) return

                            Instructs.db.mutate
                                .createInstruct({ ...currentInstruct, name: text })
                                .then(async (newid) => {
                                    Logger.infoToast(t('Config created.'))
                                    await loadInstruct(newid)
                                })
                        }}
                    />
                </View>

                <View
                    style={{
                        paddingHorizontal: spacing.xl,
                        marginTop: spacing.xl,
                        paddingBottom: spacing.l,
                        flexDirection: 'row',
                        alignItems: 'center',
                        columnGap: spacing.m,
                    }}>
                    <DropdownSheet
                        containerStyle={{ flex: 1 }}
                        selected={selectedItem}
                        data={instructList}
                        labelExtractor={(item) => item.name}
                        onChangeValue={(item) => {
                            if (item.id === instructID) return
                            loadInstruct(item.id)
                        }}
                        modalTitle={t('Select Config')}
                        search
                    />
                    <ThemedButton iconName="save" iconSize={28} variant="tertiary" />
                </View>

                <KeyboardAwareScrollView
                    showsVerticalScrollIndicator={false}
                    style={{
                        flex: 1,
                        marginTop: 16,
                    }}
                    contentContainerStyle={{
                        rowGap: spacing.xl,
                        paddingHorizontal: spacing.xl,
                    }}>
                    <SectionTitle>{t('Instruct Formatting')}</SectionTitle>
                    <ThemedTextInput
                        label={t('System Prompt')}
                        value={currentInstruct.system_prompt}
                        onChangeText={(text) => {
                            setCurrentInstruct({
                                ...currentInstruct,
                                system_prompt: text,
                            })
                        }}
                        numberOfLines={5}
                        multiline
                    />

                    <ThemedTextInput
                        label={t('System Prompt Format')}
                        value={currentInstruct.system_prompt_format}
                        onChangeText={(text) => {
                            setCurrentInstruct({
                                ...currentInstruct,
                                system_prompt_format: text,
                            })
                        }}
                        numberOfLines={3}
                        multiline
                    />
                    <View style={{ flexDirection: 'row', columnGap: spacing.m }}>
                        <ThemedTextInput
                            label={t('System Prefix')}
                            value={currentInstruct.system_prefix}
                            onChangeText={(text) => {
                                setCurrentInstruct({
                                    ...currentInstruct,
                                    system_prefix: text,
                                })
                            }}
                            numberOfLines={5}
                            multiline
                        />
                        <ThemedTextInput
                            label={t('System Suffix')}
                            value={currentInstruct.system_suffix}
                            onChangeText={(text) => {
                                setCurrentInstruct({
                                    ...currentInstruct,
                                    system_suffix: text,
                                })
                            }}
                            numberOfLines={5}
                            multiline
                        />
                    </View>
                    <View style={{ flexDirection: 'row', columnGap: spacing.m }}>
                        <ThemedTextInput
                            label={t('Input Prefix')}
                            value={currentInstruct.input_prefix}
                            onChangeText={(text) => {
                                setCurrentInstruct({
                                    ...currentInstruct,
                                    input_prefix: text,
                                })
                            }}
                            numberOfLines={5}
                            multiline
                        />
                        <ThemedTextInput
                            label={t('Input Suffix')}
                            value={currentInstruct.input_suffix}
                            onChangeText={(text) => {
                                setCurrentInstruct({
                                    ...currentInstruct,
                                    input_suffix: text,
                                })
                            }}
                            numberOfLines={5}
                            multiline
                        />
                    </View>
                    <View style={{ flexDirection: 'row', columnGap: spacing.m }}>
                        <ThemedTextInput
                            label={t('Output Prefix')}
                            value={currentInstruct.output_prefix}
                            onChangeText={(text) => {
                                setCurrentInstruct({
                                    ...currentInstruct,
                                    output_prefix: text,
                                })
                            }}
                            numberOfLines={5}
                            multiline
                        />
                        <ThemedTextInput
                            label={t('Output Suffix')}
                            value={currentInstruct.output_suffix}
                            onChangeText={(text) => {
                                setCurrentInstruct({
                                    ...currentInstruct,
                                    output_suffix: text,
                                })
                            }}
                            numberOfLines={5}
                            multiline
                        />
                    </View>

                    <View style={{ flexDirection: 'row' }}>
                        <ThemedTextInput
                            label={t('Last Output Prefix')}
                            value={currentInstruct.last_output_prefix}
                            onChangeText={(text) => {
                                setCurrentInstruct({
                                    ...currentInstruct,
                                    last_output_prefix: text,
                                })
                            }}
                            numberOfLines={5}
                            multiline
                        />
                    </View>

                    <StringArrayEditor
                        containerStyle={{}}
                        label={t('Stop Sequence')}
                        value={
                            currentInstruct.stop_sequence
                                ? currentInstruct.stop_sequence.split(',')
                                : []
                        }
                        setValue={(data) => {
                            setCurrentInstruct({
                                ...currentInstruct,
                                stop_sequence: data.join(','),
                            })
                        }}
                        replaceNewLine="\n"
                    />

                    <ThemedCheckbox
                        label={t('Use Common Stop Sequences')}
                        value={currentInstruct.use_common_stop}
                        onChangeValue={(b) => {
                            setCurrentInstruct({
                                ...currentInstruct,
                                use_common_stop: b,
                            })
                        }}
                    />

                    <SectionTitle>{t('Macros & Character Card')}</SectionTitle>

                    <View
                        style={{
                            flexDirection: 'row',
                            columnGap: spacing.xl2,
                        }}>
                        <View style={{ flex: 1 }}>
                            <ThemedCheckbox
                                label={t('Wrap In Newline')}
                                value={currentInstruct.wrap}
                                onChangeValue={(b) => {
                                    setCurrentInstruct({
                                        ...currentInstruct,
                                        wrap: b,
                                    })
                                }}
                            />
                            <ThemedCheckbox
                                label={t('Include Names')}
                                value={currentInstruct.names}
                                onChangeValue={(b) => {
                                    setCurrentInstruct({
                                        ...currentInstruct,
                                        names: b,
                                    })
                                }}
                            />
                            <ThemedCheckbox
                                label={t('Add Timestamp')}
                                value={currentInstruct.timestamp}
                                onChangeValue={(b) => {
                                    setCurrentInstruct({
                                        ...currentInstruct,
                                        timestamp: b,
                                    })
                                }}
                            />
                            <ThemedCheckbox
                                label={t('Remove Think Tags')}
                                value={currentInstruct.hide_think_tags}
                                onChangeValue={(b) => {
                                    setCurrentInstruct({
                                        ...currentInstruct,
                                        hide_think_tags: b,
                                    })
                                }}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <ThemedCheckbox
                                label={t('Use Examples')}
                                value={currentInstruct.examples}
                                onChangeValue={(b) => {
                                    setCurrentInstruct({
                                        ...currentInstruct,
                                        examples: b,
                                    })
                                }}
                            />
                            <ThemedCheckbox
                                label={t('Use Scenario')}
                                value={currentInstruct.scenario}
                                onChangeValue={(b) => {
                                    setCurrentInstruct({
                                        ...currentInstruct,
                                        scenario: b,
                                    })
                                }}
                            />

                            <ThemedCheckbox
                                label={t('Use Personality')}
                                value={currentInstruct.personality}
                                onChangeValue={(b) => {
                                    setCurrentInstruct({
                                        ...currentInstruct,
                                        personality: b,
                                    })
                                }}
                            />
                        </View>
                    </View>

                    <SectionTitle>{t('Attachments')}</SectionTitle>

                    <View
                        style={{
                            flexDirection: 'row',
                            columnGap: spacing.xl2,
                            justifyContent: 'space-between',
                        }}>
                        <View style={{ flex: 1 }}>
                            <ThemedCheckbox
                                label={t('Send Images')}
                                value={currentInstruct.send_images}
                                onChangeValue={(b) => {
                                    setCurrentInstruct({
                                        ...currentInstruct,
                                        send_images: b,
                                    })
                                }}
                            />
                            <ThemedCheckbox
                                label={t('Send Documents')}
                                value={currentInstruct.send_documents}
                                onChangeValue={(b) => {
                                    setCurrentInstruct({
                                        ...currentInstruct,
                                        send_documents: b,
                                    })
                                }}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <ThemedCheckbox
                                label={t('Send Audio')}
                                value={currentInstruct.send_audio}
                                onChangeValue={(b) => {
                                    setCurrentInstruct({
                                        ...currentInstruct,
                                        send_audio: b,
                                    })
                                }}
                            />
                            <ThemedCheckbox
                                label={t('Use Last Image Only')}
                                value={currentInstruct.last_image_only}
                                onChangeValue={(b) => {
                                    setCurrentInstruct({
                                        ...currentInstruct,
                                        last_image_only: b,
                                    })
                                }}
                            />
                        </View>
                    </View>

                    <View style={{ rowGap: 8 }}>
                        <SectionTitle>{t('Text Formatter')}</SectionTitle>
                        <Text
                            style={{
                                color: color.text._400,
                            }}>
                            {t('Automatically formats first message to the style below:')}
                        </Text>
                        <View
                            style={{
                                backgroundColor: color.neutral._300,
                                marginTop: spacing.m,
                                paddingHorizontal: spacing.xl2,
                                alignItems: 'center',
                                borderRadius: borderRadius.m,
                            }}>
                            <Markdown
                                markdownit={MarkdownStyle.Rules}
                                rules={MarkdownStyle.RenderRules}
                                style={markdownStyle}>
                                {autoformatterData[currentInstruct.format_type].example}
                            </Markdown>
                        </View>
                        <View>
                            {autoformatterData.map((item, index) => (
                                <ThemedCheckbox
                                    key={item.label}
                                    label={t(item.label)}
                                    value={currentInstruct.format_type === index}
                                    onChangeValue={(b) => {
                                        if (b)
                                            setCurrentInstruct({
                                                ...currentInstruct,
                                                format_type: index,
                                            })
                                    }}
                                />
                            ))}
                        </View>
                    </View>

                    <SectionTitle>{t('Hidden Text')}</SectionTitle>
                    <Text
                        style={{
                            color: color.text._400,
                        }}>
                        {t(
                            'Hides text that matches regex patterns defined below. (case insensitive)'
                        )}
                    </Text>

                    <StringArrayEditor value={textFilter} setValue={setTextFilter} />

                    <ThemedSwitch
                        label={t('Send Filtered Text')}
                        description={t('Sends the filtered text for inference')}
                        value={sendFilteredText}
                        onChangeValue={setSendFilteredText}
                    />

                    <SectionTitle>{t('Local Template')}</SectionTitle>

                    <ThemedSwitch
                        label={t('Use Built-In Local Model Template')}
                        description={t(
                            'When in Local Mode, ChatterUI automatically uses the instruct template provided by the loaded model. Disable this if you want messages to be formatted using Instruct instead. System Prompt however is always used.'
                        )}
                        value={useTemplate}
                        onChangeValue={setUseTemplate}
                    />

                    {/* @TODO: Macros are always replaced - people may want this to be changed
                            <CheckboxTitle
                                name="Replace Macro In Sequences"
                                varname="macro"
                                body={currentInstruct}
                                setValue={setCurrentInstruct}
                            />
                            */}

                    {/*  Groups are not implemented - leftover from ST
                            <CheckboxTitle
                                name="Force for Groups and Personas"
                                varname="names_force_groups"
                                body={currentInstruct}
                                setValue={setCurrentInstruct}
                            />
                            */}
                    {/* Activates Instruct when model is loaded with specific name that matches regex
                    
                            <TextBox
                                name="Activation Regex"
                                varname="activation_regex"
                                body={currentInstruct}
                                setValue={setCurrentInstruct}
                            />*/}
                    {/*    User Alignment Messages may be needed in future, might be removed on CCv3
                            <TextBox
                                name="User Alignment"
                                varname="user_alignment_message"
                                body={currentInstruct}
                                setValue={setCurrentInstruct}
                                multiline
                            />*/}
                </KeyboardAwareScrollView>
            </SafeAreaView>
        )
}

export default FormattingManager
