import { Modal, Typography, Input, Button, Select, Row, Col, Space } from 'antd'
import { React, useState, useEffect } from 'react'

// put this elsewhere
let API_URL = 'http://127.0.0.1:5000'
let headers = new Headers()
headers.append('Content-Type', 'application/json')
headers.append('Accept', 'application/json')
headers.append('Origin', '0.0.0.0:3000')

function CreateMeetingRoomModal(props) {
    const [visible, setVisible] = useState(true)
    const { Paragraph } = Typography
    const [roomId, setRoomId] = useState('')
    const [inviteLink, setInviteLink] = useState('')
    const [hostType, setHostType] = useState('ASL')

    const handleOk = async () => {
        fetch(`${API_URL}/api/rooms/register_room`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ room_id: roomId, host_type: hostType }),
        })
            .then(async (response) => {
                const json = await response.json()
                return resolve(json)
            })
            .catch(() => {
                setVisible(false)
                props.hideCreateMeetingRoomModal()
            })

        setVisible(false)
        props.hideCreateMeetingRoomModal()
    }

    const handleCancel = () => {
        setVisible(false)
        props.hideCreateMeetingRoomModal()
    }

    const handleChange = (value) => {
        setHostType(value)
    }

    // data: {room_id: val, invite_link: str}
    const getRoomData = async () => {
        const res = new Promise((resolve, reject) => {
            fetch(`${API_URL}/api/rooms/create_room_id`, {
                method: 'GET',
                headers: headers,
            })
                .then(async (response) => {
                    const json = await response.json()

                    return resolve(json)
                })
                .catch((error) => {
                    reject(error)
                })
        })

        return res
    }

    const populateRoomData = () => {
        getRoomData().then((response) => {
            console.log(response.data)
            setRoomId(response.data?.room_id)
            setInviteLink(response.data?.invite_link)
        })
    }

    useEffect(() => {
        populateRoomData()
    }, [])

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
                        <Paragraph copyable={{ text: inviteLink }}>
                            Copy meeting link: {roomId}
                        </Paragraph>
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
                                defaultValue="ASL"
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
