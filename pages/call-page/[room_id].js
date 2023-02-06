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
    const [hasJoined, setHasJoined] = useState(false)
    const [userRole, setUserRole] = useState(null)
    const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition()
    const [spaceBarPressed, setSpaceBarPressed] = useState(false)
    const router = useRouter()
    const roomID = getQuery(router, 'room_id')
    const [initialized, setInitialized] = useState(false)
    const { user, error, isLoading } = useUser()
    const [nickname, setNickname] = useState(null)
    const [remoteNickname, setRemoteNickname] = useState(null)
    let peerConnection

    const [spaceCheck, setSpaceBoolCheck] = useState(false)
    const [latestTranscript, setLatestTranscript] = useState('')
    const [lastTranscript, setLastTranscript] = useState('')

    const servers = {
        iceServers: [
            {
                urls: 'stun:relay.metered.ca:80',
            },
            {
                urls: 'turn:relay.metered.ca:80',
                username: `${process.env.TURN_USER}`,
                credential: `${process.env.TURN_PASSWORD}`,
            },
            {
                urls: 'turn:relay.metered.ca:443',
                username: `${process.env}`,
                credential: `${process.env.TURN_USER}`,
            },
            {
                urls: 'turn:relay.metered.ca:443?transport=tcp',
                username: `${process.env}`,
                credential: `${process.env.TURN_USER}`,
            },
        ],
    }

    if (!browserSupportsSpeechRecognition) {
        console.log('Browser does not support speech to text')
    }

    const socketMsg = socketio(`${process.env.API_URL}` || 'http://localhost:5000', {
        cors: {
            origin: `${process.env.CLIENT_URL}` || 'http://localhost:3000',
            credentials: true,
        },
        transports: ['websocket'],
        upgrade: false, // Was originally true
        reconnection: true,
    })

    const socketVid = socketio(`${process.env.API_URL}` || 'http://localhost:5000', {
        cors: {
            origin: `${process.env.CLIENT_URL}` || 'http://localhost:3000',
            credentials: true,
        },
        transports: ['websocket'],
        upgrade: false,
        autoConnect: false,
    })

    // SWR hooks
    const { data: transcriptHistory, error: transcriptHistoryError } = useTranscriptHistory(
        user ? user?.nickname : '',
        accessToken
    )
    const {
        data: roomInfo,
        error: roomInfoError,
        mutate: roomInfoMutate,
    } = useRoomInfo(roomID || '', accessToken)

    // Room initialization
    // TODO: update how we run this, maybe put in main initialization
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

    const handleMutate = () => {
        socketMsg.emit('mutate', { roomID: roomID })
        roomInfoMutate()
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
            }).then((res) => {
                if (res.status == 200) {
                    console.log('Room closed')
                    socketMsg.close()
                    socketVid.close()
                }
            })
        }

        handleMutate()
        if (userVideo?.current?.srcObject) {
            userVideo.current.srcObject.getTracks().forEach((track) => track.stop())
        }

        router.push('/')
    }

    useEffect(() => {
        if (
            !initialized &&
            typeof transcriptHistory !== 'undefined' &&
            typeof roomInfo !== 'undefined' &&
            user.nickname !== undefined &&
            roomInfo?.active == true
        ) {
            setNickname(user.nickname)
            getRemoteUserNickname()
            socketMsg.connect()
            socketMsg.emit('join', { user: user.nickname, room_id: roomID })

            setUserRole(getType())

            handleMutate()

            // Render page
            setInitialized(true)
        }

        // TODO: I think this is causing the premature close of the transport (leave signal -> disconnect signal)
        // if (roomInfo?.active == false) {
        //     handleLeave()
        // }
    }, [user, transcriptHistory, roomInfo])

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
                    // roomInfoMutate()

                    // Update chatbox
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
        if (roomInfo.users[0] === user?.nickname) {
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
        handleMutate()
    }

    const dataTransfer = (data) => {
        console.log('$$ sending data transfer $$')
        socketVid.emit('data_transfer', {
            user: nickname,
            room_id: roomID,
            body: data,
        })
    }

    const initializeLocalVideo = () => {
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
                socketVid.connect()
                socketVid.emit('join', { user: nickname, room_id: roomID })
            })
            .then((stream) => {
                if (roomInfo.users.length == 1 && roomInfo.users[0] !== nickname) {
                    fetcher(props.accessToken, '/api/rooms/join_room', {
                        method: 'PUT',
                        body: JSON.stringify({ room_id: roomID, user_id: nickname }),
                    })
                        .then((res) => {
                            if (res.status == 200) {
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
                } else {
                    handleMutate()
                }
            })
            .catch((error) => {
                console.error('Stream not found:: ', error)
            })
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
        console.log('{{{{{{{{{{{Received track from other user.}}}}}}}}}}}}')
        console.log('***src object being received', event)
        setIsRemoteVideoEnabled(true)
        remoteVideo.current.srcObject = event.streams[0]
    }

    const initializePeerConnection = () => {
        try {
            peerConnection = new RTCPeerConnection(servers)
            peerConnection.onicecandidate = onIceCandidate
            peerConnection.ontrack = onTrack
            console.log('***src object being sent out', userVideo.current.srcObject)
            const userStream = userVideo.current.srcObject
            for (const track of userStream?.getTracks()) {
                peerConnection.addTrack(track, userStream)
            }
            console.log('{{{Peer connection established}}}')
        } catch (error) {
            console.error('Failed to establish connection: ', error)
        }
    }

    const setAndSendLocalDescription = (sessionDescription) => {
        peerConnection.setLocalDescription(sessionDescription)
        dataTransfer(sessionDescription)
    }

    const sendOffer = () => {
        peerConnection.createOffer().then(setAndSendLocalDescription, (error) => {
            console.error('Unable to send offer: ', error)
        })
    }

    const sendAnswer = () => {
        peerConnection.createAnswer().then(setAndSendLocalDescription, (error) => {
            console.error('Unable to send answer: ', error)
        })
    }

    const handleDataTransfer = (data) => {
        console.log('(HANDLER)', data.type)
        if (data.type === 'offer') {
            console.log('[Offer received]')
            initializePeerConnection()
            peerConnection.setRemoteDescription(new RTCSessionDescription(data))
            sendAnswer()
        } else if (data.type === 'answer') {
            console.log('[Answer received]')
            peerConnection.setRemoteDescription(new RTCSessionDescription(data))
        } else if (data.type === 'candidate') {
            console.log('[Candidate received]')
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

    // const getRemoteUserName = () => {
    //     console.log('|||| GET OTHER USERNAME ||||', roomInfo.users)
    //     const remoteUser = roomInfo.users.find((username) => username !== user?.nickname)
    //     return remoteNickname ? (
    //         <span>
    //             <span>{remoteNickname}</span>
    //             <span>{` (${userRole === 'ASL' ? 'Speaker' : 'ASL Signer'})`}</span>
    //         </span>
    //     ) : (
    //         <span className={styles.remoteUserLoading}>
    //             Awaiting user connection<span>.</span>
    //             <span>.</span>
    //             <span>.</span>
    //         </span>
    //     )
    // }

    // Refresh chatbox
    socketMsg.on('mutate', (data) => {
        getRemoteUserNickname()
        roomInfoMutate()
    })

    // Following a succesful join, establish a peer connection
    // and send an offer to the other user
    socketVid.on('ready', () => {
        console.log('Ready to connect!')
        // if (!hasJoined) {
        //     roomInfoMutate() // This is new
        //     setHasJoined(true)
        //     initializePeerConnection()
        //     sendOffer()
        // }
        getRemoteUserNickname()
        roomInfoMutate()
        initializePeerConnection()
        sendOffer()
    })

    socketVid.on('data_transfer', (data) => {
        console.log('Received from ' + data.user)
        getRemoteUserNickname()
        if (data.user !== nickname) {
            handleDataTransfer(data.body)
        }
    })

    socketMsg.on('message', (data) => {
        console.log('message', data || 'none')
    })

    socketMsg.on('disconnect', (data) => {
        roomInfoMutate()
        console.log('disconnect', data)
    })

    useEffect(() => {
        if (initialized) {
            getRemoteUserNickname()
            initializeLocalVideo()
            return function cleanup() {
                peerConnection?.close()
            }
        }
    }, [initialized])

    // // Get the remote nickname
    // useEffect(() => {
    //     if (!remoteNickname && typeof roomInfo !== 'undefined' && roomInfo.users.length == 2) {
    //         console.log('GET OTHER NAME', nickname)
    //         setRemoteNickname(roomInfo.users.find((username) => username !== nickname))
    //     }
    // }, [roomInfo])

    const getRemoteUserNickname = () => {
        console.log('getRemoteUserName', roomInfo, user.nickname)
        if (
            !remoteNickname &&
            typeof user.nickname !== 'undefined' &&
            typeof roomInfo !== 'undefined' &&
            roomInfo.users.length == 2
        ) {
            console.log('ENTERED')
            setRemoteNickname(roomInfo.users.find((username) => username !== user.nickname))
        }
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
                                    <h2 style={{ marginBottom: 10 }}>
                                        {remoteNickname ? (
                                            <span>
                                                <span>{remoteNickname}</span>
                                                <span>{` (${
                                                    userRole === 'ASL' ? 'Speaker' : 'ASL Signer'
                                                })`}</span>
                                            </span>
                                        ) : (
                                            <span className={styles.remoteUserLoading}>
                                                Awaiting user connection<span>.</span>
                                                <span>.</span>
                                                <span>.</span>
                                            </span>
                                        )}
                                    </h2>
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
