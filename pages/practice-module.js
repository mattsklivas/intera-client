import HeaderComponent from '../components/HeaderComponent'
import styles from '../styles/Practice.module.css'
import { useUser } from '@auth0/nextjs-auth0/client'
import { Row, Col, Button, ConfigProvider, Typography } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { theme } from '../core/theme'
import ViewAnswerModal from '../components/modals/viewAnswerModal'
// In progress

function PracticeModule() {
    const [isviewAnswerModalOpen, setIsviewAnswerModalOpen] = useState(false)
    const { user, error, isLoading } = useUser()
    const videoReference = useRef(null)
    const videoStream = useRef(null)
    const [recorder, setRecorder] = useState(null)
    const [isRecording, SetIsRecording] = useState(false)
    const [url, setUrl] = useState(null) // once user stops recording the data is stored in URL,
    // if the user retries the URL will be reset with the new video

    const [isResultView, SetIsResultView] = useState(false)
    const [randomWord, setRandomWord] = useState(null)
    const [isretry, setIsRetry] = useState(true)

    const startWebcam = () => {
        // Check to see if browser has camera support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('Browser Does not suppor current webcam library')
        }

        navigator.mediaDevices
            .getUserMedia({ video: true, audio: false })
            .then((s) => {
                // video stream with the current webcam stream
                videoStream.current = s
                // video reference need for video playback, for testing
                videoReference.current.srcObject = s
                // create media recorder with video stream
                const recorder = new MediaRecorder(videoStream.current)
                // array to store the video data from media recorder
                const videoData = []
                // Initialize media recorder when data is available
                recorder.ondataavailable = (e) => {
                    videoData.push(e.data)
                }
                // Initialize media recorder when recorder is stopped
                recorder.onstop = (e) => {
                    // Once the recorder is stopped, use the video data array to create a video src url
                    const blob = new Blob(videoData)
                    const videoSrcUrl = URL.createObjectURL(blob)
                    // set the url
                    setUrl(videoSrcUrl)
                }
                setRecorder(recorder)
                recorder.start()
                SetIsRecording(true)
                if (isRecording) {
                    setTimeout(() => {
                        StopWebcam(), recorder.stop()
                    }, 10000) // stop after 10 secs, max limit
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }

    const retry = () => {
        SetIsResultView(false)
    }

    const StopWebcam = () => {
        if (isRecording) {
            // Stop the media Recorder
            recorder.stop()
        }
        if (isRecording) {
            // Stop webcam
            videoStream.current.getTracks().forEach((track) => track.stop())
        }
        if (isRecording) {
            // set the video reference to null
            videoReference.current.srcObject = null
        }
        SetIsRecording(false)
        // send the video to the server and get the response
        // set url to null
        setIsRetry(false)
        SetIsResultView(true)
    }

    const getNewWord = () => {
        setIsRetry(true)
        SetIsResultView(false)
    }

    useEffect(() => {
        if (isretry) {
            const words = ['hello', 'hi', 'morning']
            const index = Math.floor(Math.random() * words.length)
            setRandomWord(words[index])
        }
    }, [isResultView])

    return (
        <ConfigProvider theme={theme}>
            <HeaderComponent user={user} />
            <div style={{ height: '100vh ', padding: '20px' }}>
                <Row className={styles.row1}>
                    <Col>
                        <video
                            ref={videoReference}
                            autoPlay
                            className={styles.row1Col1}
                        />
                    </Col>
                </Row>
                {isResultView ? (
                    <Row className={styles.row2}>
                        <Typography>Result: good</Typography>
                    </Row>
                ) : (
                    <Row className={styles.row2}>
                        <Typography>Sign the word : {randomWord}</Typography>
                    </Row>
                )}
                {isResultView ? (
                    <Row>
                        <Col span={12}>
                            <Button
                                className={styles.row3ButtonRetry}
                                onClick={retry}
                            >
                                Retry
                            </Button>
                        </Col>
                        <Col span={12}>
                            <Button
                                Button
                                className={styles.row3ButtonNewWord}
                                onClick={getNewWord}
                            >
                                New Word
                            </Button>
                        </Col>
                    </Row>
                ) : (
                    <Row className={styles.row3StartStop}>
                        {isRecording ? (
                            <Button onClick={stopRecording}>
                                Start/Stop Recording
                            </Button>
                        ) : (
                            <Button onClick={startWebcam}>
                                Start/Stop Recording
                            </Button>
                        )}
                    </Row>
                )}

                <Row className={styles.row4}>
                    <Button onClick={() => setIsviewAnswerModalOpen(true)}>
                        View Answer
                    </Button>
                </Row>
                {url && (
                    <div>
                        <video
                            src={url}
                            autoPlay
                            className={styles.row1Col1}
                            controls={true}
                        />
                    </div>
                )}
            </div>
            {isviewAnswerModalOpen && (
                <ViewAnswerModal
                    // word = {} word, word's youtube video url
                    hideViewAnswerModal={() => {
                        setIsviewAnswerModalOpen(false)
                    }}
                />
            )}
        </ConfigProvider>
    )
}

export default PracticeModule
