import { React, useState } from 'react'
import { Input, Space, Button } from 'antd'
import cn from 'classnames'
import styles from '../styles/CallChatbox.module.css'

function CallChatboxComponent(props) {
    const user = props.user
    const transcript = props.transcript
    const [messages, setMessages] = useState(
        transcript?.messages_info ? [...transcript.messages_info] : []
    )
    const [inputText, setInputText] = useState('')
    const [canInvalidate, setCanInvalidate] = useState(() => {
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].from === user.nickname && !messages[i].correct) {
                return false
            } else if (messages[i].from === user.nickname && messages[i].correct) {
                return true
            }
        }
        return false
    })

    const createMessage = (value) => {
        let messagesCopy = messages

        // Invalidate previous message
        for (let i = messagesCopy.length - 1; i >= 0; i--) {
            if (messagesCopy[i].from === user.nickname && messagesCopy[i].correct) {
                messagesCopy[i].correct = false
                break
            }
        }

        // Append replacement message
        messagesCopy.push({
            correct: true,
            date_created: { $date: new Date() },
            edited: true,
            from: user.nickname,
            message_type: 'STT', // Need to get user type
            room_id: props.roomID,
            text: value,
            to: `${props?.otherUser || 'N/A'}`, // Need to get other user
        })

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
            if (messages[i].from === user.nickname && !messages[i].correct) {
                break
            } else if (messages[i].from === user.nickname && messages[i].correct) {
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
            <div className={styles.chatboxWrapper} style={{ height: '87vh' }}>
                <div className={styles.chatboxOverflow}>
                    <ol className={styles.chatboxMsgList}>
                        {messages.map((msg, i) => {
                            return (
                                <>
                                    <li
                                        key={i}
                                        style={{
                                            background: !msg.correct
                                                ? '#ff4d4f'
                                                : msg.from === user.nickname
                                                ? '#1b98e0'
                                                : '#dfdfe2',
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
                                                textDecoration: !msg.correct
                                                    ? 'line-through'
                                                    : 'none',
                                            }}
                                        >
                                            {msg.text}
                                        </div>
                                        <div
                                            style={{ float: 'right', paddingTop: 5, fontSize: 13 }}
                                        >
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
                            style={{ width: '70vh' }}
                            value={inputText}
                            onChange={(event) => setInputText(event.target.value)}
                            onPressEnter={() => createMessage(inputText)}
                            placeholder="Invalidate latest message..."
                        />
                        <Button
                            danger
                            type="primary"
                            disabled={!canInvalidate}
                            onClick={() => createMessage(inputText)}
                        >
                            Invalidate
                        </Button>
                    </Space>
                </div>
            </div>
        </div>
    )
}

export default CallChatboxComponent
