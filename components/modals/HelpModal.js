import { React, useState } from 'react'
import { Modal } from 'antd'
import Image from 'next/image'
import arms from '../../public/arms.jpg'
import angle from '../../public/angle.jpg'
import position from '../../public/position.jpg'
import styles from '../../styles/Modal.module.css'

// TODO: Nick add styles to Modal.module.css
const HelpModal = ({ setIsHelpModalOpen, isPractice = false, isCall = false }) => {
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
            width={800}
            bodyStyle={{
                height: 500,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'flex-start',
                maxWidth: '100%',
                overflowY: 'scroll',
            }}
        >
            <div className={styles.helpContainer}>
                {isPractice && (
                    <div>
                        <h2>The Practice Module</h2>
                        <ul>
                            <li>
                                You will be prompted to sign a specific word shown in the{' '}
                                <strong>Sign the word</strong> box.
                            </li>
                            <li>You must attempt to perform the ASL sign for the given word.</li>
                            <li>
                                An example video is available at all times of the given word being
                                signed.
                            </li>
                            <li>
                                <strong>Starting a sign attempt: </strong>pressing the{' '}
                                <i>Start Recording</i> button will commence the sign translation.
                            </li>
                            <li>
                                When you have finished perfoming the sign, select the{' '}
                                <i>Stop Recording</i> button.
                            </li>
                            <li>
                                The sign attempt will be processed, and a result will be provided.
                            </li>
                            <li>
                                You now have the option to retry the same word, or attempt a new
                                one.
                            </li>
                        </ul>
                        <strong>
                            For more information on performing sign attempts, see the sections
                            below.
                        </strong>
                    </div>
                )}

                {isCall && (
                    <div>
                        <h2>The Call Page</h2>
                        <ul>
                            <strong>Using Sign Translation</strong>
                            <li>
                                To <strong>begin</strong> a sign translation, press the{' '}
                                <strong>spacebar</strong> key.
                            </li>
                            <li>
                                To <strong>stop</strong> a sign translation, press the{' '}
                                <strong>spacebar</strong> key again.
                            </li>
                        </ul>
                        <ul>
                            <strong>Using Speech-to-text</strong>
                            <li>
                                To <strong>begin</strong> a speech transcription,{' '}
                                <strong>hold</strong> the <strong>spacebar</strong> key and speak
                                into the microphone.
                            </li>
                            <li>
                                To <strong>stop</strong> a speech transcription,{' '}
                                <strong>release</strong> the <strong>spacebar</strong> key.
                            </li>
                        </ul>
                        <strong>
                            For more information on performing sign attempts, see the sections
                            below.
                        </strong>
                    </div>
                )}

                <div>
                    <h2>1. Arm, hand, and torso placement while gesturing </h2>
                    <ul>
                        <li>The torso and head must be present at all times in the video feed.</li>
                        <li>The signer must be centered in the video feed.</li>
                        <li>Hands must be visible and in frame when performing a sign.</li>
                        <li>
                            Gestures where a hand is out of frame will not be captured properly.
                        </li>
                        <li>
                            The camera must have a clear line of sign of the user, nothing should
                            impeed its vision.
                        </li>
                        <li>
                            Sign attempts where the user is not positioned correctly cannot be
                            guaranteed to be accurate.
                        </li>
                    </ul>
                    <div style={{ marginLeft: '1vw', width: '700px' }}>
                        <Image src={position} width={700} layout="intrinsic" alt="position" />
                    </div>
                </div>
                <div style={{ marginRight: '5%' }}>
                    <h2>2. Body positioning </h2>
                    <ul>
                        <li>
                            To ensure optimal translation, the signer should appear directly
                            perpendicular to the camera.
                        </li>
                        <li>The signer should not be turned more than 30° to the camera.</li>
                        <li>
                            The signer should increase the distance between themselves and the
                            webcam to mimic using a camera with a wider field of view, in the event
                            they cannot be centered in frame.
                        </li>
                    </ul>
                    <div style={{ marginLeft: '1vw', width: '700px' }}>
                        <Image src={angle} width={700} layout="intrinsic" alt="angle" />
                    </div>
                </div>
                <div>
                    <h2>3. Starting and stopping ASL translation </h2>
                    <ul>
                        <li>
                            Placing <strong>both</strong> hands in the video feed will{' '}
                            <strong>start</strong> translation.
                        </li>
                        <li>
                            Placing <strong>one</strong> hand in the video feed will{' '}
                            <strong>start</strong> translation.
                        </li>
                        <li>
                            Removing one or both hands from the video feed will{' '}
                            <strong>terminate</strong> translation.
                        </li>
                        <li>
                            If a hand remains in the video feed, translation will{' '}
                            <strong>not terminate</strong>.
                        </li>
                    </ul>
                    <div style={{ marginLeft: '1vw', width: '700px' }}>
                        <Image src={arms} width={700} layout="intrinsic" alt="arms" />
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default HelpModal
