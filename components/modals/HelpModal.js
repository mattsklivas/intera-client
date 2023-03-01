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
    // const link = props.link
    // const word = props.word

    const handleClose = () => {
        setVisible(false)
        setIsHelpModalOpen(false)
    }

    return (
        <Modal
            title={<h2>Using Intera Video System</h2>}
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
            }}
        >
            <div className={styles.helpContainer}>
                <div>
                    <h2> Arm guidelines </h2>
                    <ul>
                        <li> Hands must be visible and in frame when performing sign </li>
                        <li> Hand enters the frame signaling the start of the sign </li>
                        <li> Hand leaves the frame signaling the end of the sign </li>
                    </ul>
                    <Image src={arms} width="35px" height="30px" />
                </div>
                <div>
                    <h2> More guidelines </h2>
                    <p>
                        Starting and stopping ASL translation:
                        <br /> User must have one or more hands shown in the video feed for
                        translation to being
                        <br /> Removing both hands from the video feed will terminate translation
                    </p>

                    <Image src={position} width="35px" height="30px" />
                </div>

                <div>
                    <h2> Even more guidelines </h2>
                    <Image src={angle} width="35px" height="30px" />
                </div>
            </div>
        </Modal>
    )
}

export default HelpModal
