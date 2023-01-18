import { React, useState, useEffect } from 'react'
import { ConfigProvider } from 'antd'
import { useRouter } from 'next/router'
import { useUser } from '@auth0/nextjs-auth0/client'
import auth0 from '../auth/auth0'
import HeaderComponent from '../components/HeaderComponent'
import VideoFeedComponent from '../components/VideoFeedComponent'
import { theme } from '../core/theme'
import HistoryComponent from '../components/HistoryComponent'
import useTranscriptHistory from '../hooks/useTranscriptHistory'
import styles from '../styles/CallPage.module.css'

export default function CallPage(accessT) {
    const router = useRouter()
    const { user, error, isLoading } = useUser()
    const { data: transcriptHistory } = useTranscriptHistory(user ? user.nickname : '', accessT)

    const [initialized, setInitialized] = useState(false)

    useEffect(() => {
        // commented due to CORS issue when accessing /api/rooms/get_all_rooms_by_user?user_id
        // if (!initialized && typeof transcriptHistory !== 'undefined') {
        //      setInitialized(true)
        //  }
    })

    // add initialized and is loading to if condition
    // add the real time chat component, history component used as a placholder
    if (user) {
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
    }
}

export const getServerSideProps = async (context) => {
    let accessT = (await auth0.getSession(context.req, context.res)) || null
    if (accessT != null) {
        accessT = accessT.idToken
    }
    return { props: { accessT } }
}
