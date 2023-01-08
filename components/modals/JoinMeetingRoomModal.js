import { Modal, Input, Space } from 'antd'
import { React, useState } from 'react'

function JoinMeetingRoomModal(props) {
    const [visible, setVisible] = useState(true)

    const handleOk = () => {
        setVisible(false)
        props.hideJoinMeetingRoomModal()
    }

    const handleCancel = () => {
        setVisible(false)
        props.hideJoinMeetingRoomModal()
    }

    return (
        <>
            <Modal
                title="Join a Meeting Room"
                open={visible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Submit"
                width={250}
                bodyStyle={{ height: '8vh', display: 'flex', justifyContent: 'center' }}
                style={{ paddingTop: '9%' }}
            >
                <Space>
                    <Input placeholder="Enter Meeting Room ID" />
                </Space>
            </Modal>
        </>
    )
}

export default JoinMeetingRoomModal
