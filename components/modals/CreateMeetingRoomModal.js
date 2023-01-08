import { Modal, Input, Button, Select, Row, Col, Space, notification, Divider } from 'antd'
import { React, useState, useEffect } from 'react'

// put this elsewhere
let API_URL = 'http://127.0.0.1:5000'
let headers = new Headers()
headers.append('Content-Type', 'application/json')
headers.append('Accept', 'application/json')
headers.append('Origin', '0.0.0.0:3000')

function CreateMeetingRoomModal(props) {
    const [visible, setVisible] = useState(true)
    const [api, contextHolder] = notification.useNotification()
    const [roomId, setRoomId] = useState('')
    const [inviteLink, setInviteLink] = useState('')
    const [role, setRole] = useState('')

    const handleOk = () => {
        setVisible(false)
        props.hideCreateMeetingRoomModal()
    }

    const handleCancel = () => {
        setVisible(false)
        props.hideCreateMeetingRoomModal()
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
                okButtonProps={{ disabled: role === '' ? true : false }}
                okText="Continue"
                width={300}
                bodyStyle={{ height: '46vh' }}
            >
                {contextHolder}
                <Divider plain style={{ margin: '10px 0' }}>
                    Meeting Info
                </Divider>
                <Space direction="vertical" size="middle">
                    <Row type="flex" align="middle">
                        <Col span={24}>
                            <div
                                style={{
                                    paddingBottom: 15,
                                    display: 'flex',
                                    justifyContent: 'center',
                                }}
                            >
                                <span style={{ paddingRight: 2 }}>Room ID: </span>
                                <span style={{ paddingLeft: 2, fontWeight: 500, color: '#1677ff' }}>
                                    {' '}
                                    {roomId}
                                </span>
                            </div>
                            <Button
                                block
                                type="primary"
                                onClick={() => {
                                    navigator.clipboard.writeText(inviteLink)

                                    api.info({
                                        message: 'Meeting link copied to clipboard',
                                    })
                                }}
                            >
                                Copy Meeting Link
                            </Button>
                        </Col>
                    </Row>
                    <Divider plain style={{ margin: 0 }}>
                        Guest Invitation
                    </Divider>
                    <Row type="flex" align="middle">
                        <Col span={24} style={{ paddingBottom: 15 }}>
                            <Input block placeholder="Enter Email of Guest to Invite" />
                        </Col>
                        <Col span={24}>
                            <Button block type="primary">
                                Send Invite
                            </Button>
                        </Col>
                    </Row>
                    <Divider plain style={{ margin: 0 }}>
                        Role Selection <span style={{ color: 'red' }}>*</span>
                    </Divider>
                    <Row>
                        <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
                            <Select
                                defaultValue="Choose Role"
                                onChange={(value) => setRole(value)}
                                options={[
                                    {
                                        value: 'speaker',
                                        label: 'Speaker',
                                    },
                                    {
                                        value: 'signer',
                                        label: 'ASL Signer',
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
