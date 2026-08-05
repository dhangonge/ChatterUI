import React, { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import Alert from '@components/views/Alert'
import ContextMenu from '@components/views/ContextMenu'
import InputSheet from '@components/views/InputSheet'
import { Characters } from '@lib/state/Characters'
import { Chats } from '@lib/state/Chat'
import { Logger } from '@lib/state/Logger'
import { saveStringToDownload } from '@lib/utils/File'

type ChatEditPopupProps = {
    item: Awaited<ReturnType<typeof Chats.db.query.chatListQuery>>[0]
    children: ReactNode
    onPress: () => void
}

const ChatEditPopup: React.FC<ChatEditPopupProps> = ({ item, children, onPress }) => {
    const { t } = useTranslation()
    const [showRename, setShowRename] = useState<boolean>(false)

    const { charName, charId } = Characters.useCharacterStore(
        useShallow((state) => ({
            charId: state.id,
            charName: state.card?.name ?? 'Unknown',
        }))
    )

    const { userId, userName } = Characters.useUserStore(
        useShallow((state) => ({
            userId: state.id,
            userName: state.card?.name,
        }))
    )

    const { deleteChat, loadChat, chatId, unloadChat } = Chats.useChat()

    const handleDeleteChat = (close: () => void) => {
        Alert.alert({
            title: t('Delete Chat'),
            description: t("Are you sure you want to delete '{{name}}'? This cannot be undone.", {
                name: item.name,
            }),
            buttons: [
                { label: t('Cancel') },
                {
                    label: t('Delete Chat'),
                    onPress: async () => {
                        await deleteChat(item.id)
                        if (charId && chatId === item.id) {
                            const returnedChatId = await Chats.db.query.chatNewestId(charId)
                            const chatId = returnedChatId
                                ? returnedChatId
                                : await Chats.db.mutate.createChat(charId)
                            chatId && (await loadChat(chatId))
                        } else if (item.id === chatId) {
                            Logger.errorToast(
                                t('Something went wrong with creating a default chat')
                            )
                            unloadChat()
                        }
                        close()
                    },
                    type: 'warning',
                },
            ],
        })
    }

    const handleCloneChat = (close: () => void) => {
        Alert.alert({
            title: t('Clone Chat'),
            description: t("Are you sure you want to clone '{{name}}'?", {
                name: item.name,
            }),
            buttons: [
                { label: t('Cancel') },
                {
                    label: t('Clone Chat'),
                    onPress: async () => {
                        await Chats.db.mutate.cloneChatFromId(item.id)
                        close()
                    },
                },
            ],
        })
    }

    const handleExportChat = async (close: () => void) => {
        const name = `Chatlogs-${charName}-${item.id}.json`.replaceAll(' ', '_')
        const chat = await Chats.db.query.chat(item.id)
        if (chat) {
            try {
                await saveStringToDownload(JSON.stringify(chat), name, 'utf8')
                Logger.infoToast(t('File: {{name}} saved to downloads!', { name }))
            } catch (e) {
                Logger.errorToast(t('Failed to export chat'))
                Logger.error(`${e}`)
            }
        } else {
            Logger.errorToast(t('Chat is undefined'))
        }
        close()
    }

    const handleLinkUser = async (close: () => void) => {
        if (userId === item.user_id) {
            Logger.warnToast(t('This User Is Already Set'))
            close()
            return
        }
        if (!userId) {
            Logger.errorToast(t('No Current User'))
            close()
            return
        }
        await Chats.db.mutate.updateUser(item.id, userId)
        Logger.infoToast(t('Linked to User: {{name}}', { name: userName }))
        close()
    }

    return (
        <>
            <InputSheet
                title={t('Rename Chat')}
                visible={showRename}
                setVisible={setShowRename}
                onConfirm={async (text) => {
                    await Chats.db.mutate.renameChat(item.id, text)
                }}
                verifyText={(text) => (text.length === 0 ? t('Name cannot be empty') : '')}
                defaultValue={item.name}
            />
            <ContextMenu
                placement="right"
                longPress
                onPress={onPress}
                buttons={[
                    {
                        label: t('Rename'),
                        icon: 'edit',
                        onPress: (close) => {
                            setShowRename(true)
                            close()
                        },
                    },
                    {
                        label: t('Delete'),
                        icon: 'delete',
                        variant: 'warning',
                        onPress: handleDeleteChat,
                    },
                    {
                        label: t('More'),
                        submenu: [
                            {
                                label: t('Export'),
                                icon: 'download',
                                onPress: handleExportChat,
                            },
                            {
                                label: t('Clone'),
                                icon: 'copy',
                                onPress: handleCloneChat,
                            },
                            {
                                label: t('Link User'),
                                icon: 'user',
                                onPress: handleLinkUser,
                            },
                        ],
                    },
                ]}>
                {children}
            </ContextMenu>
        </>
    )
}

export default ChatEditPopup
