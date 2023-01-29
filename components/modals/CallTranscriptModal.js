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
                title={`Conversation with ${transcript?.users.find(
                    (user) => user !== props?.user?.nickname
                )} (Date: ${transcript?.date_created['$date'].split('T')[0] || 'N/A'})`}
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
