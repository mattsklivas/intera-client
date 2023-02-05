import { React, useState, useEffect, useRef } from 'react'
import { ConfigProvider, Button, Spin, message } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import '@babel/polyfill'
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
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

export default function CallPage({ accessToken }) {
    const userVideo = useRef(null)
    const remoteVideo = useRef(null)
    const [isLocalVideoEnabled, setIsLocalVideoEnabled] = useState(false)
    const [isRemoteVideoEnabled, setIsRemoteVideoEnabled] = useState(false)
    const [userRole, setUserRole] = useState(null)
    const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition()
    const [spaceBarPressed, setSpaceBarPressed] = useState(false)
    const router = useRouter()
    const roomID = getQuery(router, 'room_id')
    const [initialized, setInitialized] = useState(false)
    const { user, error, isLoading } = useUser()
    const [roomUsers, setRoomUsers] = useState(new Set())
    let peerConnection

    const [spaceCheck, setSpaceBoolCheck] = useState(false)
    const [latestTranscript, setLatestTranscript] = useState('')
    const [lastTranscript, setLastTranscript] = useState('')

    if (!browserSupportsSpeechRecognition) {
        console.log('Browser does not support speech to text')
    }

    const socketMsg = socketio(`${process.env.API_URL}` || 'http://localhost:5000', {
        cors: {
            origin: `${process.env.CLIENT_URL}` || 'http://localhost:3000',
            credentials: true,
        },
        transports: ['websocket'],
        upgrade: true,
        reconnection: true,
        // autoConnect: false,
    })

    const socketVid = socketio(`${process.env.API_URL}` || 'http://localhost:5000', {
        cors: {
            origin: `${process.env.CLIENT_URL}` || 'http://localhost:3000',
            credentials: true,
        },
        transports: ['websocket'],
        upgrade: true,
        reconnection: true,
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
            socketMsg.connect()
            // socketVid.connect()
            socketMsg.emit('join', { user: user?.nickname, room_id: roomID })
            // socketVid.emit('join', { user: user?.nickname, room_id: roomID })

            setUserRole(getType())

            roomInfoMutate()
            // socketMsg.emit('mutate', { roomID: roomID })

            // Render page
            setInitialized(true)
        }

        if (roomInfo?.active == false) {
            handleLeave()
        }
    }, [transcriptHistory, roomInfo])

    const handleMutate = () => {
        socketMsg.emit('mutate', { roomID: roomID })
    }

    const handleMessage = () => {
        socketMsg.emit('message', { message: 'ping', room_id: roomID })
    }

    const handleLeave = async () => {
        console.log('here')
        socketMsg.emit('leave', { room_id: roomID, user: user?.nickname })

        // Close the room
        if (roomInfo.users[0] == user?.nickname) {
            fetcher(accessToken, '/api/rooms/close_room', {
                method: 'PUT',
                body: JSON.stringify({
                    room_id: roomID,
                }),
            })
        }

        roomInfoMutate()
        if (userVideo?.current?.srcObject) {
            userVideo.current.srcObject.getTracks().forEach((track) => track.stop())
        }

        router.push('/')
    }

    // // Websocket listeners
    // useEffect(() => {
    //     socket.on('connect', (data) => {})

    //     socket.on('disconnect', (data) => {
    //         console.log('disconnect', data)
    //     })

    //     socket.on('join', (data) => {
    //         console.log('joined')
    //         // let users = roomUsers
    //         // users.add(data.user_sid)
    //         // setRoomUsers(users)
    //     })
    // }, [socket])

    // User input for push to talk
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.keyCode === 32 && !spaceBarPressed) {
                // console.log('space bar pressed')
                setSpaceBoolCheck(false)
                SpeechRecognition.startListening({ continuous: true })
                setSpaceBarPressed(true)
                message.info('Speech recording started...')
            }
        }
        const handleKeyRelease = (event) => {
            if (event.keyCode === 32 && spaceBarPressed) {
                // console.log('space bar released')
                SpeechRecognition.stopListening()
                setSpaceBarPressed(false)
                setTimeout(() => {
                    resetTranscript()
                    setSpaceBoolCheck(true)
                }, 500)

                message.info('Speech recording finished...')
            }
        }
        document.addEventListener('keydown', handleKeyPress)
        document.addEventListener('keyup', handleKeyRelease)
        return () => {
            document.removeEventListener('keydown', handleKeyPress)
            document.removeEventListener('keyup', handleKeyRelease)
        }
    }, [spaceBarPressed])

    useEffect(() => {
        setLatestTranscript(transcript)
    }, [spaceCheck, transcript])

    useEffect(() => {
        if (spaceCheck) {
            if (latestTranscript !== lastTranscript) {
                // console.log(latestTranscript)
                if (latestTranscript != '') {
                    appendMessage(latestTranscript)
                }
                setLastTranscript(latestTranscript)
            }
        }
    }, [spaceCheck, latestTranscript, lastTranscript])

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
                    handleMutate()
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
        socketMsg.emit('mutate', { roomID: roomID })
    }

    const dataTransfer = (data) => {
        socketVid.emit('data_transfer', {
            user: user.nickname,
            room_id: roomID,
            body: data,
        })
    }

    const intializeLocalVideo = () => {
        navigator.mediaDevices
            .getUserMedia({
                audio: false,
                video: {
                    height: 360,
                    width: 480,
                },
            })
            .then((stream) => {
                userVideo.current.srcObject = stream
                setIsLocalVideoEnabled(true)

                // Establish websocket connection after successful local video setup
                socketMsg.connect()
                socketMsg.emit('join', { user: user.nickname, room_id: roomID })
                socketVid.connect()
                socketVid.emit('join', { user: user.nickname, room_id: roomID })

                roomInfoMutate()
            })
            .catch((error) => {
                console.error('Stream not found:: ', error)
            })

        // socketMsg.connect()
        // socketVid.connect()
        // socketMsg.emit('join', { user: user.nickname, room_id: roomID })
        // socketVid.emit('join', { user: user.nickname, room_id: roomID })
        // handleMutate()
    }

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
            peerConnection = new RTCPeerConnection({})
            peerConnection.onicecandidate = onIceCandidate
            peerConnection.ontrack = onTrack
            const userStream = userVideo.current.srcObject
            for (const track of userStream?.getTracks()) {
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
        console.log('HANDLER', data.type)
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

    socketMsg.on('close_room', (data) => {
        console.log('close_room', data)
        roomInfoMutate()
        socketMsg.close()
        socketVid.close()
    })

    // Refresh chatbox
    socketMsg.on('mutate', (data) => {
        console.log('mutate', data)
        roomInfoMutate()
        // if (data?.room_id == roomID) {
        // }
    })

    // Following a succesful join, establish a peer connection
    // and send an offer to the other user
    socketVid.on('ready', () => {
        console.log('Ready to connect! Vid')
        createPeerConnection()
        sendOffer()
    })

    socketMsg.on('ready', () => {
        console.log('Ready to connect! Msg')
        // createPeerConnection()
        // sendOffer()
    })

    socketVid.on('data_transfer', (data) => {
        console.log('data transfer', data)
        signalingDataHandler(data)
    })

    socketMsg.on('message', (data) => {
        console.log('message', data || 'none')
    })

    socketMsg.on('disconnect', (data) => {
        roomInfoMutate()
        console.log('disconnect', data)
    })

    useEffect(() => {
        intializeLocalVideo()
        return function cleanup() {
            peerConnection?.close()
        }
    }, [])

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
                                socketMsg.emit('message', { room_id: roomID, message: 'ping' })
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
                                        <video
                                            autoPlay
                                            muted
                                            playsInline
                                            ref={remoteVideo}
                                            style={{
                                                display: isRemoteVideoEnabled ? 'inline' : 'none',
                                                width: '55%',
                                                height: isRemoteVideoEnabled ? '55%' : 0,
                                            }}
                                        ></video>
                                        {!isRemoteVideoEnabled && getVideoPlaceholder()}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <h2 style={{ marginBottom: 10 }}>{`${user?.nickname} (${
                                        userRole === 'ASL' ? 'ASL Signer' : 'Speaker'
                                    })`}</h2>
                                    <div>
                                        <video
                                            autoPlay
                                            muted
                                            playsInline
                                            ref={userVideo}
                                            style={{
                                                display: isLocalVideoEnabled ? 'inline' : 'none',
                                                width: '55%',
                                                height: isLocalVideoEnabled ? '55%' : 0,
                                            }}
                                        ></video>
                                        {!isLocalVideoEnabled && getVideoPlaceholder()}
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
