import React, { useRef } from 'react'
// import styles from '../styles/VideoFeed.module.css'

export default function VideoFeedComponent(props) {
    const userVideo = useRef(null)
    const guestVideo = useRef(null)

    return (
        <div style={{ width: '-webkit-fill-available' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2>Host</h2>
                    <div>
                        <video style={{ width: '98%', height: 'auto' }} controls src=""></video>
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h2>Guest</h2>
                    <div>
                        <video style={{ width: '98%', height: 'auto' }} controls src=""></video>
                    </div>
                </div>
            </div>
        </div>
    )
}
