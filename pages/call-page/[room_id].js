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
import CallChatboxComponent from '../../components/CallChatboxComponent'
import useTranscriptHistory from '../../hooks/useTranscriptHistory'
import styles from '../../styles/CallPage.module.css'

export default function CallPage({ accessToken }) {
    const router = useRouter()
    const { user, error, isLoading } = useUser()
    const { data: transcriptHistory, error: transcriptHistoryError } = useTranscriptHistory(
        user ? user.nickname : '',
        accessToken
    )

    const roomID =
        router.query['room_id'] || router.asPath.match(new RegExp(`[&?]${'room_id'}=(.*)(&|$)`))

    const [initialized, setInitialized] = useState(false)

    useEffect(() => {
        // If JWT is expired, force a logout
        if (transcriptHistoryError?.status == 401) {
            router.push('/api/auth/logout')
        }

        if (!initialized && typeof transcriptHistory !== 'undefined') {
            // TODO: Fetch messages of active call if rejoining
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
                    <div style={{ width: '50%' }}>
                        <CallChatboxComponent
                            roomID={roomID}
                            transcript={transcriptHistory.length > 0 ? transcriptHistory[0] : []}
                            user={user}
                        />
                    </div>
                    <div style={{ width: '30%' }}>
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
