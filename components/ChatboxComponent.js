import { React } from 'react'
import cn from 'classnames'
import styles from '../styles/Chatbox.module.css'

function ChatboxComponent(props) {
    const user = props.user
    const transcript = props.transcript

    return (
        <div className={styles.chatboxWrapper}>
            <div className={styles.chatboxOverflow}>
                <ol className={styles.chatboxMsgList}>
                    {transcript.map((msg, i) => {
                        return (
                            <>
                                <li
                                    key={i}
                                    className={cn(
                                        styles.chatboxMsgContentWrapper,
                                        msg.user === user.nickname
                                            ? styles.msgToContent
                                            : styles.msgFromContent
                                    )}
                                >
                                    {msg.body}
                                </li>
                                <li
                                    key={i}
                                    className={cn(
                                        styles.chatboxMsgTimestampWrapper,
                                        msg.user === user.nickname
                                            ? styles.msgToTimestamp
                                            : styles.msgFromTimestamp
                                    )}
                                >
                                    {msg.created.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </li>
                            </>
                        )
                    })}
                </ol>
            </div>
        </div>
    )
}

export default ChatboxComponent
