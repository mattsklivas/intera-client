import HeaderComponent from '../components/HeaderComponent'
// Import styles from '../styles/Home.module.css' <- should make a separate CSS file called Practice.module.css
import { useUser } from '@auth0/nextjs-auth0/client'
import { Row, Col, Button, ConfigProvider } from 'antd'
import { useRef, useState } from 'react'
import { theme } from '../core/theme'
// In progress

export default function PracticeModule() {
    const { user, error, isLoading } = useUser()
    const videoReference = useRef(null)
    const [videoStream, setVideoStream] = useState(false)

    const startWebcam = () => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: false })
            .then((stream) => {
                setVideoStream(stream)
                videoReference.current.srcObject = stream
            })
            .catch((error) => {
                console.error(error)
            })
    }

    const StopWebcam = () => {
        videoStream.getTracks().forEach((track) => track.stop())
    }

    const StartRecording = () => {}

    return (
        <ConfigProvider theme={theme}>
            <HeaderComponent user={user} />
            <div style={{ height: '100vh ', padding: '20px' }}>
                <Row
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Col>
                        <video
                            ref={videoReference}
                            autoPlay
                            style={{
                                border: '1px solid black',
                                width: '400px',
                                height: '300px',
                            }}
                        />
                    </Col>
                </Row>
                <Row
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '20px',
                    }}
                >
                    <Button onClick={startWebcam}>
                        Result view(Test start)
                    </Button>
                </Row>
                <Row>
                    <Col span={12}>
                        <Button
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginLeft: 300,
                                width: 140,
                            }}
                        >
                            Retry
                        </Button>
                    </Col>
                    <Col span={12}>
                        <Button
                            Button
                            style={{
                                display: 'flex',
                                justifyContent: 'left',
                                alignItems: 'left',
                                width: 150,
                            }}
                            onClick={StopWebcam}
                        >
                            New Word (test stop)
                        </Button>
                    </Col>
                </Row>
                <Row
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '20px',
                    }}
                >
                    <Button>View Answer</Button>
                </Row>
            </div>
        </ConfigProvider>
    )
}
