import { Modal } from 'antd'
import { React, useState } from 'react'
import ChatboxComponent from '../ChatboxComponent'

function CallTranscriptModal(props) {
    const [visible, setVisible] = useState(true)
    const user = props.user
    const transcript = props.transcript

    const handleClose = () => {
        setVisible(false)
        props.hideCallTranscriptModal()
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

    return (
        <>
            <Modal
                title={
                    <>
                        {transcript?.users.find((user) => user !== props?.user?.nickname) ? (
                            <p style={{ margin: 0 }}>{`Conversation with: ${transcript?.users.find(
                                (user) => user !== props?.user?.nickname
                            )}`}</p>
                        ) : (
                            <p style={{ margin: 0, fontStyle: 'italic' }}>
                                Unattended Conversation
                            </p>
                        )}
                        <p style={{ margin: 0 }}>{`Your communication role: ${getType()}`}</p>
                        <p style={{ margin: 0 }}>{`Date: ${
                            transcript?.date_created['$date'].split('T')[0] || 'N/A'
                        }`}</p>
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
        </>
    )
}

export default CallTranscriptModal
