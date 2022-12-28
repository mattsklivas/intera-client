import { Modal, Typography, Input, Space } from 'antd'
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
        okButtonProps={{ children: 'Custom OK' }}
        cancelButtonProps={{ children: 'Custom cancel' }}
        okText="submit"
        width={500}
        bodyStyle={{ height: '10vh' }}
      >
        <Space>
          <Typography>Enter Meeting ID and click Submit</Typography>
          <Input placeholder="Enter Meeting ID" />
        </Space>
      </Modal>
    </>
  )
}

export default JoinMeetingRoomModal
