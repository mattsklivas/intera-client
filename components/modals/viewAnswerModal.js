import { Modal } from 'antd'
import { React, useState } from 'react'

function ViewAnswerModal(props) {
    const [visible, setVisible] = useState(true)
    const wordDetails = props.word // Has the youtube url, need to parse the id
    const midPoint = wordDetails.indexOf('=')
    const embedID = wordDetails.substr(midPoint + 1)

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
                    src={`https://www.youtube.com/embed/${embedID}`}
                    style={{
                        width: 500,
                        height: 300,
                        border: '1px solid black',
                        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
                    }}
                    allowFullScreen
                />
            </Modal>
        </>
    )
}

export default ViewAnswerModal
