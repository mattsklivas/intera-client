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

    const messages = [
        {
            body: 'Sed ut perspiciatis unde omnis.',
            created: new Date(2023, 1, 4, 23, 30, 0),
            user: 'Bret',
        },
        {
            body: 'Iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto.',
            created: new Date(2023, 1, 4, 23, 31, 0),
            user: user.nickname,
        },
        {
            body: 'Beatae vitae dicta sunt explicabo.',
            created: new Date(2023, 1, 4, 23, 32, 0),
            user: 'Bret',
        },
        {
            body: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.',
            created: new Date(2023, 1, 4, 23, 33, 0),
            user: user.nickname,
        },
        {
            body: 'Incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem.',
            created: new Date(2023, 1, 4, 23, 34, 0),
            user: 'Bret',
        },
        {
            body: 'Numquam eius modi tempora.',
            created: new Date(2023, 1, 4, 23, 35, 0),
            user: user.nickname,
        },
        {
            body: 'Ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.',
            created: new Date(2023, 1, 4, 23, 36, 0),
            user: 'Bret',
        },
        {
            body: 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla.',
            created: new Date(2023, 1, 4, 23, 37, 7),
            user: user.nickname,
        },
    ]

    return (
        <>
            <Modal
                title={`Conversation with ${transcript.username} (Date: ${
                    transcript.date || '2023/01/04'
                })`}
                open={visible}
                onOk={handleClose}
                onCancel={handleClose}
                okButtonProps={{ children: 'Custom OK' }}
                okText="Close"
                cancelButtonProps={{ style: { display: 'none' } }}
                width={650}
                bodyStyle={{ height: 400, overflowY: 'hidden' }}
            >
                <ChatboxComponent user={user} transcript={messages} />
            </Modal>
        </>
    )
}

export default CallTranscriptModal
