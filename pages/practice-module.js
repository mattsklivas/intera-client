import HeaderComponent from '../components/HeaderComponent'
import styles from '../styles/Practice.module.css'
import { useUser } from '@auth0/nextjs-auth0/client'
import auth0 from '../auth/auth0'
import { Row, Col, Button, ConfigProvider, Typography } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { theme } from '../core/theme'
import AnswerModal from '../components/modals/AnswerModal'
import fetcher from '../core/fetcher'

// In progress
// page consists of a video div at the bottom, used just for testing will be removed

export default function PracticeModule({ accessToken }) {
    const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false)
    const { user, error, isLoading } = useUser()
    const videoReference = useRef(null)
    const videoStream = useRef(null)
    const [recorder, setRecorder] = useState(null)
    const [isRecording, SetIsRecording] = useState(false)
    const [url, setUrl] = useState(null) // once user stops recording the data is stored in URL,
    // if the user retries the URL will be reset with the new video
    const [blobContent, setBlobContent] = useState(null)

    const [isResultView, SetIsResultView] = useState(false)
    const [randomWord, setRandomWord] = useState(null)
    const [isretry, setIsRetry] = useState(true)
    const [wordYoutubeUrl, setWordYoutubeUrl] = useState(null)
    const [translationResponse, setTranslationResponse] = useState(null)
    const [videoChunk, setVideoChunk] = useState(null)

    const startWebcam = () => {
        // Check to see if browser has camera support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('Browser Does not suppor current webcam library')
        }

        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
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
                    const blob = new Blob(videoData, { type: 'video/mp4' })
                    const videoSrcUrl = URL.createObjectURL(blob)
                    setBlobContent(blob)
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

        // convert blob to mp4
        const formD = new FormData()
        formD.append('audio', blobContent)

        // this is where you send the video and get the response
        fetch('http://localhost:8000/api/upload', {
            method: 'POST',
            body: formD,
        })
            .then((response) => response.json())
            .then((data) => {
                setTranslationResponse(data.result)
                if (data.result == 'bad') {
                    setIsAnswerModalOpen(true)
                }
                setUrl(null)
                setIsRetry(false)
                // change to result view only if response is received
                SetIsResultView(true)
            })

        setUrl(null)
        setBlobContent(null)
        setIsRetry(false)
        // change to result view only if response is received
        SetIsResultView(true)
    }

    const retry = () => {
        SetIsResultView(false)
        setTranslationResponse(null)
    }

    const getNewWord = () => {
        setIsRetry(true)
        SetIsResultView(false)
        setTranslationResponse(null)
    }

    useEffect(() => {
        if (isretry) {
            fetcher(accessToken, '/api/practice/get_word', {
                method: 'GET',
            }).then((response) => {
                setRandomWord(response.data.word)
                setWordYoutubeUrl(response.data.url)
            })
        }
    }, [isResultView])

    // To do : change result text color based on server response
    return (
        <ConfigProvider theme={theme}>
            <HeaderComponent user={user} />
            <div className={styles.main}>
                <Row className={styles.row1}>
                    <Col>
                        <video ref={videoReference} autoPlay className={styles.row1Col1} />
                    </Col>
                </Row>
                {isResultView ? (
                    <Row className={styles.row2}>
                        <Typography className={styles.typo}>
                            <strong>Result: {translationResponse}</strong>
                        </Typography>
                    </Row>
                ) : (
                    <Row className={styles.row2}>
                        <Typography className={styles.typo}>
                            <strong>Sign the word : {randomWord}</strong>
                        </Typography>
                    </Row>
                )}
                {isResultView ? (
                    <Row>
                        <Col span={12} className={styles.row3col}>
                            <Button
                                type="primary"
                                className={styles.row3ButtonRetry}
                                onClick={retry}
                            >
                                Retry
                            </Button>
                        </Col>
                        <Col span={12} className={styles.row3col}>
                            <Button
                                type="primary"
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
                            <Button onClick={StopWebcam} className={styles.StopButton}>
                                Stop Recording
                            </Button>
                        ) : (
                            <Button
                                onClick={startWebcam}
                                type="primary"
                                className={styles.StartButton}
                            >
                                Start Recording
                            </Button>
                        )}
                    </Row>
                )}

                <Row className={styles.row4}>
                    <Button
                        onClick={() => setIsAnswerModalOpen(true)}
                        type="primary"
                        className={styles.viewAnswerButton}
                    >
                        View Answer
                    </Button>
                </Row>
            </div>
            {isAnswerModalOpen && (
                <AnswerModal
                    word={wordYoutubeUrl}
                    hideAnswerModal={() => {
                        setIsAnswerModalOpen(false)
                    }}
                />
            )}
        </ConfigProvider>
    )
}
export const getServerSideProps = async (context) => {
    let accessToken = (await auth0.getSession(context.req, context.res)) || null
    if (accessToken != null) {
        accessToken = accessToken.idToken
    }
    return { props: { accessToken } }
}
