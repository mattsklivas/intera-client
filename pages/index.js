import styles from '../styles/Home.module.css'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/router'
import auth0 from '../auth/auth0'
import { React, useState } from 'react'
import LoadingComponent from '../components/LoadingComponent'
import Header from '../components/HeaderComponent'
import { Button, ConfigProvider } from 'antd'
import JoinMeetingRoomModal from '../components/modals/JoinMeetingRoomModal'
import CreateMeetingRoomModal from '../components/modals/CreateMeetingRoomModal'
import HistoryComponent from '../components/HistoryComponent'
import { theme } from '../core/theme'

export default function Home({ accessT, pc }) {
    const router = useRouter()
    const [isJoinMeetingRoomModalOpen, setIsJoinMeetingRoomModalOpen] =
        useState(false)
    const [isCreateMeetingRoomModalOpen, setIsCreateMeetingRoomModalOpen] =
        useState(false)

    const { user, error, isLoading } = useUser()

    const accessToken = accessT
    const placeholder = pc

    if (user) {
        return (
            <div styles={{ width: '100%' }}>
                <ConfigProvider theme={theme}>
                    <main class={styles.main}>
                        <Header user={user} />
                        <div class={styles.row}>
                            <HistoryComponent transcripts={placeholder} />
                            <div class={styles.rightColumn}>
                                <Button
                                    className={styles.buttonCreateRoom}
                                    onClick={() =>
                                        setIsJoinMeetingRoomModalOpen(true)
                                    }
                                >
                                    Create Meeting Room
                                </Button>
                                <Button
                                    className={styles.buttonJoinRoom}
                                    onClick={() =>
                                        setIsJoinMeetingRoomModalOpen(true)
                                    }
                                >
                                    Join Meeting Room
                                </Button>
                            </div>
                        </div>
                    </main>
                    {isJoinMeetingRoomModalOpen && (
                        <JoinMeetingRoomModal
                            demo={placeholder}
                            hideJoinMeetingRoomModal={() => {
                                setIsJoinMeetingRoomModalOpen(false)
                            }}
                        />
                    )}
                    {isCreateMeetingRoomModalOpen && (
                        <CreateMeetingRoomModal
                            demo={placeholder}
                            hideCreateMeetingRoomModal={() => {
                                setIsCreateMeetingRoomModalOpen(false)
                            }}
                        />
                    )}
                </ConfigProvider>
            </div>
        )
    } else if (isLoading) {
        return <LoadingComponent msg="User Loading" />
    } else if (!user && !isLoading) {
        router.push('/api/auth/login')
    }
}
export const getServerSideProps = async (context) => {
    let accessT = (await auth0.getSession(context.req, context.res)) || null
    const response = await fetch('https://jsonplaceholder.typicode.com/users') // Dummy data
    const data = await response.json()
    if (accessT != null) {
        accessT = accessT.idToken
    }
    // Pass user data and dummy data
    return { props: { accessToken: accessT, pc: data } }
}
