import HeaderComponent from '../components/HeaderComponent'
import styles from '../styles/Practice.module.css'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/router'
import auth0 from '../auth/auth0'
import { Row, Col, Button, ConfigProvider, Typography } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { theme } from '../core/theme'
import AnswerModal from '../components/modals/AnswerModal'
import fetcher from '../core/fetcher'

export default function PracticeModule({ accessToken }) {
    const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false)
    const { user, error, isLoading } = useUser()
    const router = useRouter()
    const videoReference = useRef(null)
    const videoStream = useRef(null)
    const [isRecording, SetIsRecording] = useState(false)
    const [isResultView, SetIsResultView] = useState(false)
    const [randomWord, setRandomWord] = useState(null)
    const [isretry, setIsRetry] = useState(true)
    const [wordYoutubeUrl, setWordYoutubeUrl] = useState(null)
    const [translationResponse, setTranslationResponse] = useState(null)
    const [video, setVideo] = useState(null)

    const startWebcam = async () => {
        // Check to see if browser has camera support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('Browser Does not suppor current webcam library')
        }

        // get webcam stream
        const webcamStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        // create useref to show the video on display
        videoReference.current.srcObject = webcamStream

        setVideo(webcamStream)

        // create media recorder, and set the stream to it
        const mediaRecorderObject = new MediaRecorder(webcamStream, { mimeType: 'video/webm' })
        // set the use ref to the media recorder
        videoStream.current = mediaRecorderObject
        mediaRecorderObject.start()

        const blobsArray = []
        // send data to array
        mediaRecorderObject.ondataavailable = (e) => {
            blobsArray.push(e.data)
        }

        // on stop create blob object, and covert to formdata to send to server
        mediaRecorderObject.onstop = (e) => {
            const recordedChunk = new Blob(blobsArray, { type: 'video/webm' })
            const formD = new FormData()
            formD.append('video', recordedChunk)

            // to check the video data
            // console.log(recordedChunk)

            // this is where you send the video and get the response, usesState values have been set
            // fetch('http://localhost:8000/api/upload', {
            //     method: 'POST',
            //     body: formD,
            // })
            //     .then((response) => response.json())
            //    .then((data) => {
            //        setTranslationResponse(data.result)
            //        if (data.result == 'bad') {
            //            setIsAnswerModalOpen(true)
            //        }
            //        setIsRetry(false)
            // change to result view only if response is received
            //        SetIsResultView(true)
            //    })

            setIsRetry(false)
            // change to result view only if response is received
            SetIsResultView(true)
        }
        SetIsRecording(true)

        if (isRecording) {
            setTimeout(() => {
                stopRecording()
            }, 10000)
        }
    }

    const StopWebcam = () => {
        if (videoStream.current && isRecording) {
            videoStream.current.stop()
            videoReference.current.srcObject = null
        }
        if (video) {
            video.getTracks().forEach((track) => track.stop())
        }
        SetIsRecording(false)
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

    const handleLeave = async () => {
        router.push('/')
    }

    // To do : change result text color based on server response
    return (
        <ConfigProvider theme={theme}>
            <HeaderComponent user={user} handleLeave={handleLeave} />
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
