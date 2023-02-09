import HeaderComponent from '../components/HeaderComponent'
import styles from '../styles/Practice.module.css'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/router'
import auth0 from '../auth/auth0'
import { Row, Col, Button, ConfigProvider, Typography, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
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
    const [isVideoEnabled, setIsVideoEnabled] = useState(false)
    const [isRecording, SetIsRecording] = useState(false)
    const [isResultView, SetIsResultView] = useState(false)
    const [isInitalized, setIsInitalized] = useState(false)
    const [randomWord, setRandomWord] = useState(null)
    const [isRetry, setIsRetry] = useState(true)
    const [wordYoutubeUrl, setWordYoutubeUrl] = useState(null)
    const [translationResponse, setTranslationResponse] = useState(null)
    const [video, setVideo] = useState(null)

    const startWebcam = async () => {
        // Check to see if browser has camera support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('Browser Does not suppor current webcam library')
        }

        // get webcam stream
        const webcamStream = await navigator.mediaDevices
            .getUserMedia({
                audio: false,
                video: true,
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
                    //        SetIsResultView(true)
                    //    })

                    // change to result view only if response is received
                    SetIsResultView(true)
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

    const startRecording = () => {
        if (videoStream.current && !isRecording) {
            videoStream.current.start()
        }
        SetIsRecording(true)
    }

    const stopRecording = () => {
        if (videoStream.current && isRecording) {
            videoStream.current.stop()
        }
        SetIsRecording(false)
    }

    const formatWord = (word) => {
        return word?.charAt(0).toUpperCase() + word?.slice(1).toLowerCase()
    }

    useEffect(() => {
        if (isRetry) {
            fetcher(accessToken, '/api/practice/get_word', {
                method: 'GET',
            }).then((response) => {
                setRandomWord(response.data.word.toUpperCase())
                setWordYoutubeUrl(response.data.url)
                startWebcam()
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

    // To do : change result text color based on server response
    return (
        <ConfigProvider theme={theme}>
            <HeaderComponent user={user} handleLeave={handleLeave} />
            <div className={styles.main}>
                <Row className={styles.row1}>
                    <Col>
                        <video
                            ref={videoReference}
                            autoPlay
                            className={styles.row1Col1}
                            style={{
                                display: isVideoEnabled ? 'inline' : 'none',
                            }}
                        />
                        {!isVideoEnabled && (
                            <div
                                className={styles.row1Col1}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Spin
                                    indicator={
                                        <LoadingOutlined
                                            style={{
                                                fontSize: 40,
                                            }}
                                            spin
                                        />
                                    }
                                />
                            </div>
                        )}
                    </Col>
                </Row>
                {isResultView ? (
                    <Row className={styles.row2}>
                        <Typography className={styles.typo} style={{ fontSize: 20 }}>
                            <div>
                                Result:{' '}
                                <span
                                    style={{
                                        fontWeight: 'bold',
                                        fontStyle: !translationResponse ? 'italic' : 'none',
                                    }}
                                >
                                    {translationResponse || 'N/A'}
                                </span>
                            </div>
                        </Typography>
                    </Row>
                ) : (
                    <Row className={styles.row2}>
                        <Typography className={styles.typo}>
                            <div style={{ fontSize: 20 }}>
                                <span>Sign the word: </span>
                                {randomWord ? (
                                    <span
                                        style={{
                                            fontWeight: 'bold',
                                        }}
                                    >{`${formatWord(randomWord)}`}</span>
                                ) : (
                                    <span>
                                        <Spin
                                            style={{ paddingLeft: 10 }}
                                            indicator={
                                                <LoadingOutlined
                                                    style={{
                                                        fontSize: 20,
                                                    }}
                                                    spin
                                                />
                                            }
                                        />
                                    </span>
                                )}
                            </div>
                        </Typography>
                    </Row>
                )}
                {isResultView ? (
                    <Row style={{ display: 'flex', justifyContent: 'center' }}>
                        <Button type="primary" className={styles.row3WordBtn} onClick={retry}>
                            Retry
                        </Button>
                        <Button type="primary" className={styles.row3WordBtn} onClick={getNewWord}>
                            New Word
                        </Button>
                    </Row>
                ) : (
                    <Row className={styles.row3StartStop}>
                        <Button
                            onClick={() => {
                                !isRecording ? startRecording() : stopRecording()
                            }}
                            disabled={!isInitalized}
                            danger={isRecording ? true : false}
                            type="primary"
                            className={styles.StartButton}
                        >
                            {!isRecording ? 'Start Recording' : 'Stop Recording'}
                        </Button>
                    </Row>
                )}

                <Row className={styles.row4}>
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
