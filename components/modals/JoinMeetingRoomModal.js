import { Modal, Input, Space, Button, notification } from 'antd'
import { React, useState } from 'react'
import { fetcher } from '../../core/fetchers'

function JoinMeetingRoomModal(props) {
    const [loading, setLoading] = useState(false)
    const [visible, setVisible] = useState(true)
    const [roomID, setRoomID] = useState('')
    const [api, contextHolder] = notification.useNotification()

    // TODO: Test this
    const handleOk = () => {
        setLoading(true)
        if (roomID.length == 8) {
            fetcher(props.accessToken, '/api/rooms/join_room', {
                method: 'PUT',
                body: JSON.stringify({ room_id: roomID, user_id: props.user.nickname }),
            })
                .then((res) => {
                    if (res.status == 200) {
                        props.router.push(`/call-page/${roomID}`)
                    } else {
                        api.error({
                            message: `Error ${res.status}: ${res.error}`,
                        })
                        setLoading(false)
                    }
                })
                .catch((res) => {
                    api.error({
                        message: 'An unknown error has occurred',
                    })
                    setVisible(false)
                    props.hideJoinMeetingRoomModal()
                })
        } else {
            setLoading(false)
            api.error({
                message: 'Meeting ID must be of length 8',
            })
        }
    }

    const handleCancel = () => {
        setVisible(false)
        props.hideJoinMeetingRoomModal()
    }

    return (
        <Modal
            title={'Join a Meeting Room'}
            open={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            okText={'Submit'}
            width={250}
            bodyStyle={{ display: 'flex', justifyContent: 'center', height: '8vh' }}
            style={{ paddingTop: '9%' }}
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    Cancel
                </Button>,
                <Button key={'submit'} type={'primary'} loading={loading} onClick={handleOk}>
                    Submit
                </Button>,
            ]}
        >
            {contextHolder}
            <Space>
                <Input
                    placeholder={'Enter Meeting Room ID'}
                    onChange={(event) => setRoomID(event.target.value)}
                />
            </Space>
        </Modal>
    )
}

export default JoinMeetingRoomModal
