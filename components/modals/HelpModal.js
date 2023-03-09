import { Modal } from 'antd'
import { React, useState } from 'react'
import Image from 'next/image'
import arms from '../../public/arms.jpg'
import angle from '../../public/angle.jpg'
import position from '../../public/position.jpg'
import styles from '../../styles/Modal.module.css'

// TODO: Nick add styles to Modal.module.css
const HelpModal = ({ setIsHelpModalOpen }) => {
    const [visible, setVisible] = useState(true)

    const handleClose = () => {
        setVisible(false)
        setIsHelpModalOpen(false)
    }

    return (
        <Modal
            title={<h2 style={{ margin: '5px 0' }}>Using The Intera Video System</h2>}
            open={visible}
            onCancel={handleClose}
            closable={true}
            cancelButtonProps={{ style: { display: 'none' } }}
            okButtonProps={{ style: { display: 'none' } }}
            width={600}
            bodyStyle={{
                height: 450,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'flex-start',
                maxWidth: '100%',
                overflowY: 'scroll',
            }}
        >
            <div className={styles.helpContainer}>
                <div>
                    <h2> Arm/hand placement while gesturing </h2>
                    <ul>
                        <li> Hands must be visible and in frame when performing a sign </li>
                        <li> Hand enters the frame signaling the start of the sign </li>
                        <li> Hand leaves the frame signaling the end of the sign </li>
                    </ul>
                    <div style={{ marginLeft: '1vw', width: '500px' }}>
                        <Image src={arms} width={500} layout="intrinsic" alt="arms" />
                    </div>
                </div>
                <div>
                    <h2> Starting and stopping ASL translation </h2>
                    <ul>
                        <li>
                            {' '}
                            User must have one or more hands shown in the video feed for translation
                            to being{' '}
                        </li>
                        <li>
                            {' '}
                            Removing both hands from the video feed will terminate translation{' '}
                        </li>
                    </ul>
                    <div style={{ marginLeft: '1vw', width: '500px' }}>
                        <Image src={position} width={500} layout="intrinsic" alt="position" />
                    </div>
                </div>

                <div>
                    <h2> Body positioning </h2>
                    <div style={{ marginLeft: '1vw', width: '500px' }}>
                        <Image src={angle} width={500} layout="intrinsic" alt="angle" />
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default HelpModal
