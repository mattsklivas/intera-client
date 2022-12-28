import { Modal, Typography, Input, Button, Select, Row, Col, Space } from 'antd'
import { React, useState } from 'react'

function CreateMeetingRoomModal(props) {
  const [visible, setVisible] = useState(true)
  const { Paragraph } = Typography

  const handleOk = () => {
    setVisible(false)
    props.hideCreateMeetingRoomModal()
  }

  const handleCancel = () => {
    setVisible(false)
    props.hideCreateMeetingRoomModal()
  }

  const handleChange = (value) => {
    // Do something
  }

  return (
    <>
      <Modal
        title="Create a Meeting Room"
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        okButtonProps={{ children: 'Custom OK' }}
        cancelButtonProps={{ children: 'Custom cancel' }}
        okText="Continue"
        width={300}
        bodyStyle={{ height: '40vh' }}
      >
        <Row>
          <Col span={24}>
            <Paragraph copyable>This is the meeting link </Paragraph>
          </Col>
        </Row>
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <Row>
            <Col span={24}>
              <Input
                placeholder="Enter Guest Email for invite"
                style={{ width: 250 }}
              />
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Button>Email invite Submit</Button>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Select
                defaultValue="Choose role"
                onChange={handleChange}
                options={[
                  {
                    value: 'Speaker',
                    label: 'Speaker',
                  },
                  {
                    value: 'ASL',
                    label: 'ASL',
                  },
                ]}
                style={{ width: 150 }}
              />
            </Col>
          </Row>
        </Space>
      </Modal>
    </>
  )
}

export default CreateMeetingRoomModal
