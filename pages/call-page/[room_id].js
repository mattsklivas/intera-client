import { React, useState, useEffect, useRef } from 'react'
import { ConfigProvider, Spin, message, notification, Space } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import '@babel/polyfill'
import { useRouter } from 'next/router'
import { useUser } from '@auth0/nextjs-auth0/client'
import auth0 from '../../auth/auth0'
import LoadingComponent from '../../components/LoadingComponent'
import HeaderComponent from '../../components/HeaderComponent'
import { browserName } from 'react-device-detect'
import { theme } from '../../core/theme'
import { getQuery } from '../../core/utils'
import HistoryComponent from '../../components/HistoryComponent'
import ChatboxComponent from '../../components/ChatboxComponent'
import useTranscriptHistory from '../../hooks/useTranscriptHistory'
import useRoomInfo from '../../hooks/useRoomInfo'
import styles from '../../styles/CallPage.module.css'
import { fetcher, fetcherNN } from '../../core/fetchers'
import socketio from 'socket.io-client'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

/*
How call page should work:

Host creates the room and is added
Host is prompted to enable their video camera (if they are Speaker, they are also prompted for audio)
When video camera is enabled, video feed will be displayed
User can now send messages and do actions (i.e STT or ASL) for their role while they wait for the other user

When guest user joins (they should already be added to the room on the backend, this action should be done on "join room")
Guest is prompted to enable their video camera (if they are Speaker, they are also prompted for audio)
When video camera is enabled, video feed will be displayed
A socket ping will be sent out to the other user in the room to notify them that the other user has joined,
a mutate will occur to update the room info. When this happens the peerConnection process should begin

We should now begin to initializePeerConnection
The remote and local video feeds should be set on both guest and host
When this occurs, both feeds should appear

Socket pings for ready state, data_transfer, offer, answer, candidate should occur
When the remote video stream can be found onTrack, the remote video feed should be set and appear
*/

