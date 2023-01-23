import { React, useState } from 'react'
import { Input, Space, Button } from 'antd'
import cn from 'classnames'
import styles from '../styles/Chatbox.module.css'

function ChatboxComponent(props) {
    const user = props.user
    const transcript = props.transcript
    const context = props.context
    const [messages, setMessages] = useState(
        transcript?.messages_info ? [...transcript.messages_info] : []
    )
    const [inputText, setInputText] = useState('')
    const [canInvalidate, setCanInvalidate] = useState(() => {
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].from === user.nickname && messages[i].edited) {
                return false
            } else if (messages[i].from === user.nickname && !messages[i].edited) {
                return true
            }
        }
        return false
    })

    const invalidateMessage = (value) => {
        let messagesCopy = messages

        // Invalidate target message
        for (let i = messagesCopy.length - 1; i >= 0; i--) {
            if (messagesCopy[i].from === user.nickname && !messagesCopy[i].edited) {
                messagesCopy[i].corrected = value
                messagesCopy[i].edited = true
                break
            }
        }

        // Apply changes to messages
        setMessages(messagesCopy)

        // Clear invalidation input
        setInputText('')

        // Disable invalidation
        setCanInvalidate(false)
    }

    const updateCanInvalidate = () => {
        let flag = false
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].from === user.nickname && messages[i].edited) {
                break
            } else if (messages[i].from === user.nickname && !messages[i].edited) {
                flag = true
                break
            }
        }
        setCanInvalidate(flag)
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '-webkit-fill-available',
            }}
        >
            <div
                className={styles.chatboxWrapper}
                style={{
                    height: '87vh',
                    borderLeft: context === 'history' ? '2px solid #f0f0f0' : 'none',
                    borderTop: context === 'history' ? '2px solid #f0f0f0' : 'none',
                }}
            >
                <div className={styles.chatboxOverflow}>
                    <ol className={styles.chatboxMsgList}>
                        {messages.map((msg, i) => {
                            return (
                                <>
                                    <li
                                        key={i}
                                        style={{
                                            background:
                                                msg.from === user.nickname ? '#1b98e0' : '#dfdfe2',
                                            marginBottom: i == messages.length - 1 ? 0 : 10,
                                        }}
                                        className={cn(
                                            styles.chatboxMsgContentWrapper,
                                            msg.from === user.nickname
                                                ? styles.msgFromContent
                                                : styles.msgToContent
                                        )}
                                    >
                                        <div
                                            style={{
                                                textDecoration: msg.edited
                                                    ? 'line-through'
                                                    : 'none',
                                            }}
                                        >
                                            {msg.text}
                                        </div>
                                        {msg.edited && (
                                            <div style={{ paddingTop: 10 }}>{msg.corrected}</div>
                                        )}
                                        <div
                                            style={{ float: 'right', paddingTop: 5, fontSize: 13 }}
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
                                </>
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
                                disabled={!canInvalidate}
                                status="error"
                                style={{ width: '30vw' }}
                                value={inputText}
                                onChange={(event) => setInputText(event.target.value)}
                                onPressEnter={() => invalidateMessage(inputText)}
                                placeholder="Invalidate latest message..."
                            />
                            <Button
                                danger
                                type="primary"
                                disabled={!canInvalidate}
                                onClick={() => invalidateMessage(inputText)}
                            >
                                Invalidate
                            </Button>
                        </Space>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ChatboxComponent
