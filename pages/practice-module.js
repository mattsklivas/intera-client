/* eslint-disable indent */
import HeaderComponent from '../components/HeaderComponent'
import styles from '../styles/Practice.module.css'
import { useUser } from '@auth0/nextjs-auth0/client'
import LoadingComponent from '../components/LoadingComponent'
import { useRouter } from 'next/router'
import auth0 from '../auth/auth0'
import { Row, Col, Button, ConfigProvider, Typography, Spin, notification, message } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { useEffect, useRef, useState } from 'react'
import { theme } from '../core/theme'
import AnswerModal from '../components/modals/AnswerModal'
import { fetcher, fetcherNN } from '../core/fetchers'

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
    const [isRetry, setIsRetry] = useState(true)
    const [wordYoutubeUrl, setWordYoutubeUrl] = useState(null)
    const [api, contextHolder] = notification.useNotification()
    const [video, setVideo] = useState(null)
    const [isResultLoading, setIsResultLoading] = useState(false)
    const [isNewWordLoading, setIsNewWordLoading] = useState(false)

    const [recordingStartTime, setRecordingStartTime] = useState(null)
    const recordingStartTimeState = useRef(recordingStartTime)
    const setRecordingStartTimeState = (data) => {
        recordingStartTimeState.current = data
        setRecordingStartTime(data)
    }

    // UseRef workarounds for event listener compatibility
    const [translationResponse, setTranslationResponse] = useState(null)
    const translationResponseState = useRef(translationResponse)
    const setTranslationResponseState = (data) => {
        translationResponseState.current = data
        setTranslationResponse(data)
    }

    const [translationConfidence, setTranslationConfidence] = useState(null)
    const translationConfidenceState = useRef(translationConfidence)
    const setTranslationConfidenceState = (data) => {
        translationConfidenceState.current = data
        setTranslationConfidence(data)
    }

    const [randomWord, setRandomWord] = useState(null)
    const randomWordState = useRef(randomWord)
    const setRandomWordState = (data) => {
        randomWordState.current = data
        setRandomWord(data)
    }

    // timers
    const [nnTimes, setNnTimes] = useState([])

    const sendAnswer = async (blobsArray) => {
        // Get the recording length
        const endTime = new Date()
        const elapsedTime = (endTime - recordingStartTimeState.current) / 1000

        // Don't send answer if recording less than 2 seconds
        if (elapsedTime >= 2) {
            message.info({
                key: 'ASL',
                content: 'Processing ASL gesture recording...',
            })

            let startTime = performance.now()

            const recordedChunk = new Blob(blobsArray, { type: 'video/webm' })
            const form = new FormData()
            form.append('video', recordedChunk)
            form.append('word', randomWordState.current)

            // Send video
            fetcherNN(accessToken, '/submit_answer', {
                method: 'POST',
                body: form,
            })
                .then((res) => {
                    if (res.error) {
                        setTranslationResponseState('Error')
                        setTranslationConfidenceState(null)
                        message.error({
                            key: 'ASL',
                            duration: 5,
                            content: `${
                                res?.error || 'Error: An unknown error has occured.'
                            } ${'(Please follow guidelines in help section)'}`,
                        })
                    } else {
                        console.log(Number(res.data.confidence))
                        if (Number(res.data.confidence) < 0.6) {
                            setTranslationResponseState('Unclassified')
                            setTranslationConfidenceState(null)
                        } else {
                            setTranslationResponseState(res.data.result || 'Error')
                            setTranslationConfidenceState(
                                res.data.confidence
                                    ? parseFloat(Number(res.data.confidence) * 100).toFixed(2)
                                    : null
                            )
                        }
                    }
                })
                .then(() => {
                    setIsRetry(false)
                    setIsResultLoading(false)
                    setIsResultView(true)
                })
                .catch((e) => {
                    console.error('Error on retrieving results: ', e)
                    message.error({
                        key: 'ASL',
                        duration: 5,
                        content:
                            'Error in request handling: ' + e || 'An unknown error has occured.',
                    })
                    setTranslationResponseState('Error')
                    setTranslationConfidenceState(null)
                    setIsResultLoading(false)
                    setIsResultView(true)
                })
                .finally(() => {
                    // calculate average time
                    let endTime = performance.now()

                    let avgTime = 0
                    let nnList = nnTimes
                    nnList.push(endTime - startTime)
                    nnList.forEach((nnTime) => {
                        avgTime += nnTime
                    })

                    avgTime /= nnList.length
                    setNnTimes(nnList)
                    console.log('List Neural Network Times: ', nnList)
                    console.log('Average Neural Network Response: ', avgTime) // 3.85 second average with 20 signs

                    setTimeout(() => {
                        message.destroy('ASL')
                    }, 3000)
                })
        } else {
            message.info({
                key: 'ASL',
                content: 'ASL gesture recording must be longer than 2 seconds...',
            })
            setIsResultLoading(false)
        }
    }

    const startWebcam = async () => {
        // Check to see if browser has camera support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            api.error({
                message: 'Browser does not support current webcam library',
                maxCount: 0,
            })
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
                if (videoReference?.current?.srcObject !== undefined)
                    videoReference.current.srcObject = stream

                setVideo(stream)

                // create media recorder, and set the stream to it
                const mediaRecorderObject = new MediaRecorder(stream, { mimeType: 'video/webm' })
                // set the use ref to the media recorder
                videoStream.current = mediaRecorderObject

                let blobsArray = []
                // send data to array
                mediaRecorderObject.ondataavailable = (e) => {
                    blobsArray = [e.data]
                }

                // On stop create blob object, and covert to formdata to send to server
                mediaRecorderObject.onstop = (e) => {
                    console.log(blobsArray)
                    sendAnswer(blobsArray)
                }

                setIsRetry(false)
                setIsInitalized(true)
            })
    }

    // Used to set 10 second max on video recordings
    useEffect(() => {
        if (isRecording) {
            let timer = setTimeout(() => {
                setIsResultLoading(true)
                stopRecording()
                message.info({
                    key: 'ASL',
                    content: 'ASL gesture recording stopped automatically...',
                })
            }, 10000)
            return () => {
                clearTimeout(timer)
            }
        }
    }, [isRecording])

    const stopWebcam = async () => {
        await video?.getTracks().forEach((track) => track.stop())
        setVideo(null)
        setIsRecording(false)
    }

    const retry = () => {
        setIsResultView(false)
        setTranslationResponse(null)
    }

    const getNewWord = () => {
        setIsNewWordLoading(true)
        setIsRetry(true)
        setIsResultView(false)
        setTranslationResponse(null)
    }

    const startRecording = () => {
        if (videoStream.current && !isRecording) {
            console.log('start recording', videoStream.current)
            setRecordingStartTimeState(new Date())
            videoStream.current.start()
        }
        setIsRecording(true)
    }

    const stopRecording = () => {
        setIsResultLoading(true)
        if (videoStream.current && videoStream.current.state !== 'inactive' && isRecording) {
            console.log('stop recording', videoStream.current)
            videoStream.current.stop()
        }
        setIsRecording(false)
    }

    const formatWord = (word) => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    }

    useEffect(() => {
        if (!isLoading && user) {
            startWebcam()
        }
    }, [isLoading, user])

    useEffect(() => {
        if (!isLoading && accessToken && isRetry) {
            fetcher(accessToken, '/api/practice/get_word', {
                method: 'GET',
            }).then((response) => {
                setIsNewWordLoading(false)
                setRandomWordState(response.data.word)
                setWordYoutubeUrl(response.data.url)
            })
        }
    }, [isLoading, isResultView])

    const handleLeave = async () => {
        await stopWebcam()
            .then(() => {
                router.push('/')
            })
            .catch(() => {
                router.push('/')
            })
    }

    if (user && !isLoading) {
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
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                    }}
                                >
                                    <div style={{ paddingBottom: 5 }}>
                                        <span> Word Attempted: </span>
                                        <span className={styles.actualSignWord}>
                                            {formatWord(randomWord)}
                                        </span>
                                    </div>
                                    <div>
                                        Result:
                                        <span
                                            className={styles.signResultText}
                                            style={{
                                                color:
                                                    translationResponseState.current === 'Correct'
                                                        ? '#73d13d'
                                                        : translationResponseState.current ===
                                                          'Unclassified'
                                                        ? '#fadb14'
                                                        : '#ff4d4f',
                                            }}
                                        >
                                            {translationResponseState.current || 'N/A'}
                                        </span>
                                        {translationConfidenceState.current &&
                                            translationResponseState?.current === 'Correct' && (
                                                <span className={styles.signResultText}>
                                                    (Confidence:{' '}
                                                    {translationConfidenceState.current}%)
                                                </span>
                                            )}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <span> Sign the word: </span>
                                    {randomWord && !isNewWordLoading ? (
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
                            <Button
                                type="primary"
                                className={styles.resultPageButton}
                                onClick={retry}
                            >
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
                                loading={isResultLoading}
                                onClick={() => {
                                    !isRecording ? startRecording() : stopRecording()
                                }}
                                disabled={!isInitalized || randomWord === null}
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
                            disabled={randomWord === null}
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
    } else if (isLoading) {
        return <LoadingComponent msg="Loading..." />
    } else if (!user && !isLoading) {
        router.push(`/api/auth/login?returnTo=${encodeURIComponent('/practice-module')}`)
    }
}

export const getServerSideProps = async (context) => {
    let accessToken = (await auth0.getSession(context.req, context.res)) || null
    if (accessToken != null) {
        accessToken = accessToken.idToken
    }
    return { props: { accessToken } }
}

export default PracticeModule
