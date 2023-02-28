import React, { useRef, useEffect, useState } from 'react'
// import styles from '../styles/VideoFeed.module.css'

// in progress

const VideoFeedComponent = () => {
    const userVideo = useRef(null)
    const guestVideo = useRef(null)
    const [stream, setStream] = useState(null)

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ 
                audio: true, 
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            })
            .then((stream) => {
                setStream(stream)
                userVideo.current.srcObject = stream
                userVideo.current.play()
            })
            .catch(console.error)

        // TODO: unmount properly
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

export default VideoFeedComponent;