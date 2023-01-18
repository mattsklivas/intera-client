import React, { useRef } from 'react'
// import styles from '../styles/VideoFeed.module.css'

export default function VideoFeed() {
    const userVideo = useRef(null)
    const guestVideo = useRef(null)

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1>Host</h1>
                    <div>
                        <video style={{ width: '98%', height: 'auto' }} controls src=""></video>
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h1>Guest</h1>
                    <div>
                        <video style={{ width: '98%', height: 'auto' }} controls src=""></video>
                    </div>
                </div>
            </div>
        </>
    )
}
