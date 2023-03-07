import {
    Modal,
    Input,
    Button,
    Select,
    Row,
    Col,
    Space,
    notification,
    Divider,
    Spin,
    Form,
    message,
} from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { React, useState, useEffect } from 'react'
import fetcher from '../../core/fetcher.js'
import styles from '../../styles/Modal.module.css'

const CreateMeetingRoomModal = ({ router, accessToken, hideCreateMeetingRoomModal }) => {
    const [form] = Form.useForm()
    const [visible, setVisible] = useState(true)
    const [api, contextHolder] = notification.useNotification()
    const [roomID, setRoomId] = useState('')
    const [inviteLink, setInviteLink] = useState('')
    const [hostType, setHostType] = useState('')
    const [initialized, setInitialized] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingMail, setLoadingMail] = useState(false)
    const [disableInvite, setDisableInvite] = useState(true)
    const [email, setEmail] = useState('')

    const handleOk = async () => {
        setLoading(true)
        fetcher(accessToken, '/api/rooms/register_room', {
            method: 'POST',
            body: JSON.stringify({ room_id: roomID, host_type: hostType }),
        })
            .then(async (res) => {
                if (res.status == 200) {
                    router.push(`/call-page/${roomID}`)
                } else {
                    api.error({
                        message: `Error ${res.status}: ${res.error}`,
                    })
                    setLoading(false)
                    setVisible(false)
                    hideCreateMeetingRoomModal()
                }
            })
            .catch((res) => {
                api.error({
                    message: 'An unknown error has occurred',
                })
                setVisible(false)
                hideCreateMeetingRoomModal()
            })

        setVisible(false)
        hideCreateMeetingRoomModal()
    }

    const handleCancel = () => {
        setVisible(false)
        hideCreateMeetingRoomModal()
    }

    const populateRoomData = async () => {
        fetcher(accessToken, '/api/rooms/create_room_id', {
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

    useEffect(() => {
        if (!initialized && roomID === '') {
            populateRoomData()
            setInitialized(true)
        }
    }, [])

    return (
        <Modal
            title="Create a Meeting Room"
            open={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            okButtonProps={{ disabled: hostType === '' || roomID === '', loading: loading }}
            okText="Continue"
            width={300}
            bodyStyle={{ height: 342 }}
        >
            {contextHolder}
            <Divider plain className={styles.meetingInfoDivider}>
                Meeting Info
            </Divider>
            <Space direction="vertical" size="middle" className={styles.addSpace}>
                <Row type="flex" align="middle">
                    <Col span={24}>
                        <div className={styles.meetingInfoContainer}>
                            <span>Room ID: </span>
                            {roomID ? (
                                <span className={styles.roomIdSpan}>{roomID}</span>
                            ) : (
                                <Spin
                                    className={styles.spinLoading}
                                    indicator={
                                        <LoadingOutlined className={styles.loadingOutline} spin />
                                    }
                                />
                            )}
                        </div>
                        <Button
                            block="true"
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
                    <Col span={24}>
                        <Form
                            form={form}
                            validateMessages={{
                                types: {
                                    email: 'Please enter a valid email',
                                },
                            }}
                            onFieldsChange={() => {
                                const errors = form
                                    .getFieldsError()
                                    .some((item) => item.errors.length)
                                setDisableInvite(errors)
                            }}
                        >
                            <Form.Item
                                name={['email']}
                                rules={[
                                    {
                                        type: 'email',
                                    },
                                ]}
                            >
                                <Input
                                    block="true"
                                    placeholder="Enter Email of Guest to Invite"
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                    }}
                                />
                            </Form.Item>
                            <Button
                                block="true"
                                type="primary"
                                loading={loadingMail}
                                disabled={disableInvite || hostType === ''}
                                onClick={() => {
                                    setLoadingMail(true)
                                    message.info({
                                        key: 'email',
                                        content: 'Sending email and creating room...',
                                    })

                                    fetcher(accessToken, '/api/rooms/email_invite', {
                                        method: 'POST',
                                        body: JSON.stringify({ room_id: roomID, email: email }),
                                    })
                                        .then(async (res) => {
                                            if (res.status == 200) {
                                                message.success({
                                                    content: 'Email sent successfully',
                                                    key: 'email',
                                                })
                                                setLoadingMail(false)

                                                // handleOk()
                                            } else {
                                                message.error({
                                                    content: `Error ${res.status}: ${res.error}`,
                                                    key: 'email',
                                                })
                                                setLoadingMail(false)
                                            }
                                        })
                                        .catch((e) => {
                                            message.error({
                                                content: 'An unknown error has occurred' + e,
                                                key: 'email',
                                            })
                                            setLoadingMail(false)
                                        })
                                }}
                            >
                                Send Invite
                            </Button>
                        </Form>
                    </Col>
                </Row>
                <Divider plain style={{ margin: 0 }}>
                    Role Selection <span className={styles.roleSelectRequired}>*</span>
                </Divider>
                <Row>
                    <Col span={24} className={styles.roleSelectOptions}>
                        <Select
                            defaultValue="Choose Role"
                            className={styles.rolesOption}
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
                        />
                    </Col>
                </Row>
            </Space>
        </Modal>
    )
}

export default CreateMeetingRoomModal
