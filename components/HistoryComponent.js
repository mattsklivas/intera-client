import { React, useState } from 'react'
import styles from '../styles/History.module.css'
import CallTranscriptModal from '../components/modals/CallTranscriptModal'
import { Tabs } from 'antd'

export default function HistoryComponent(props) {
    const [isCallTranscriptModalOpen, setIsCallTranscriptModalOpen] =
        useState(false)
    const [activeTranscript, setActiveTranscript] = useState(null)

    return (
        <>
            <div className={styles.historySidebar}>
                <h2 className={styles.historyTitle}>Call History</h2>
                {props.transcripts.map((transcript) => {
                    return (
                        <Tabs
                            key={transcript.room_id}
                            onClick={() => {
                                setActiveTranscript(transcript)
                                setIsCallTranscriptModalOpen(true)
                            }}
                        >
                            <p>
                                <span>{transcript.user || 'N/A'} </span>
                                <span style={{ color: '#8c8c8c' }}>
                                    (Date: {transcript.date || 'N/A'})
                                </span>
                            </p>
                        </Tabs>
                    )
                })}
            </div>
            {isCallTranscriptModalOpen && (
                <CallTranscriptModal
                    transcript={activeTranscript}
                    hideCallTranscriptModal={() => {
                        setActiveTranscript(null)
                        setIsCallTranscriptModalOpen(false)
                    }}
                />
            )}
        </>
    )
}
