import { React, useState } from 'react'
import { Modal, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import styles from '../../styles/Modal.module.css'

const AnswerModal = ({ link, word, hideAnswerModal }) => {
    const [visible, setVisible] = useState(true)
    const [loading, setLoading] = useState(true)

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
            {loading && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#f3f3f3',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Spin indicator={<LoadingOutlined spin />} />
                </div>
            )}
            <iframe
                src={link}
                className={styles.ytVideoIframe}
                onLoad={() => {
                    setLoading(false)
                }}
                style={{
                    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
                    display: loading ? 'none' : 'block',
                    width: '100%',
                    height: '100%',
                }}
                allowFullScreen
            />
        </Modal>
    )
}

export default AnswerModal
