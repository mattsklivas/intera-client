import { Modal } from 'antd'
import { React, useState } from 'react'
import styles from '../../styles/Modal.module.css'

const AnswerModal = ({ link, word, hideAnswerModal }) => {
    const [visible, setVisible] = useState(true)

    const handleClose = () => {
        setVisible(false)
        hideAnswerModal()
    }

    // Make sure the youtube url is of the format  yt.com/embed/id
    return (
        <Modal
            title={
                <div>
                    <span>How to sign the word: </span>
                    <span style={{ fontWeight: 'bold' }}>
                        {word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()}
                    </span>
                </div>
            }
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
                src={link}
                className={styles.ytVideoIframe}
                style={{
                    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
                }}
                allowFullScreen
            />
        </Modal>
    )
}

export default AnswerModal
