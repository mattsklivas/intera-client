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

export default function Home({ accessToken }) {
    const router = useRouter()
    const [api, contextHolder] = notification.useNotification()
    const [isJoinMeetingRoomModalOpen, setIsJoinMeetingRoomModalOpen] = useState(false)
    const [isCreateMeetingRoomModalOpen, setIsCreateMeetingRoomModalOpen] = useState(false)
    const [canDisplayError, setCanDisplayError] = useState(true)
    const invalidRoomID =
        router.query['invalid_room'] ||
        router.asPath.match(new RegExp(`[&?]${'invalid_room'}=(.*)(&|$)`))

    const { user, error, isLoading } = useUser()

    // Get the history of transcripts
    const { data: transcriptHistory, error: transcriptHistoryError } = useTranscriptHistory(
        user ? user.nickname : '',
        accessToken
    )

    // Flag to check if hooks have completed
    const [initialized, setInitialized] = useState(false)

    // Wait for state variable initialization to show the page content
    useEffect(() => {
        // If JWT is expired, force a logout
        if (transcriptHistoryError?.status == 401) {
            router.push('/api/auth/logout')
        }

        // If an invalid room ID is supplied for the call page, return error
        if (invalidRoomID && canDisplayError) {
            api.error({
                message: `Error: Room ID '${invalidRoomID}' is deactivated or unrecognized.`,
            })
            setCanDisplayError(false)
        }

        if (!initialized && typeof transcriptHistory !== 'undefined') {
            setInitialized(true)
        }
    })

    if (user && initialized && !isLoading) {
        return (
            <div styles={{ width: '100%' }}>
                {contextHolder}
                <ConfigProvider theme={theme}>
                    <main className={styles.main}>
                        <Header user={user} />
                        <div className={styles.row}>
                            <div style={{ width: '30%' }}>
                                <HistoryComponent transcripts={transcriptHistory} user={user} />
                            </div>
                            <div className={styles.rightColumn}>
                                <Button
                                    className={styles.roomButton}
                                    onClick={() => setIsCreateMeetingRoomModalOpen(true)}
                                >
                                    <span style={{ display: 'inline-flex' }}>
                                        Create Meeting Room&nbsp;
                                        <MdCreate size={20} />
                                    </span>
                                </Button>
                                <Button
                                    className={styles.roomButton}
                                    onClick={() => setIsJoinMeetingRoomModalOpen(true)}
                                >
                                    <span style={{ display: 'inline-flex' }}>
                                        Join Meeting Room&nbsp;&nbsp;&nbsp;
                                        <MdSupervisorAccount size={20} />
                                    </span>
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
