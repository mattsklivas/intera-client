import styles from '../styles/Home.module.css'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/router'
import auth0 from '../auth/auth0'
import { React, useState, useEffect } from 'react'
import LoadingComponent from '../components/LoadingComponent'
import Header from '../components/HeaderComponent'
import { Button, ConfigProvider } from 'antd'
import JoinMeetingRoomModal from '../components/modals/JoinMeetingRoomModal'
import CreateMeetingRoomModal from '../components/modals/CreateMeetingRoomModal'
import HistoryComponent from '../components/HistoryComponent'
import { MdCreate, MdSupervisorAccount } from 'react-icons/md'
import useTranscriptHistory from '../hooks/useTranscriptHistory'
import { theme } from '../core/theme'

export default function Home({ accessToken }) {
    const router = useRouter()
    const [isJoinMeetingRoomModalOpen, setIsJoinMeetingRoomModalOpen] = useState(false)
    const [isCreateMeetingRoomModalOpen, setIsCreateMeetingRoomModalOpen] = useState(false)

    const { user, error, isLoading } = useUser()

    // Get the history of transcripts
    const { data: transcriptHistory } = useTranscriptHistory(user ? user.nickname : '', accessToken)
    console.log('transcripts', transcriptHistory)

    // Flag to check if hooks have completed
    const [initialized, setInitialized] = useState(false)

    // Wait for state variable initialization to show the page content
    useEffect(() => {
        if (!initialized && typeof transcriptHistory !== 'undefined') {
            setInitialized(true)
        }
    })

    if (user && initialized && !isLoading) {
        return (
            <div styles={{ width: '100%' }}>
                <ConfigProvider theme={theme}>
                    <main class={styles.main}>
                        <Header user={user} />
                        <div class={styles.row}>
                            <HistoryComponent transcripts={transcriptHistory} user={user} />
                            <div class={styles.rightColumn}>
                                <Button
                                    className={styles.buttonCreateRoom}
                                    onClick={() => setIsCreateMeetingRoomModalOpen(true)}
                                >
                                    <span style={{ display: 'inline-flex' }}>
                                        Create Meeting Room&nbsp;
                                        <MdCreate size={20} />
                                    </span>
                                </Button>
                                <Button
                                    className={styles.buttonJoinRoom}
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