export default function CallPage({ accessToken }) {
    const userVideo = useRef({})
    const videoStream = useRef(null)
    const remoteVideo = useRef(null)
    const [isLocalVideoEnabled, setIsLocalVideoEnabled] = useState(false)
    const [isRemoteVideoEnabled, setIsRemoteVideoEnabled] = useState(false)
    const [userRole, setUserRole] = useState(null)
    const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition()
    const [spaceBarPressed, setSpaceBarPressed] = useState(false)
    const router = useRouter()
    const roomID = getQuery(router, 'room_id')
    const [isRoomIdFound, setIsRoomIdFound] = useState(false)
    const [remoteNickname, setRemoteNickname] = useState(null)
    const [api, contextHolder] = notification.useNotification()
    const [isRecording, setIsRecording] = useState(false)
    let peerConnection
    const [spaceCheck, setSpaceBoolCheck] = useState(false)
    const [latestTranscript, setLatestTranscript] = useState('')
    const [lastTranscript, setLastTranscript] = useState('')
    const { user, error, isLoading } = useUser()
    const [loadPage, setLoadPage] = useState(false)

    // stt timer
    const [sttStart, setSTTStart] = useState(null)

    const { data: transcriptHistory, error: transcriptHistoryError } = useTranscriptHistory(
        user ? user?.nickname : '',
        accessToken
    )
    const {
        data: roomInfo,
        error: roomInfoError,
        mutate: roomInfoMutate,
    } = useRoomInfo(roomID || '', accessToken)

    const userRef = useRef(user)
    const roomInfoRef = useRef(roomInfo)

    const [recordingStartTime, setRecordingStartTime] = useState(null)
    const recordingStartTimeState = useRef(recordingStartTime)

    const setRecordingStartTimeState = (data) => {
        recordingStartTimeState.current = data
        setRecordingStartTime(data)
    }

    // Notify user when processing video
    const [isSendingASL, setIsSendingASL] = useState(false)
    const isSendingASLRef = useRef(isSendingASL)
    const setIsSendingASLState = (data) => {
        isSendingASLRef.current = data
        setIsSendingASL(data)
    }

    if (typeof window != 'undefined' && accessToken) {
        window.addEventListener('beforeunload', function (e) {
            if (roomInfo && user && roomInfo?.users[0] === user?.nickname) {
                fetcher(accessToken, '/api/rooms/close_room', {
                    method: 'PUT',
                    body: JSON.stringify({
                        room_id: roomID,
                    }),
                }).then((res) => {
                    if (res.status == 200) {
                        console.log('Room closed')
                    }
                })
            }

            return
        })
    }

    useEffect(() => {
        if (
            user &&
            roomInfo &&
            roomInfo?.users.find((username) => username === user?.nickname) &&
            !loadPage
        ) {
            setLoadPage(true)
        }
    }, [user, roomInfo])

    useEffect(() => {
        setIsRoomIdFound(true)
    }, [roomID])

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
                username: `${process.env.TURN_USER}`,
                credential: `${process.env.TURN_USER}`,
            },
            {
                urls: 'turn:relay.metered.ca:443?transport=tcp',
                username: `${process.env.TURN_USER}`,
                credential: `${process.env.TURN_USER}`,
            },
        ],
    }

    if (!browserSupportsSpeechRecognition) {
        api.error({
            message: 'Browser does not support speech to text, please use Chrome',
            maxCount: 0,
        })
    }

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
                        // For 480p
                        // aspectRatio: 'auto 4 / 3',
                        // For 720p
                        aspectRatio: 'auto 16 / 9',
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

    /* ----------------------Socket---------------------- */

    const socket = socketio(`${process.env.API_URL}` || 'http://localhost:5000', {
        cors: {
            origin: `${process.env.CLIENT_URL}` || 'http://localhost:3000',
            credentials: true,
        },
        transports: ['websocket'],
        autoConnect: false,
    })

    const socket_message = socketio(`${process.env.API_URL}` || 'http://localhost:5000', {
        cors: {
            origin: `${process.env.CLIENT_URL}` || 'http://localhost:3000',
            credentials: true,
        },
        transports: ['websocket'],
        autoConnect: false,
    })

    // leave conditions:
    // host leaves -> room closes, forces other user out
    // guest leaves -> room stays open, other user is notified, video stream closes, peerConnection resets
    const handleLeave = async (practice = false) => {
        socket.emit('leave', { room_id: roomID, user: user?.nickname })
        // close video stream
        if (userVideo?.current?.srcObject) {
            const userStream = userVideo.current.srcObject

            // Reset peerConnection
            if (peerConnection) {
                peerConnection.removeTrack(userStream)
                peerConnection.close()
                peerConnection = null
            }
            userVideo.current.srcObject.getTracks().forEach((track) => track.stop())
            userVideo.current = null // Added to ensure unmounting of webcam
        }

        // Close the room
        if (roomInfo?.users[0] === user?.nickname) {
            fetcher(accessToken, '/api/rooms/close_room', {
                method: 'PUT',
                body: JSON.stringify({
                    room_id: roomID,
                }),
            }).then((res) => {
                if (res.status == 200) {
                    console.log('Room closed')
                }
            })
        }

        // signal other user to reset name, notify user has left, and close video stream/peerConnection
        socket.close()
        socket_message.close()
        router.push('/')
    }

    /* ----------------------STT/ASL-to-Text---------------------- */

    // User input for push to talk/ASL-to-Text
    useEffect(() => {
        // Ensure the roomInfo and user refs are updated before proceeding
        userRef.current = user
        roomInfoRef.current = roomInfo
        isSendingASLRef.current = isSendingASL

        if (userRole === 'STT') {
            const handleKeyPress = (event) => {
                if (
                    event.keyCode === 32 &&
                    !spaceBarPressed &&
                    document.activeElement?.id !== 'invalidate'
                ) {
                    setSpaceBoolCheck(false)
                    SpeechRecognition.startListening({ continuous: true })
                    setSpaceBarPressed(true)
                    message.info({
                        key: 'STT',
                        content: 'Speech recording started...',
                    })
                }
            }
            const handleKeyRelease = (event) => {
                if (
                    event.keyCode === 32 &&
                    spaceBarPressed &&
                    document.activeElement?.id !== 'invalidate'
                ) {
                    SpeechRecognition.stopListening()
                    setSpaceBarPressed(false)
                    setTimeout(() => {
                        resetTranscript()
                        setSpaceBoolCheck(true)
                    }, 500)

                    setSTTStart(performance.now())
                    message.success({
                        key: 'STT',
                        content: 'Speech recording stopped...',
                    })
                }
            }
            document.addEventListener('keydown', handleKeyPress)
            document.addEventListener('keyup', handleKeyRelease)
            return () => {
                document.removeEventListener('keydown', handleKeyPress)
                document.removeEventListener('keyup', handleKeyRelease)
            }
        } else if (userRole === 'ASL') {
            const handleKeyPress = (event) => {
                if (event.keyCode === 32 && document.activeElement?.id !== 'invalidate') {
                    // Start recording
                    if (!spaceBarPressed) {
                        startRecording()
                    } else {
                        stopRecording('manual')
                    }
                }
            }
            document.addEventListener('keypress', handleKeyPress)
            return () => {
                document.removeEventListener('keypress', handleKeyPress)
            }
        }
    }, [spaceBarPressed, userRole])

    // Automatically stop recording video after 10 seconds
    useEffect(() => {
        if (userRole === 'ASL' && spaceBarPressed) {
            let timer = setTimeout(() => {
                stopRecording('auto')
            }, 10000)
            return () => {
                clearTimeout(timer)
            }
        }
    }, [spaceBarPressed])

    useEffect(() => {
        setLatestTranscript(transcript)
    }, [spaceCheck, transcript])

    useEffect(() => {
        if (spaceCheck) {
            if (latestTranscript !== lastTranscript) {
                if (latestTranscript != '') {
                    appendSTTMessage(latestTranscript)
                }
                setLastTranscript(latestTranscript)
            }
        }
    }, [spaceCheck, latestTranscript, lastTranscript])

    // timers
    const [sttTimes, setSTTTimes] = useState([])

    // Add a STT message
    const appendSTTMessage = async (message) => {
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
            .finally(() => {
                let endTime = performance.now()

                let avgTime = 0
                let sttList = sttTimes
                sttList.push(endTime - sttStart)

                sttList.forEach((time) => {
                    avgTime += time
                })

                avgTime /= sttList.length
                setSTTTimes(sttList)
                console.log('List STT Times: ', sttList)
                console.log('Average STT Response: ', avgTime) // 3.85 second average with 20 signs
            })
    }

    // timers
    const [nnTimes, setNnTimes] = useState([])

    // Add an ASL-to-Text message
    const appendASLMessage = async (blobsArray) => {
        // Get the recording length
        const endTime = new Date()
        const elapsedTime = (endTime - recordingStartTimeState.current) / 1000

        let startTime = performance.now()
        // Don't send answer if recording less than 2 seconds
        if (elapsedTime >= 2) {
            setIsSendingASLState(true)
            const recordedChunk = new Blob(blobsArray, { type: 'video/webm' })
            const form = new FormData()
            form.append('video', recordedChunk)
            form.append('room_id', roomInfoRef.current.room_id)
            form.append('from_user', userRef.current.nickname)
            form.append(
                'to_user',
                roomInfoRef.current.users.find(
                    (username) => username !== userRef.current.nickname
                ) || 'N/A'
            )

            // Send video
            fetcherNN(accessToken, '/process_sign', {
                method: 'POST',
                body: form,
            })
                .then((res) => {
                    if (res.status == 200) {
                        // Emit mutate message over websocket to other user
                        handleMutate()

                        if (res.data.prediction.startsWith('[INFO:')) {
                            message.info({
                                key: 'lowConf',
                                content: `INFO: Low confidence in ASL prediction (${parseFloat(
                                    Number(res.data.confidence) * 100
                                ).toFixed(2)}%)`,
                            })
                        } else if (res.data.prediction.startsWith('[ERROR:')) {
                            message.error({
                                key: 'predictFail',
                                content: 'ERROR: Unable to predict ASL gesture(s)',
                            })
                        }
                    } else {
                        api.error({
                            message: `Error ${res.status}: ${res.error}`,
                        })
                    }
                    setIsSendingASLState(false)
                })
                .catch((e) => {
                    console.error('Error on retrieving results: ', e)
                    setIsSendingASLState(false)
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
                })
        } else {
            message.info({
                key: 'ASL',
                content: 'ASL gesture recording must be longer than 2 seconds...',
            })
            setIsSendingASLState(false)
        }
    }

    const startRecording = () => {
        if (videoStream.current && !isRecording) {
            recordingStartTimeState.current = new Date()
            setSpaceBarPressed(true)
            setIsRecording(true)
            message.info({
                key: 'ASL',
                content: 'ASL gesture recording started...',
            })
            videoStream.current.start()
        }
    }

    // Control stopping of the video recording
    const stopRecording = async (source) => {
        if (videoStream.current && videoStream.current.state !== 'inactive' && isRecording) {
            setSpaceBarPressed(false)
            setIsRecording(false)
            videoStream.current.stop()
            message.success({
                key: 'ASL',
                content:
                    source === 'auto'
                        ? 'ASL gesture recording stopped automatically...'
                        : 'ASL gesture recording stopped...',
            })
        }

        setTimeout(() => {
            message.destroy('ASL')
        }, 3000)
    }

    // Refresh chatbox for both users upon invalidation
    const invalidateRefresh = async () => {
        handleMutate()
    }

    /* ----------------------Video---------------------- */

    const initializeLocalVideo = async () => {
        navigator.mediaDevices
            .getUserMedia({
                audio: true,
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            })
            .then((stream) => {
                if (userVideo?.current?.srcObject !== undefined)
                    userVideo.current.srcObject = stream
                setIsLocalVideoEnabled(true)

                const mediaRecorderObject = new MediaRecorder(stream, {
                    mimeType: 'video/webm',
                })

                // set the use ref to the media recorder
                videoStream.current = mediaRecorderObject

                let blobsArray = []
                // send data to array
                mediaRecorderObject.ondataavailable = (e) => {
                    blobsArray = [e.data]
                }

                // On stop create blob object, and covert to formdata to send to server
                mediaRecorderObject.onstop = (e) => {
                    appendASLMessage(blobsArray)
                }

                socket.connect()
                socket_message.connect()
            })
            .catch((error) => {
                console.error('Stream not found: ', error)
                router.push('/?missing_device=true')
            })
    }

    // Get the communication type of the user
    const getType = () => {
        if (userRole === null) {
            if (roomInfo?.users[0] === user?.nickname) {
                return roomInfo?.host_type
            } else {
                if (roomInfo?.host_type === 'ASL') {
                    return 'STT'
                } else {
                    return 'ASL'
                }
            }
        }

        return userRole
    }

    /* ----------------------RTC---------------------- */

    // RTC Connection Reference: https://www.100ms.live/blog/webrtc-python-react
    // *************************************************************************
    const onIceCandidate = (event) => {
        if (event.candidate) {
            dataTransfer({
                type: 'candidate',
                candidate: event.candidate,
            })
        }
    }

    const onTrack = (event) => {
        setIsRemoteVideoEnabled(true)
        remoteVideo.current.srcObject = event.streams[0]
    }

    const onClose = () => {
        console.log('Connection closed')
    }

    const initializePeerConnection = () => {
        try {
            peerConnection = new RTCPeerConnection(servers)
            peerConnection.onicecandidate = onIceCandidate
            peerConnection.ontrack = onTrack
            peerConnection.onclose = onClose
            const userStream = userVideo.current.srcObject
            for (const track of userStream?.getTracks()) {
                peerConnection.addTrack(track, userStream)
            }
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
        if (data.type === 'offer') {
            try {
                initializePeerConnection()

                peerConnection?.setRemoteDescription(new RTCSessionDescription(data))
                sendAnswer()
            } catch (error) {
                console.error('Unable to handle offer: ', error)
            }
        } else if (data.type === 'answer') {
            try {
                if (peerConnection && peerConnection?.signalingState !== 'stable') {
                    peerConnection?.setRemoteDescription(new RTCSessionDescription(data))
                }
            } catch (error) {
                console.error('Unable to handle answer: ', error)
            }
        } else if (data.type === 'candidate') {
            try {
                peerConnection?.addIceCandidate(new RTCIceCandidate(data.candidate))
            } catch (error) {
                console.error('Unable to handle candidate: ', error)
            }
        } else {
            console.log('Unrecognized data received...')
        }
    }
    // *************************************************************************

    /* ----------------------Signaling---------------------- */

    const dataTransfer = (data) => {
        socket.emit('data_transfer', {
            user: user?.nickname,
            room_id: roomID,
            body: data,
        })
    }

    socket.on('data_transfer', (data) => {
        handleDataTransfer(data.body)
    })

    // Following a succesful join, establish a peer connection
    // and send an offer to the other user
    socket.on('ready', (data) => {
        initializePeerConnection()
        sendOffer()
    })

    socket.on('connect', (data) => {
        if (!data) {
            socket.emit('mutate', { room_id: roomID })
        } else {
            socket.emit('join', { user: user?.nickname, room_id: roomID })
        }
    })

    socket_message.on('connect', (data) => {
        if (!data) {
            socket_message.emit('mutate', { room_id: roomID })
        } else {
            socket_message.emit('join_msg', { user: user?.nickname, room_id: roomID })
        }
    })

    // Following a succesful join, establish a peer connection
    // and send an offer to the other user
    socket_message.on('mutate', (data) => {
        roomInfoMutate()
    })

    socket_message.on('pong', (data) => {
        console.log('pong', data)
    })

    // Following a succesful join, establish a peer connection
    // and send an offer to the other user
    socket.on('ready', (data) => {
        roomInfoMutate()
    })

    socket.on('disconnect', (data) => {
        setRemoteNickname(null)
        setIsRemoteVideoEnabled(false)
    })

    socket.on('leave', (data) => {
        if (data.user == user?.nickname) {
            handleLeave()
        }
    })

    const handleMutate = () => {
        if (socket_message.connected) {
            socket_message.emit('mutate', { room_id: roomID })
        } else {
            socket_message.connect()
        }
        socket_message.emit('mutate', { room_id: roomID })
        roomInfoMutate()
    }
    /* ----------------------Setup---------------------- */

    useEffect(() => {
        if (user && accessToken && roomInfo && roomInfo?.users.length == 1) {
            if (roomInfo?.users[0] !== user?.nickname) {
                message.info({
                    content: `Adding ${user?.nickname} to room...`,
                    key: 'join-room-info',
                })
                fetcher(accessToken, '/api/rooms/join_room', {
                    method: 'PUT',
                    body: JSON.stringify({ room_id: roomID, user_id: user?.nickname }),
                })
                    .then((res) => {
                        if (res.status != 200) {
                            message.error({
                                content: `Error ${res.status}: ${res.error}`,
                                key: 'join-room-info',
                            })
                        } else {
                            message.info({
                                content: 'Joined room successfull',
                                key: 'join-room-info',
                            })
                            roomInfoMutate()
                        }
                    })
                    .catch((err) => {
                        message.error({
                            content: `Error ${err.status}: ${err.error}`,
                            key: 'join-room-info',
                        })
                    })
            }
        }

        if (roomInfo && user && accessToken) {
            setUserRole(getType())
            setRemoteNickname(roomInfo?.users?.find((username) => username !== user?.nickname))
        }

        if (roomInfo && !roomInfo?.active && accessToken) {
            handleLeave()
        }
    }, [roomInfo, user, accessToken])

    useEffect(() => {
        if (browserName !== 'Chrome') {
            router.push('/')
        } else if (transcriptHistoryError?.status == 401) {
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
    }, [browserName, roomInfo, user, transcriptHistoryError, roomInfoError])

    // only want to start video init once all the page items have loaded -> user, roomInfo, roomId etc)
    useEffect(() => {
        if (user && !isLoading && roomID && loadPage) {
            initializeLocalVideo()

            return function cleanup() {
                peerConnection?.close()
            }
        }
    }, [isLoading, user, roomID, loadPage])

    if (user && !isLoading && isRoomIdFound && loadPage) {
        return (
            <ConfigProvider theme={theme}>
                <HeaderComponent user={user} roomID={roomID} handleLeave={handleLeave} />
                <div className={styles.callWrapper}>
                    <div style={{ width: '20%' }}>
                        {/* <Button
                            style={{ position: 'absolute', left: 10, top: 46 }}
                            onClick={() => appendMessage('Example message')}
                        >
                            Send Message (temporary)
                        </Button> */}
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
                                            autoPlay={true}
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
                                        {userRole === 'ASL' && isSendingASLRef.current && (
                                            <div style={{ marginTop: 25 }}>
                                                <Space>
                                                    <span style={{ fontSize: 25 }}>
                                                        Processing recorded ASL gestures
                                                    </span>
                                                    <Spin
                                                        indicator={
                                                            <LoadingOutlined
                                                                style={{
                                                                    margin: '5px 0 0 7px',
                                                                    fontSize: 30,
                                                                }}
                                                                spin
                                                            />
                                                        }
                                                    />
                                                </Space>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ConfigProvider>
        )
    } else if (isLoading || !isRoomIdFound) {
        return <LoadingComponent msg="Loading..." />
    } else if (!user && !isLoading && isRoomIdFound) {
        router.push(`/api/auth/login?returnTo=${encodeURIComponent(`/call-page/${roomID}`)}`)
    }
}

export const getServerSideProps = async (context) => {
    let accessToken = (await auth0.getSession(context.req, context.res)) || null
    if (accessToken != null) {
        accessToken = accessToken.idToken
    }
    return { props: { accessToken } }
}
