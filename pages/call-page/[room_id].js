import { React, useState, useEffect } from 'react'
import { ConfigProvider } from 'antd'
import { useRouter } from 'next/router'
import { useUser } from '@auth0/nextjs-auth0/client'
import auth0 from '../../auth/auth0'
import LoadingComponent from '../../components/LoadingComponent'
import HeaderComponent from '../../components/HeaderComponent'
import VideoFeedComponent from '../../components/VideoFeedComponent'
import { theme } from '../../core/theme'
import HistoryComponent from '../../components/HistoryComponent'
import ChatboxComponent from '../../components/ChatboxComponent'
import useTranscriptHistory from '../../hooks/useTranscriptHistory'
import useRoomInfo from '../../hooks/useRoomInfo'
import styles from '../../styles/CallPage.module.css'

export default function CallPage({ accessToken }) {
    const router = useRouter()
    const roomID =
        router.query['room_id'] || router.asPath.match(new RegExp(`[&?]${'room_id'}=(.*)(&|$)`))
    const { user, error, isLoading } = useUser()
    const { data: transcriptHistory, error: transcriptHistoryError } = useTranscriptHistory(
        user ? user.nickname : '',
        accessToken
    )
    const { data: roomInfo, error: roomInfoError } = useRoomInfo(roomID || '', accessToken)
    const [initialized, setInitialized] = useState(false)
    console.log(transcriptHistory, roomInfo)

    useEffect(() => {
        // If JWT is expired, force a logout
        if (transcriptHistoryError?.status == 401) {
            router.push('/api/auth/logout')
        } else if (roomInfoError?.status == 404) {
            // If room ID is invalid, redirect to home page
            router.push(`/?invalid_room=${roomID}`)
        }

        if (
            !initialized &&
            typeof transcriptHistory !== 'undefined' &&
            typeof roomInfo !== 'undefined'
        ) {
            // TODO: Fetch messages of active call if rejoining
            // TODO: Fetch state of room and confirm whether it exists/is active
            // TODO: Fetch role of user
            // TODO: unregister room if host leaves
            // Fetch room details (ie user type)
            setInitialized(true)
        }
    })

    if (user && initialized && !isLoading) {
        return (
            <ConfigProvider theme={theme}>
                <HeaderComponent user={user} />
                <div className={styles.callWrapper}>
                    <div style={{ width: '20%' }}>
                        <HistoryComponent transcripts={transcriptHistory} user={user} />
                    </div>
                    <div style={{ width: '40%' }}>
                        <ChatboxComponent
                            context={'call'}
                            roomID={roomID}
                            transcript={transcriptHistory.length > 0 ? transcriptHistory[0] : []}
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
