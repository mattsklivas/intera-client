import { React, useState, useEffect, useRef } from 'react'
import { ConfigProvider, Button, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { useRouter } from 'next/router'
import { useUser } from '@auth0/nextjs-auth0/client'
import auth0 from '../../auth/auth0'
import LoadingComponent from '../../components/LoadingComponent'
import HeaderComponent from '../../components/HeaderComponent'
// import VideoFeedComponent from '../../components/VideoFeedComponent'
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
    const userVideo = useRef(null)
    const remoteVideo = useRef(null)
    const [isLocalVideoEnabled, setIsLocalVideoEnabled] = useState(false)
    const [isRemoteVideoEnabled, setIsRemoteVideoEnabled] = useState(false)
    const [userRole, setUserRole] = useState(null)
    const [spaceBarPressed, setSpaceBarPressed] = useState(false)
    const [audioChunk, setAudioChunk] = useState(null)
    const audioRecording = useRef(null)
    const [audioStream, setAudioStream] = useState(null)
    const router = useRouter()
    const roomID = getQuery(router, 'room_id')
    const [initialized, setInitialized] = useState(false)
    const { user, error, isLoading } = useUser()
    const [roomUsers, setRoomUsers] = useState(new Set())
    let peerConnection

    const socket = socketio(process.env.API_URL || 'http://localhost:5000', {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            credentials: true,
        },
        transports: ['websocket'],
        upgrade: false,
        autoConnect: false,
    })

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

    // Room initialization
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
    }, [])

    useEffect(() => {
        if (
            !initialized &&
            typeof transcriptHistory !== 'undefined' &&
            typeof roomInfo !== 'undefined' &&
            user.nickname !== undefined &&
            roomInfo?.active == true
        ) {
            socket.connect()
            socket.emit('join', { user: user?.nickname, room_id: roomID })

            setUserRole(getType())

            // Render page
            setInitialized(true)
        }
    }, [transcriptHistory, roomInfo])

    // Websocket listeners
    useEffect(() => {
        socket.on('connect', (data) => {})

        socket.on('disconnect', (data) => {
            console.log('disconnect', data)
        })

        socket.on('join', (data) => {
            console.log('joined')
            // let users = roomUsers
            // users.add(data.user_sid)
            // setRoomUsers(users)
        })

        socket.on('message', (data) => {
            console.log('message', data || 'none')
        })

        socket.on('close_room', (data) => {
            socket.close()
        })

        // Refresh chatbox
        socket.on('mutate', (data) => {
            if (data?.room_id == roomID) {
                roomInfoMutate()
            }
        })

        // Following a succesful join, establish a peer connection
        // and send an offer to the other user
        socket.on('ready', () => {
            createPeerConnection()
            sendOffer()
        })

        socket.on('data_transfer', (data) => {
            signalingDataHandler(data)
        })
    }, [socket])

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

    // User input for push to talk
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

    const stopwebcam = () => {
        if (audioStream) {
            audioStream.getTracks().forEach((track) => track.stop())
        }
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

    const handleLeave = async () => {
        socket.emit('leave', { room_id: roomID, user: user?.nickname })

        // Close the room
        fetcher(accessToken, '/api/rooms/close_room', {
            method: 'PUT',
            body: JSON.stringify({
                room_id: roomID,
            }),
        })

        if (userVideo?.current?.srcObject) {
            userVideo.current.srcObject.getTracks().forEach((track) => track.stop())
        }

        router.push('/')
    }

    // Refresh chatbox for both users upon invalidation
    const invalidateRefresh = async () => {
        roomInfoMutate()
        socket.emit('mutate', { roomID: roomID })
    }

    const dataTransfer = (data) => {
        socket.emit('data_transfer', {
            user: user.nickname,
            room_id: roomID,
            body: data,
        })
    }

    // Setup user camera and establish ws connection
    useEffect(() => {
        const getDeviceMedia = async () => {
            const stream = await navigator.mediaDevices
                .getUserMedia({
                    video: {
                        height: 360,
                        width: 480,
                    },
                })
                .then(() => {
                    setIsLocalVideoEnabled(true)
                })

            if (userVideo.current) {
                userVideo.current.srcObject = stream

                socket.connect()
                socket.emit('join', { user: user?.nickname, room_id: roomID })
            }
        }
        getDeviceMedia()
        return function cleanup() {
            stopwebcam()
            peerConnection?.close()
        }
    }, [])

    // RTC Connection Reference: https://www.100ms.live/blog/webrtc-python-react
    // *************************************************************************
    const onIceCandidate = (event) => {
        if (event.candidate) {
            console.log('Sending ICE candidate')
            dataTransfer({
                type: 'candidate',
                candidate: event.candidate,
            })
        }
    }

    const onTrack = (event) => {
        console.log('Received track from other user.')
        setIsRemoteVideoEnabled(true)
        remoteVideo.current.srcObject = event.streams[0]
    }

    const createPeerConnection = () => {
        try {
            peerConnection = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: 'stun:openrelay.metered.ca:80',
                    },
                    {
                        urls: 'turn:openrelay.metered.ca:80',
                        username: 'openrelayproject',
                        credential: 'openrelayproject',
                    },
                    {
                        urls: 'turn:openrelay.metered.ca:443',
                        username: 'openrelayproject',
                        credential: 'openrelayproject',
                    },
                    {
                        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
                        username: 'openrelayproject',
                        credential: 'openrelayproject',
                    },
                ],
            })
            peerConnection.onicecandidate = onIceCandidate
            peerConnection.ontrack = onTrack
            const userStream = userVideo.current.srcObject
            for (const track of userStream.getTracks()) {
                peerConnection.addTrack(track, userStream)
            }
            console.log('Peer connection established')
        } catch (error) {
            console.error('Failed to establish connection: ', error)
        }
    }

    const setAndSendLocalDescription = (sessionDescription) => {
        console.log('Broadcasting local description.')
        peerConnection.setLocalDescription(sessionDescription)
        dataTransfer(sessionDescription)
    }

    const sendOffer = () => {
        console.log('Sending an offer to other peer')
        peerConnection.createOffer().then(setAndSendLocalDescription, (error) => {
            console.error('Unable to send offer: ', error)
        })
    }

    const sendAnswer = () => {
        peerConnection.createAnswer().then(setAndSendLocalDescription, (error) => {
            console.error('Unable to send answer: ', error)
        })
    }

    const signalingDataHandler = (data) => {
        if (data.type === 'offer') {
            createPeerConnection()
            peerConnection.setRemoteDescription(new RTCSessionDescription(data))
            sendAnswer()
        } else if (data.type === 'answer') {
            peerConnection.setRemoteDescription(new RTCSessionDescription(data))
        } else if (data.type === 'candidate') {
            peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
        } else {
            console.log('Unrecognized data received...')
        }
    }
    // *************************************************************************

    const getVideoPlaceholder = () => {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <div
                    style={{
                        width: '55%',
                        aspectRatio: 'auto 4 / 3',
                        border: '2px solid #f0f0f0',
                    }}
                >
                    <div style={{ position: 'relative', top: '40%' }}>
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
                </div>
            </div>
        )
    }

    const getRemoteUserName = () => {
        const remoteUser = roomInfo.users.find((username) => username !== user.nickname)
        return remoteUser ? (
            <span>
                <span>{remoteUser}</span>
                <span>{` (${userRole === 'ASL' ? 'Speaker' : 'ASL Signer'})`}</span>
            </span>
        ) : (
            <span className={styles.remoteUserLoading}>
                Awaiting user connection<span>.</span>
                <span>.</span>
                <span>.</span>
            </span>
        )
    }

    if (user && initialized && !isLoading) {
        return (
            <ConfigProvider theme={theme}>
                <HeaderComponent user={user} roomID={roomID} handleLeave={handleLeave} />
                <div className={styles.callWrapper}>
                    <div style={{ width: '20%' }}>
                        <Button type="primary" onClick={() => appendMessage('Example message')}>
                            ADD TEST MSG (temp)
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => {
                                socket.emit('message', { room_id: roomID, message: 'ping' })
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
                                roomInfo?.messages_info.length > 0 ? roomInfo?.messages_info : []
                            }
                            user={user}
                        />
                    </div>
                    <div style={{ width: '40%' }}>
                        <div style={{ width: '-webkit-fill-available' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <h2 style={{ marginBottom: 10 }}>{getRemoteUserName()}</h2>
                                    <div>
                                        {isRemoteVideoEnabled ? (
                                            <video
                                                autoPlay
                                                muted
                                                playsInline
                                                style={{ width: '55%', height: '55%' }}
                                                ref={remoteVideo}
                                            ></video>
                                        ) : (
                                            getVideoPlaceholder()
                                        )}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <h2 style={{ marginBottom: 10 }}>{`${user?.nickname} (${
                                        userRole === 'ASL' ? 'ASL Signer' : 'Speaker'
                                    })`}</h2>
                                    <div>
                                        {isLocalVideoEnabled ? (
                                            <video
                                                autoPlay
                                                muted
                                                playsInline
                                                ref={userVideo}
                                                style={{ width: '55%', height: '55%' }}
                                            ></video>
                                        ) : (
                                            getVideoPlaceholder()
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
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
