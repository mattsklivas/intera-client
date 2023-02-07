import { React, useState } from 'react'
import styles from '../styles/History.module.css'
import CallTranscriptModal from '../components/modals/CallTranscriptModal'
import { Row, Divider, List } from 'antd'
import { InboxOutlined } from '@ant-design/icons'

export default function HistoryComponent(props) {
    const [isCallTranscriptModalOpen, setIsCallTranscriptModalOpen] = useState(false)
    const [activeTranscript, setActiveTranscript] = useState(null)

    const getUser = (transcript) => {
        const otherUser = transcript?.users.find((user) => user !== props?.user?.nickname)
        if (otherUser) {
            return <span className={styles.tabText}>{otherUser}</span>
        } else {
            return (
                <span className={styles.tabText} style={{ fontStyle: 'italic' }}>
                    Unattended
                </span>
            )
        }
    }

    return (
        <>
            <div
                className={styles.historySidebar}
                style={{ width: '-webkit-fill-available', height: '-webkit-fill-available' }}
            >
                <div className={styles.historyTitle}>Call History</div>
                <div style={{ height: '80vh', overflowY: 'scroll' }}>
                    {props.transcripts.length > 0 ? (
                        <List
                            dataSource={props.transcripts}
                            renderItem={(item) =>
                                item.messages.length > 0 && (
                                    <List.Item
                                        style={{ width: '100%', justifyContent: 'center' }}
                                        key={item._id['$oid']}
                                        onClick={() => {
                                            setActiveTranscript(item)
                                            setIsCallTranscriptModalOpen(true)
                                        }}
                                    >
                                        <div style={{ cursor: 'pointer' }}>
                                            <p
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <span className={styles.tabText}>
                                                    {getUser(item)}
                                                </span>
                                                <span
                                                    className={styles.tabText}
                                                    style={{ color: '#8c8c8c' }}
                                                >
                                                    (Date:{' '}
                                                    {item?.date_created['$date'].split('T')[0] ||
                                                        'N/A'}
                                                    )
                                                </span>
                                            </p>
                                        </div>
                                    </List.Item>
                                )
                            }
                        />
                    ) : (
                        <>
                            <Divider />
                            <Row
                                type="flex"
                                justify="center"
                                align="middle"
                                style={{ height: '50%' }}
                            >
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
