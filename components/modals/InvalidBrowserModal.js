import { React, useState } from 'react'
import { Modal } from 'antd'
import { CloseCircleFilled } from '@ant-design/icons'

const InvalidBrowserModal = () => {
    const [visible, setVisible] = useState(true)

    return (
        <Modal
            title={
                <h2 style={{ margin: '5px 0' }}>
                    <CloseCircleFilled style={{ color: '#ff4d4f', marginRight: 5 }} /> Unsupported
                    Browser
                </h2>
            }
            open={visible}
            closable={true}
            onCancel={() => setVisible(false)}
            width={500}
            footer={null}
            style={{ paddingTop: '10%' }}
            bodyStyle={{
                height: 110,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'flex-start',
                maxWidth: '100%',
            }}
        >
            <div style={{ marginTop: 10, fontSize: 18, fontWeight: 400, textAlign: 'center' }}>
                Our speech-to-text function is currently only supported in Google Chrome. Please
                install and switch over to Google Chrome in order to create and join calls.
            </div>
        </Modal>
    )
}

export default InvalidBrowserModal
