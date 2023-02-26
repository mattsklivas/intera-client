import { Modal } from 'antd'
import { React, useState } from 'react'
import arms from '../../public/arms.jpg'

function HelpModal(props) {
    const [visible, setVisible] = useState(true)
    // const link = props.link
    // const word = props.word

    const handleClose = () => {
        setVisible(false)
        props.setIsHelpModalOpen(false)
    }

    // Make sure the youtube url is of the format  yt.com/embed/id
    return (
        <>
            <Modal
                title={<h2>Using Intera Video System</h2>}
                open={visible}
                onCancel={handleClose}
                closable={true}
                cancelButtonProps={{ style: { display: 'none' } }}
                okButtonProps={{ style: { display: 'none' } }}
                width={650}
                bodyStyle={{
                    height: 320,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <div>
                    <h1>Title</h1>
                    <ul>
                        <li>Bullet point 1</li>
                        <li>Bullet point 2</li>
                        <li>Bullet point 3</li>
                    </ul>
                    <img
                        src="https://imgur.com/a/lczTOPr"
                        alt="Arms"
                        width="350px"
                        height="300px"
                        layout="responsive"
                    ></img>
                </div>

                <div>
                    <p>
                        Starting and stopping ASL translation:
                        <br /> User must have one or more hands shown in the video feed for
                        translation to being
                        <br /> Removing both hands from the video feed will terminate translation
                    </p>

                    <img src="https://imgur.com/a/5muqDKt" alt="Position" />
                </div>
                <div>
                    <img src="https://imgur.com/a/ztCZmy6" alt="Angle" />
                </div>
            </Modal>
        </>
    )
}

// return (
//   <>

//     <Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
//       <p>Some contents...</p>
//       <p>Some contents...</p>
//       <p>Some contents...</p>
//     </Modal>
//   </>
// );
// };

export default HelpModal
