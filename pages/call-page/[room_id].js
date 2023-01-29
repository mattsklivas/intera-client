import { React, useState, useEffect, useRef } from 'react'
import { ConfigProvider, Button } from 'antd'
import { useRouter } from 'next/router'
import { useUser } from '@auth0/nextjs-auth0/client'
import auth0 from '../../auth/auth0'
import LoadingComponent from '../../components/LoadingComponent'
import HeaderComponent from '../../components/HeaderComponent'
import VideoFeedComponent from '../../components/VideoFeedComponent'
import { theme } from '../../core/theme'
import { getQuery } from '../../core/utils'
import HistoryComponent from '../../components/HistoryComponent'
import ChatboxComponent from '../../components/ChatboxComponent'
import useTranscriptHistory from '../../hooks/useTranscriptHistory'
import useRoomInfo from '../../hooks/useRoomInfo'
import styles from '../../styles/CallPage.module.css'
import fetcher from '../../core/fetcher'
import socketio from 'socket.io-client'

export default function CallPage({ accessToken }) {
    const [spaceBarPressed, setSpaceBarPressed] = useState(false)
    const [audioChunk, setAudioChunk] = useState(null)
    const audioRecording = useRef(null)
    const [audioStream, setAudioStream] = useState(null)
    const router = useRouter()
    const roomID = getQuery(router, 'room_id')
    const [initialized, setInitialized] = useState(false)
    const { user, error, isLoading } = useUser()

    // SWR hooks
    const { data: transcriptHistory, error: transcriptHistoryError } = useTranscriptHistory(
        user ? user.nickname : '',
        accessToken
    )
    const {
        data: roomInfo,
        error: roomInfoError,
        mutate: roomInfoMutate,
    } = useRoomInfo(roomID || '', accessToken)

    // Websocket connection
    const socket = socketio(process.env.API_URL || 'http://localhost:5000', {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            credentials: true,
        },
        transports: ['websocket'],
    })

    // Manage the user webcam to capture the audio
    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ audio: true, video: false })
            .then((stream) => {
                setAudioStream(stream)
                audioRecording.current = new MediaRecorder(stream)
                audioRecording.current.ondataavailable = (e) => {
                    setAudioChunk(e.data)
                }
            })
            .catch((error) => {
                console.error(error)
            })

        return () => {
            stopwebcam()
        }
    }, [])

    const stopwebcam = () => {
        if (audioStream) {
            audioStream.getTracks().forEach((track) => track.stop())
        }
    }

    useEffect(() => {
        // If JWT is expired, force a logout
        if (transcriptHistoryError?.status == 401) {
            router.push('/api/auth/logout')
        } else if (roomInfoError?.status == 404) {
            // If room ID is invalid, redirect to home page
            router.push(`/?invalid_room=${roomID}`)
        } else if (typeof roomInfo !== 'undefined' && roomInfo?.active == false) {
            // If room ID is expired, redirect to home page
            router.push(`/?expired_room=${roomID}`)
        } else if (
            typeof roomInfo !== 'undefined' &&
            roomInfo?.users.length == 2 &&
            user?.nickname &&
            !roomInfo?.users.find((name) => name === user?.nickname)
        ) {
            // If room if full, redirect to home page
            router.push(`/?full_room=${roomID}`)
        }

        if (
            !initialized &&
            typeof transcriptHistory !== 'undefined' &&
            typeof roomInfo !== 'undefined' &&
            roomInfo?.active == true
        ) {
            // Establish websocket connection
            socket.connect()

            // Render page
            setInitialized(true)
        }
    })

    // this useeffect takes care of user input for push to talk
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.keyCode === 32 && !spaceBarPressed) {
                startRecording()
                setSpaceBarPressed(true)
            }
        }
        const handleKeyRelease = (event) => {
            if (event.keyCode === 32 && spaceBarPressed) {
                stopRecording()
                setSpaceBarPressed(false)
            }
        }
        document.addEventListener('keydown', handleKeyPress)
        document.addEventListener('keyup', handleKeyRelease)
        return () => {
            document.removeEventListener('keydown', handleKeyPress)
            document.removeEventListener('keyup', handleKeyRelease)
        }
    }, [spaceBarPressed])

    // start the media recorder
    const startRecording = async () => {
        audioRecording.current.start()
    }

    // stop the media recorder
    // and take the audio file (based on user input) and retieve the response from the server
    // for transcription
    const stopRecording = async () => {
        audioRecording.current.stop()
        if (audioChunk) {
            const formData = new FormData()
            formData.append('audio', audioChunk)
            console.log(audioChunk)
            const res = await fetch('http://localhost:8000/api/upload', {
                method: 'POST',
                body: formData,
            })
            // TODO: add constraints based on server response
            // TODO: connect to ChatboxComponent
        }
    }

    // Add a STT message
    const appendMessage = async (message) => {
        fetcher(accessToken, '/api/transcripts/create_message', {
            method: 'POST',
            body: JSON.stringify({
                room_id: roomInfo.room_id,
                to_user: roomInfo.users.find((username) => username !== user.nickname) || 'N/A',
                message: message,
                type: getType(),
            }),
        })
            .then((res) => {
                if (res.status == 200) {
                    // Update chatbox
                    roomInfoMutate()

                    // Emit mutate message over websocket to other user
                    socket.emit('mutate', { roomID: roomID })
                } else {
                    api.error({
                        message: `Error ${res.status}: ${res.error}`,
                    })
                }
            })
            .catch((res) => {
                api.error({
                    message: 'An unknown error has occurred',
                })
            })
    }

    // Get the communication type of the user
    const getType = () => {
        if (roomInfo.users[0] === user.nickname) {
            return roomInfo.host_type
        } else {
            if (roomInfo.host_type === 'STT') {
                return 'ASL'
            } else {
                return 'STT'
            }
        }
    }

    // Refresh chatbox for both users upon invalidation
    const invalidateRefresh = async () => {
        roomInfoMutate()
        socket.emit('mutate', { roomID: roomID })
    }

    // *** Websocket stuff ***

    socket.on('connect', (data) => {
        console.log('connected', data)
    })

    socket.on('disconnect', (data) => {
        console.log('disconnected', data)
    })

    socket.on('message', (data) => {
        console.log('message', data || 'none')
    })

    // Refresh chatbox
    socket.on('mutate', (data) => {
        if (data?.roomID == roomID) {
            roomInfoMutate()
        }
    })

    // ************************

    if (user && initialized && !isLoading) {
        return (
            <ConfigProvider theme={theme}>
                <HeaderComponent user={user} />
                <div className={styles.callWrapper}>
                    <div style={{ width: '20%' }}>
                        <Button type="primary" onClick={() => appendMessage('Example message')}>
                            ADD TEST MSG (temp)
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => {
                                socket.emit('message', { a: 'b', c: [] })
                            }}
                        >
                            SOCKETIO PING
                        </Button>
                        <HistoryComponent transcripts={transcriptHistory} user={user} />
                    </div>
                    <div style={{ width: '40%' }}>
                        <ChatboxComponent
                            accessToken={accessToken}
                            context={'call'}
                            roomInfo={roomInfo}
                            roomID={roomID}
                            invalidateRefresh={invalidateRefresh}
                            transcript={
                                roomInfo.messages_info.length > 0 ? roomInfo.messages_info : []
                            }
                            user={user}
                        />
                    </div>
                    <div style={{ width: '40%' }}>
                        <VideoFeedComponent />
                    </div>
                </div>
            </ConfigProvider>
        )
    } else if (isLoading) {
        return <LoadingComponent msg="Loading..." />
    } else if (!user && !isLoading) {
        router.push('/api/auth/login')
    }
}

export const getServerSideProps = async (context) => {
    let accessToken = (await auth0.getSession(context.req, context.res)) || null
    if (accessToken != null) {
        accessToken = accessToken.idToken
    }
    return { props: { accessToken } }
}
