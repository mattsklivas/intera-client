import { Modal, Input, Button, Select, Row, Col, Space, notification, Divider, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { React, useState, useEffect } from 'react'
import fetcher from '../../core/fetcher.js'

import socketio from 'socket.io-client'

function CreateMeetingRoomModal(props) {
    const [visible, setVisible] = useState(true)
    const [api, contextHolder] = notification.useNotification()
    const [roomID, setRoomId] = useState('')
    const [inviteLink, setInviteLink] = useState('')
    const [hostType, setHostType] = useState('')
    const [initialized, setInitialized] = useState(false)
    const [loading, setLoading] = useState(false)

    // let socket = io.connect(null, {port: 8000, rememberTransport: false});

    const s_webrtc = socketio('http://localhost:5000', {
        cors: {
            origin: 'http://localhost:3000',
            credentials: true,
        },
        transports: ['websocket'],
    })

    const handleOk = async () => {
        setLoading(true)
        fetcher(props.accessToken, '/api/rooms/register_room', {
            method: 'POST',
            body: JSON.stringify({ room_id: roomID, host_type: hostType }),
        })
            .then(async (res) => {
                if (res.status == 200) {
                    props.router.push(`/call-page/${roomID}`)
                } else {
                    api.error({
                        message: `Error ${res.status}: ${res.message}`,
                    })
                    setLoading(false)
                    setVisible(false)
                    props.hideCreateMeetingRoomModal()
                }
            })
            .catch((res) => {
                api.error({
                    message: 'An unknown error has occurred',
                })
                console.log('Error', res)
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

    const populateRoomData = async () => {
        fetcher(props.accessToken, '/api/rooms/create_room_id', {
            method: 'GET',
        })
            .then(async (res) => {
                setRoomId(res?.data?.room_id)
                setInviteLink(res?.data?.invite_link)
            })
            .catch((err) => {
                console.log(err)
            })
    }

    // create on connect event
    s_webrtc.connect()
    s_webrtc.on('connect', () => {
        console.log('Connected to the server!')
    })

    s_webrtc.on('disconnect', () => {
        console.log('Disconnected from the server.')
    })

    useEffect(() => {
        if (!initialized && roomID === '') {
            populateRoomData()
            setInitialized(true)
        }
    }, [])

    return (
        <>
            <Modal
                title="Create a Meeting Room"
                open={visible}
                onOk={handleOk}
                onCancel={handleCancel}
                okButtonProps={{ disabled: hostType === '' || roomID === '', loading: loading }}
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
                                {roomID ? (
                                    <span
                                        style={{
                                            paddingLeft: 2,
                                            fontWeight: 500,
                                            color: '#1677ff',
                                        }}
                                    >
                                        {' ' + roomID}
                                    </span>
                                ) : (
                                    <Spin
                                        style={{ paddingLeft: 5 }}
                                        indicator={
                                            <LoadingOutlined
                                                style={{
                                                    fontSize: 16,
                                                }}
                                                spin
                                            />
                                        }
                                    />
                                )}
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
