import styles from '../styles/Home.module.css'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/router'
import auth0 from '../auth/auth0'
import { React, useState } from 'react'
import Loading from '../components/Loading'
import Header from '../components/Header'
import { Button, Tabs } from 'antd'
import CallTranscriptModal from '../components/modals/CallTranscriptModal'
import JoinMeetingRoomModal from '../components/modals/JoinMeetingRoomModal'
import CreateMeetingRoomModal from '../components/modals/CreateMeetingRoomModal'

export default function Home({ accessT, pc }) {
  const [isCallTranscriptModalOpen, setIsCallTranscriptModalOpen] =
    useState(false)
  const [isJoinMeetingRoomModalOpen, setIsJoinMeetingRoomModalOpen] =
    useState(false)
  const [isCreateMeetingRoomModalOpen, setIsCreateMeetingRoomModalOpen] =
    useState(false)
  const router = useRouter()
  const { user, error, isLoading } = useUser()
  const accessToken = accessT
  const placeholder = pc

  const showCallTranscriptModal = () => {
    setIsCallTranscriptModalOpen(true)
  }

  const showJoinMeetingRoomModal = () => {
    setIsJoinMeetingRoomModalOpen(true)
  }

  const showCreateMeetinRoomModal = () => {
    setIsCreateMeetingRoomModalOpen(true)
  }

  if (user) {
    return (
      <>
        <Header user={user} />
        <main class={styles.main}>
          <div class={styles.row}>
            <div class={styles.leftColumn}>
              <>
                <h2>Call History</h2>
                {pc.map((user) => {
                  return (
                    <Tabs key={user.id} onClick={showCallTranscriptModal}>
                      <p>{user.name}</p>
                    </Tabs>
                  )
                })}
              </>
            </div>
            <div class={styles.rightColumn}>
              <Button
                className={styles.buttonCreateRoom}
                onClick={showCreateMeetinRoomModal}
              >
                Create Meeting Room
              </Button>
              <Button
                className={styles.buttonJoinRoom}
                onClick={showJoinMeetingRoomModal}
              >
                Join Meeting Room
              </Button>
            </div>
          </div>
        </main>
        {isCallTranscriptModalOpen && (
          <CallTranscriptModal
            demo={placeholder}
            hideCallTranscriptModal={() => {
              setIsCallTranscriptModalOpen(false)
            }}
          />
        )}
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
      </>
    )
  } else if (isLoading) {
    return <Loading msg="User Loading" />
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
