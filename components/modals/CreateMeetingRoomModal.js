import { Modal, Input, Button, Select, Row, Col, Space, notification, Divider } from 'antd'
import { React, useState, useEffect } from 'react'
import fetcher from '../../core/fetcher.js'

import io from 'socket.io-client'

const socket = io('http://127.0.0.1:5000')

// const port = process.env.PORT || 5000;

socket.on('connect', () => {
    console.log(`connect ${socket.id}`)
})

function CreateMeetingRoomModal(props) {
    const [visible, setVisible] = useState(true)
    const [api, contextHolder] = notification.useNotification()
    const [roomId, setRoomId] = useState('')
    const [inviteLink, setInviteLink] = useState('')
    const [hostType, setHostType] = useState('')

    const handleOk = async () => {
        fetcher(props.accessToken, '/api/rooms/register_room', {
            method: 'POST',
            body: JSON.stringify({ room_id: roomId, host_type: hostType }),
        })
            .then(async (res) => {
                return res.data
            })
            .catch(() => {
                setVisible(false)
                props.hideCreateMeetingRoomModal()
            })

        setVisible(false)
        props.hideCreateMeetingRoomModal()
    }

    const handleCancel = () => {
        socket.on('disconnect', () => {
            console.log(`disconnect ${socket.id}`)
        })

        setVisible(false)
        props.hideCreateMeetingRoomModal()
    }

    const populateRoomData = async () => {
        fetcher(props.accessToken, '/api/rooms/create_room_id', {
            method: 'GET',
        })
            .then(async (res) => {
                setRoomId(res?.data?.room_id)
                setInviteLink(res?.data?.invite_link)
            })
            .catch(() => {})
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
                okButtonProps={{ disabled: hostType === '' ? true : false }}
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
                                onChange={(value) => setHostType(value)}
                                options={[
                                    {
                                        value: 'STT',
                                        label: 'Speaker',
                                    },
                                    {
                                        value: 'ASL',
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
