import React, { useRef, useEffect, useState } from 'react'
import socketio from 'socket.io-client'
// import styles from '../styles/VideoFeed.module.css'

// in progress

export default function VideoFeedComponent(props) {
    const userVideo = useRef(null)
    const guestVideo = useRef(null)
    const [stream, setStream] = useState(null)
    const s_webrtc = socketio('http://localhost:5000', {
        cors: {
            origin: 'http://localhost:3000',
            credentials: true,
        },
        transports: ['websocket'],
    })

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ audio: true, video: true })
            .then((stream) => {
                setStream(stream)
                userVideo.current.srcObject = stream
                userVideo.current.play()
            })
            .catch(console.error)

        return () => {
            stopwebcam()
        }
    }, [])

    const stopwebcam = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop())
        }
    }

    return (
        <div style={{ width: '-webkit-fill-available' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2>Host</h2>
                    <div>
                        <video
                            autoPlay
                            muted
                            playsInline
                            ref={userVideo}
                            style={{ width: '80%', height: 'auto' }}
                        ></video>
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h2>Guest</h2>
                    <div>
                        <video style={{ width: '80%', height: 'auto' }} controls src=""></video>
                    </div>
                </div>
            </div>
        </div>
    )
}
