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

    return (
        <>
            <Modal
                title={`Conversation with ${transcript.username} (Date: ${
                    transcript.date || '2023/01/04'
                })`}
                open={visible}
                onOk={handleClose}
                onCancel={handleClose}
                okButtonProps={{ children: 'Custom OK' }}
                okText="Close"
                cancelButtonProps={{ style: { display: 'none' } }}
                width={650}
                bodyStyle={{ height: 400, overflowY: 'hidden' }}
            >
                <ChatboxComponent user={user} transcript={transcript} />
            </Modal>
        </>
    )
}

export default CallTranscriptModal
