import { Modal } from 'antd'
import { React, useState } from 'react'
import ChatboxComponent from '../ChatboxComponent'
import styles from '../../styles/Modal.module.css'

const CallTranscriptModal = ({ user, transcript, hideCallTranscriptModal }) => {
    const [visible, setVisible] = useState(true)

    const handleClose = () => {
        setVisible(false)
        hideCallTranscriptModal()
    }

    // Get the communication type of the user
    const getType = () => {
        let role = ''
        if (transcript.users[0] === user.nickname) {
            role = transcript.host_type
        } else {
            if (transcript.host_type === 'STT') {
                role = 'ASL'
            } else {
                role = 'STT'
            }
        }
        return role === 'ASL' ? 'ASL Signer' : 'Speaker'
    }

    const getUser = (transcript) => {
        const otherUser = transcript?.users.find((other) => other != user?.nickname)

        if (otherUser) {
            return <span className={styles.tabText}>{otherUser}</span>
        } else {
            return (
                <span className={styles.tabText} style={{ fontStyle: 'italic' }}>
                    Unattended
                </span>
            )
        }
    }

    return (
        <Modal
            title={
                <>
                    {transcript?.users.find((other) => other !== user?.nickname) ? (
                        <p className={styles.noMargin}>
                            {`Conversation with: ${transcript?.users.find(
                                (other) => other !== user?.nickname
                            )}`}
                        </p>
                    ) : (
                        <p className={styles.unattendedConversation}>Unattended Conversation</p>
                    )}
                    <p className={styles.noMargin}>{`Your communication role: ${getType()}`}</p>
                    <p className={styles.noMargin}>
                        {`Date: ${transcript?.date_created['$date'].split('T')[0] || 'N/A'}`}
                    </p>
                </>
            }
            open={visible}
            onOk={handleClose}
            onCancel={handleClose}
            okButtonProps={{ children: 'Custom OK' }}
            okText="Close"
            cancelButtonProps={{ style: { display: 'none' } }}
            width={650}
            bodyStyle={{ height: 400, overflowY: 'hidden' }}
        >
            <ChatboxComponent
                context={'history'}
                user={user}
                transcript={transcript?.messages_info || []}
            />
        </Modal>
    )
}

export default CallTranscriptModal
