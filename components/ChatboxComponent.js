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
                    {transcript?.messages_info?.map((msg, i) => {
                        return (
                            <>
                                <li
                                    key={i}
                                    className={cn(
                                        styles.chatboxMsgContentWrapper,
                                        msg.to === user.nickname
                                            ? styles.msgToContent
                                            : styles.msgFromContent
                                    )}
                                >
                                    <div>{msg.text}</div>
                                    <div style={{ float: 'right', paddingTop: 5, fontSize: 13 }}>
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
    )
}

export default ChatboxComponent
