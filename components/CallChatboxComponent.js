import { React } from 'react'
import { Input, Space, Button } from 'antd'
import cn from 'classnames'
import styles from '../styles/CallChatbox.module.css'

function CallChatboxComponent(props) {
    const user = props.user
    const transcript = props.transcript
    const appendedMessages = props.appendedMessages || []

    let messages = transcript?.messages_info
        ? [...transcript.messages_info, ...appendedMessages]
        : appendedMessages

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
                                            marginBottom:
                                                i == transcript.messages_info.length - 1 ? 0 : 10,
                                        }}
                                        className={cn(
                                            styles.chatboxMsgContentWrapper,
                                            msg.to === user.nickname
                                                ? styles.msgToContent
                                                : styles.msgFromContent
                                        )}
                                    >
                                        <div>{msg.text}</div>
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
                            style={{ width: '70vh' }}
                            placeholder="Invalidate latest message..."
                        />
                        <Button danger type="primary">
                            Invalidate
                        </Button>
                    </Space>
                </div>
            </div>
        </div>
    )
}

export default CallChatboxComponent
