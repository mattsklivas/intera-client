import { React, useState, useEffect, useRef } from 'react'
import { Input, Space, Button, notification } from 'antd'
import cn from 'classnames'
import styles from '../styles/Chatbox.module.css'
import { fetcher } from '../core/fetchers'

const ChatboxComponent = ({
    user,
    transcript,
    roomInfo,
    context,
    accessToken,
    invalidateRefresh,
}) => {
    const chatRef = useRef(null)
    const [api, contextHolder] = notification.useNotification()
    const [isInvalidateLoading, setIsInvalidateLoading] = useState(false)

    const [inputText, setInputText] = useState('')
    const [canInvalidate, setCanInvalidate] = useState(() => {
        for (let i = transcript.length - 1; i >= 0; i--) {
            if (transcript[i].from === user.nickname && transcript[i].edited) {
                return false
            } else if (transcript[i].from === user.nickname && !transcript[i].edited) {
                return true
            }
        }
        return false
    })

    useEffect(() => {
        if (chatRef && chatRef.current) {
            const elem = chatRef.current
            elem.scroll({
                top: elem.scrollHeight,
                behavior: 'smooth',
            })
        }

        // Update invalidation state
        updateCanInvalidate()
    }, [chatRef, transcript])

    const updateCanInvalidate = async () => {
        let flag = false
        for (let i = transcript.length - 1; i >= 0; i--) {
            if (transcript[i].from === user.nickname && transcript[i].edited) {
                break
            } else if (transcript[i].from === user.nickname && !transcript[i].edited) {
                flag = true
            }
        }
        setCanInvalidate(flag)
    }

    const invalidateMessage = (value) => {
        let messagesCopy = transcript
        let messageID = null
        let index = null

        // Find target message
        for (let i = messagesCopy.length - 1; i >= 0; i--) {
            if (messagesCopy[i].from === user.nickname && !messagesCopy[i].edited) {
                messageID = messagesCopy[i]._id['$oid']
                index = i
                break
            }
        }

        if (messageID) {
            fetcher(accessToken, '/api/transcripts/edit_message', {
                method: 'PUT',
                body: JSON.stringify({
                    room_id: roomInfo.room_id,
                    message: value,
                    message_id: messageID,
                }),
            })
                .then((res) => {
                    if (res.status == 200) {
                        // Update chatbox
                        invalidateRefresh()

                        // Clear invalidation input
                        setInputText('')

                        // Disable invalidation
                        setCanInvalidate(false)

                        // Scroll to bottom
                        const elem = chatRef.current
                        elem.scroll({
                            top: elem.scrollHeight,
                            behavior: 'smooth',
                        })
                    } else {
                        api.error({
                            message: `Error ${res.status}: ${res.error}`,
                        })
                    }
                    setIsInvalidateLoading(false)
                })
                .catch((res) => {
                    console.log('ERROR', res)
                    api.error({
                        message: 'An unknown error has occurred',
                    })
                    setIsInvalidateLoading(false)
                })
        } else {
            api.error({
                message: 'Error: Unable to invalidate message',
            })
            setIsInvalidateLoading(false)
        }
    }

    return (
        <>
            {contextHolder}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    width: '-webkit-fill-available',
                }}
            >
                <div
                    ref={chatRef}
                    className={styles.chatboxWrapper}
                    style={{
                        height: '87vh',
                        borderLeft: context === 'history' ? '2px solid #f0f0f0' : 'none',
                        borderTop: context === 'history' ? '2px solid #f0f0f0' : 'none',
                    }}
                >
                    <div className={styles.chatboxOverflow}>
                        <ol className={styles.chatboxMsgList}>
                            {transcript.map((msg, i) => {
                                return (
                                    <li
                                        key={`chat-wrapper-${i}`}
                                        style={{
                                            background:
                                                msg.from === user.nickname ? '#1b98e0' : '#dfdfe2',
                                            marginBottom: i == transcript.length - 1 ? 0 : 10,
                                        }}
                                        className={cn(
                                            styles.chatboxMsgContentWrapper,
                                            msg.from === user.nickname
                                                ? styles.msgFromContent
                                                : styles.msgToContent
                                        )}
                                    >
                                        <div
                                            key={`chat-msg-content-${i}`}
                                            style={{
                                                textDecoration: msg.edited
                                                    ? 'line-through'
                                                    : 'none',
                                            }}
                                        >
                                            <span>{msg.text}</span>
                                        </div>
                                        {msg.edited && (
                                            <div
                                                key={`chat-msg-edited-${i}`}
                                                style={{ paddingTop: 10 }}
                                            >
                                                <span>{msg.corrected}</span>
                                            </div>
                                        )}
                                        <div
                                            key={`chat-msg-info-${i}`}
                                            style={{
                                                float: 'right',
                                                paddingTop: 5,
                                                fontSize: 13,
                                            }}
                                        >
                                            {msg.edited && (
                                                <>
                                                    <span style={{ fontWeight: 500 }}>Edited</span>
                                                    <span> - </span>
                                                </>
                                            )}
                                            {new Date(msg.date_created['$date']).toLocaleTimeString(
                                                [],
                                                {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                }
                                            )}
                                        </div>
                                    </li>
                                )
                            })}
                        </ol>
                    </div>
                </div>
                {context === 'call' && (
                    <div
                        style={{
                            display: 'flex',
                            overflow: 'hidden',
                            justifyContent: 'center',
                            borderRight: '2px solid #f0f0f0',
                            height: '10%',
                        }}
                    >
                        <div style={{ paddingTop: '1vh' }}>
                            <Space>
                                <Input
                                    id="invalidate"
                                    disabled={!canInvalidate}
                                    status="error"
                                    style={{ width: '30vw' }}
                                    value={inputText}
                                    onChange={(event) => setInputText(event.target.value)}
                                    onPressEnter={() => {
                                        setInputText('')
                                        setIsInvalidateLoading(true)
                                        invalidateMessage(inputText)
                                    }}
                                    autoComplete="off"
                                    placeholder="Invalidate latest message..."
                                />
                                <Button
                                    danger
                                    type="primary"
                                    loading={isInvalidateLoading}
                                    disabled={!canInvalidate}
                                    onClick={() => {
                                        setInputText('')
                                        setIsInvalidateLoading(true)
                                        invalidateMessage(inputText)
                                    }}
                                >
                                    Invalidate
                                </Button>
                            </Space>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default ChatboxComponent
