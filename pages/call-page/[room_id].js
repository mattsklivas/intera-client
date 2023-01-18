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
import useTranscriptHistory from '../../hooks/useTranscriptHistory'
import styles from '../../styles/CallPage.module.css'

export default function CallPage({ accessToken }) {
    const router = useRouter()
    const { user, error, isLoading } = useUser()
    const { data: transcriptHistory } = useTranscriptHistory(user ? user.nickname : '', accessToken)

    const roomID =
        router.query['room_id'] || router.asPath.match(new RegExp(`[&?]${'room_id'}=(.*)(&|$)`))

    const [initialized, setInitialized] = useState(false)

    useEffect(() => {
        if (!initialized && typeof transcriptHistory !== 'undefined') {
            setInitialized(true)
        }
    })

    // TODO: Add the real time chat component
    if (user && initialized && !isLoading) {
        return (
            <ConfigProvider theme={theme}>
                <HeaderComponent user={user} />
                <div class={styles.row}>
                    <div class={styles.columnHistory}>
                        <HistoryComponent transcripts={transcriptHistory} user={user} />
                    </div>
                    <div class={styles.columnChat}>
                        <HistoryComponent transcripts={transcriptHistory} user={user} />
                    </div>
                    <div class={styles.columnVideo}>
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
