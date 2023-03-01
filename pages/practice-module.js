import HeaderComponent from '../components/HeaderComponent'
import styles from '../styles/Practice.module.css'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/router'
import auth0 from '../auth/auth0'
import { Row, Col, Button, ConfigProvider, Typography, Spin, message } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { useEffect, useRef, useState } from 'react'
import { theme } from '../core/theme'
import AnswerModal from '../components/modals/AnswerModal'
import fetcher from '../core/fetcher'

const PracticeModule = ({ accessToken }) => {
    const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false)
    const { user, error, isLoading } = useUser()
    const router = useRouter()
    const videoReference = useRef(null)
    const videoStream = useRef(null)
    const [isVideoEnabled, setIsVideoEnabled] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [isResultView, setIsResultView] = useState(false)
    const [isInitalized, setIsInitalized] = useState(false)
    const [randomWord, setRandomWord] = useState(null)
    const [isRetry, setIsRetry] = useState(true)
    const [wordYoutubeUrl, setWordYoutubeUrl] = useState(null)
    const [translationResponse, setTranslationResponse] = useState(null)
    const [video, setVideo] = useState(null)

    const startWebcam = async () => {
        // Check to see if browser has camera support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            message.error('Browser does not support current webcam library')
        }

        // get webcam stream
        const webcamStream = await navigator.mediaDevices
            .getUserMedia({
                audio: false,
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            })
            .then((stream) => {
                stream?.active && setIsVideoEnabled(true)

                // create useref to show the video on display
                // todo possible issue if user allows video but leaves before it is setup
                videoReference.current.srcObject = stream

                setVideo(stream)

                // create media recorder, and set the stream to it
                const mediaRecorderObject = new MediaRecorder(stream, { mimeType: 'video/webm' })
                // set the use ref to the media recorder
                videoStream.current = mediaRecorderObject

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
                    //        setIsResultView(true)
                    //    })

                    // change to result view only if response is received
                    setIsResultView(true)
                }
                setIsRetry(false)
                setIsInitalized(true)
                if (isRecording) {
                    setTimeout(() => {
                        stopWebcam()
                    }, 10000)
                }
            })
    }

    const stopWebcam = async () => {
        if (videoStream.current && isRecording) {
            videoStream.current.stop()
            // videoReference.current.srcObject = null
        }
        if (video) {
            video.getTracks().forEach((track) => track.stop())
        }
        setIsRecording(false)
    }

    const retry = () => {
        setIsResultView(false)
        setTranslationResponse(null)
    }

    const getNewWord = () => {
        setIsRetry(true)
        setIsResultView(false)
        setTranslationResponse(null)
    }

    const startRecording = () => {
        if (videoStream.current && !isRecording) {
            videoStream.current.start()
        }
        setIsRecording(true)
    }

    const stopRecording = () => {
        if (videoStream.current && isRecording) {
            videoStream.current.stop()
        }
        setIsRecording(false)
    }

    const formatWord = (word) => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    }

    useEffect(() => {
        // TODO: Modify startWebcam as it will only be called once to prevent creating new instance on every new word
        startWebcam()
    }, [])

    useEffect(() => {
        if (isRetry) {
            fetcher(accessToken, '/api/practice/get_word', {
                method: 'GET',
            }).then((response) => {
                setRandomWord(response.data.word.toUpperCase())
                setWordYoutubeUrl(response.data.url)
            })
        }
    }, [isResultView])

    const handleLeave = async () => {
        await stopWebcam()
            .then(() => {
                router.push('/')
            })
            .catch(() => {
                router.push('/')
            })
    }

    // TODO : change result text color based on server response
    return (
        <ConfigProvider theme={theme}>
            <HeaderComponent user={user} handleLeave={handleLeave} />
            <div className={styles.practiceModuleDiv}>
                <Row className={styles.videoContainer}>
                    <Col>
                        <video
                            ref={videoReference}
                            autoPlay
                            className={styles.videoStream}
                            style={{
                                display: isVideoEnabled ? 'inline' : 'none',
                            }}
                        />
                        {!isVideoEnabled && (
                            <div className={styles.disabledVideoLoader}>
                                <Spin
                                    indicator={
                                        <LoadingOutlined
                                            className={styles.loadingDisabledOutline}
                                            spin
                                        />
                                    }
                                />
                            </div>
                        )}
                    </Col>
                </Row>

                <Row className={styles.signWordRow}>
                    <Typography className={styles.signWordTypo}>
                        {isResultView ? (
                            <div>
                                Result:
                                <span className={styles.signResultText}>
                                    {translationResponse || 'N/A'}
                                </span>
                            </div>
                        ) : (
                            <div>
                                <span> Sign the word: </span>
                                {randomWord ? (
                                    <span className={styles.actualSignWord}>
                                        {formatWord(randomWord)}
                                    </span>
                                ) : (
                                    <span>
                                        <Spin
                                            className={styles.spinPadding}
                                            indicator={
                                                <LoadingOutlined
                                                    className={styles.loadingOutline}
                                                    spin
                                                />
                                            }
                                        />
                                    </span>
                                )}
                            </div>
                        )}
                    </Typography>
                </Row>

                {isResultView ? (
                    <Row className={styles.resultPageRow}>
                        <Button type="primary" className={styles.resultPageButton} onClick={retry}>
                            Retry
                        </Button>
                        <Button
                            type="primary"
                            className={styles.resultPageButton}
                            onClick={getNewWord}
                        >
                            New Word
                        </Button>
                    </Row>
                ) : (
                    <Row className={styles.startStopRecordingRow}>
                        <Button
                            onClick={() => {
                                !isRecording ? startRecording() : stopRecording()
                            }}
                            disabled={!isInitalized}
                            danger={isRecording}
                            type="primary"
                            className={styles.startStopButton}
                        >
                            {!isRecording ? 'Start Recording' : 'Stop Recording'}
                        </Button>
                    </Row>
                )}

                <Row className={styles.viewAnswerRow}>
                    <Button
                        onClick={() => setIsAnswerModalOpen(true)}
                        className={styles.viewAnswerButton}
                    >
                        View Answer
                    </Button>
                </Row>
            </div>
            {isAnswerModalOpen && (
                <AnswerModal
                    word={randomWord}
                    link={wordYoutubeUrl}
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

export default PracticeModule
