import { React, useState } from 'react'
import styles from '../styles/History.module.css'
import CallTranscriptModal from '../components/modals/CallTranscriptModal'
import { Tabs, Row, Divider } from 'antd'
import { InboxOutlined } from '@ant-design/icons'

export default function HistoryComponent(props) {
    const [isCallTranscriptModalOpen, setIsCallTranscriptModalOpen] = useState(false)
    const [activeTranscript, setActiveTranscript] = useState(null)

    return (
        <>
            <div className={styles.historySidebar}>
                <h2 className={styles.historyTitle}>Call History</h2>
                {props.transcripts.length > 0 ? (
                    props.transcripts.map((transcript, index) => {
                        return (
                            <Tabs
                                key={index}
                                onClick={() => {
                                    setActiveTranscript(transcript)
                                    setIsCallTranscriptModalOpen(true)
                                }}
                            >
                                <p>
                                    <span>
                                        {transcript?.users.find(
                                            (user) => user !== props?.user?.nickname
                                        ) || 'N/A'}{' '}
                                    </span>
                                    <span style={{ color: '#8c8c8c' }}>
                                        (Date:{' '}
                                        {transcript?.date_created['$date'].split('T')[0] || 'N/A'})
                                    </span>
                                </p>
                            </Tabs>
                        )
                    })
                ) : (
                    <>
                        <Divider />
                        <Row type="flex" justify="center" align="middle" style={{ height: '50%' }}>
                            <div>
                                <InboxOutlined
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        fontSize: 30,
                                        width: '100%',
                                    }}
                                />
                                <div>No listings to show.</div>
                            </div>
                        </Row>
                    </>
                )}
            </div>
            {isCallTranscriptModalOpen && (
                <CallTranscriptModal
                    transcript={activeTranscript}
                    user={props.user}
                    hideCallTranscriptModal={() => {
                        setActiveTranscript(null)
                        setIsCallTranscriptModalOpen(false)
                    }}
                />
            )}
        </>
    )
}
