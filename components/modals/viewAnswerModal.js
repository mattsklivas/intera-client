import { Modal } from 'antd'
import { React, useState } from 'react'

function ViewAnswerModal(props) {
    const [visible, setVisible] = useState(true)
    const wordDetails = props.word // Should have the video url or the id

    const handleClose = () => {
        setVisible(false)
        props.hideViewAnswerModal()
    }
    // Make sure the youtube url is of the format  yt.com/embed/id
    return (
        <>
            <Modal
                title="Answer"
                open={visible}
                onOk={handleClose}
                onCancel={handleClose}
                okButtonProps={{ children: 'Custom OK' }}
                okText="Close"
                cancelButtonProps={{ style: { display: 'none' } }}
                width={650}
                bodyStyle={{
                    height: 320,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <iframe
                    src={'https://www.youtube.com/embed/dQw4w9WgXcQ'}
                    style={{
                        width: 500,
                        height: 300,
                        border: '1px solid black',
                    }}
                    allowFullScreen
                />
            </Modal>
        </>
    )
}

export default ViewAnswerModal
