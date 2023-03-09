import styles from '../styles/Home.module.css'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/router'
import auth0 from '../auth/auth0'
import { React, useState, useEffect } from 'react'
import LoadingComponent from '../components/LoadingComponent'
import Header from '../components/HeaderComponent'
import { Button, ConfigProvider, notification } from 'antd'
import JoinMeetingRoomModal from '../components/modals/JoinMeetingRoomModal'
import CreateMeetingRoomModal from '../components/modals/CreateMeetingRoomModal'
import HistoryComponent from '../components/HistoryComponent'
import { MdCreate, MdSupervisorAccount } from 'react-icons/md'
import useTranscriptHistory from '../hooks/useTranscriptHistory'
import { theme } from '../core/theme'
import { getQuery } from '../core/utils'

export default function Home({ accessToken }) {
    const router = useRouter()
    const { user, error, isLoading } = useUser()
    const [api, contextHolder] = notification.useNotification()
    const [isJoinMeetingRoomModalOpen, setIsJoinMeetingRoomModalOpen] = useState(false)
    const [isCreateMeetingRoomModalOpen, setIsCreateMeetingRoomModalOpen] = useState(false)
    const [canDisplayError, setCanDisplayError] = useState(true)

    // Call page redirects resulting from fatal errors
    const invalidRoomID = getQuery(router, 'invalid_room')
    const expiredRoomID = getQuery(router, 'expired_room')
    const fullRoomID = getQuery(router, 'full_room')

    // Get the error notification message
    let errorMsg = ''
    if (invalidRoomID) {
        // If an invalid room ID is supplied for the call page
        errorMsg = `Error: Room ID '${invalidRoomID}' is invalid.`
    } else if (expiredRoomID) {
        // If an expired room ID is supplied for the call page
        errorMsg = `Error: Room '${expiredRoomID}' has expired.`
    } else if (fullRoomID) {
        // If a room is full
        errorMsg = `Error: Room '${fullRoomID}' is full.`
    } else {
        errorMsg = 'An unknown error has occurred.'
    }

    // Get the history of transcripts
    const { data: transcriptHistory, error: transcriptHistoryError } = useTranscriptHistory(
        user ? user.nickname : '',
        accessToken
    )

    // Flag to check if hooks have completed
    const [initialized, setInitialized] = useState(false)

    // Wait for state variable initialization to show the page content
    useEffect(() => {
        const state = router.query.state
        if (state) {
            let id = state.split('/call-page/')[1]
            router.push(`/call-page/${id}`)
        }
        // If JWT is expired, force a logout
        if (transcriptHistoryError?.status == 401) {
            router.push('/api/auth/logout')
        }

        if (!initialized && typeof transcriptHistory !== 'undefined') {
            setInitialized(true)
        }
    })

    // Display error notification if redirected to index page due to an error
    useEffect(() => {
        // Display the error notification
        if (invalidRoomID != null || expiredRoomID != null || fullRoomID != null) {
            api.error({
                message: errorMsg,
                maxCount: 0,
            })
        }

        // Only display error once
        setCanDisplayError(false)
    }, [canDisplayError])

    if (user && initialized && !isLoading) {
        return (
            <>
                {contextHolder}
                <div className={styles.homeDiv}>
                    <ConfigProvider theme={theme}>
                        <main className={styles.main}>
                            <Header user={user} />
                            <div className={styles.row}>
                                <div className={styles.historyContainer}>
                                    <HistoryComponent transcripts={transcriptHistory} user={user} />
                                </div>
                            </div>
                            <div>
                                <div className={styles.rightColumn}>
                                    <Button
                                        className={styles.roomButton}
                                        onClick={() => setIsCreateMeetingRoomModalOpen(true)}
                                    >
                                        <span className={styles.roomText}>Create Meeting Room</span>
                                        <MdCreate size={17} />
                                    </Button>
                                    <Button
                                        className={styles.roomButton}
                                        onClick={() => setIsJoinMeetingRoomModalOpen(true)}
                                    >
                                        <span className={styles.roomText}>Join Meeting Room</span>
                                        <MdSupervisorAccount size={20} />
                                    </Button>
                                </div>
                            </div>
                        </main>
                        {isJoinMeetingRoomModalOpen && (
                            <JoinMeetingRoomModal
                                router={router}
                                accessToken={accessToken}
                                user={user}
                                hideJoinMeetingRoomModal={() => {
                                    setIsJoinMeetingRoomModalOpen(false)
                                }}
                            />
                        )}
                        {isCreateMeetingRoomModalOpen && (
                            <CreateMeetingRoomModal
                                router={router}
                                accessToken={accessToken}
                                user={user}
                                hideCreateMeetingRoomModal={() => {
                                    setIsCreateMeetingRoomModalOpen(false)
                                }}
                            />
                        )}
                    </ConfigProvider>
                </div>
            </>
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
