/* eslint-disable jsx-a11y/alt-text */
import { React, useState } from 'react'
import { Row, Col, Space, Button } from 'antd'
import HelpModal from './modals/HelpModal.js'
import { useRouter } from 'next/router'
import Image from 'next/image'
import logo from '../public/logo.svg'
import styles from '../styles/Header.module.css'

const Header = ({ user, roomID, handleLeave }) => {
    const router = useRouter()
    const [isLoadingExit, setIsLoadingExit] = useState(false)
    const [isLoadingChange, setIsLoadingChange] = useState(false)
    const [isLoadingLogout, setIsLoadingLogout] = useState(false)
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)

    return (
        <Row className={styles.header}>
            <Col flex={1} className={styles.headerCol1}>
                <div style={{ width: '100%', margin: 'auto' }}>
                    <div className={styles.headerUser}>
                        <span>User: </span>
                        <span>{user?.nickname || 'N/A'}</span>
                        <Button
                            className={styles.headerHelp}
                            onClick={() => setIsHelpModalOpen(true)}
                        >
                            Help
                        </Button>
                    </div>
                </div>
            </Col>

            <Col
                flex={1}
                className={
                    router.pathname.split('/')[1] !== 'call-page'
                        ? styles.headerCol2
                        : styles.headerCol2Call
                }
            >
                {['practice-module', 'call-page'].includes(router.pathname.split('/')[1]) ? (
                    <Button
                        style={{ marginRight: '5vw' }}
                        loading={isLoadingExit}
                        type="primary"
                        onClick={() => handleLeave()}
                    >
                        {router.pathname.split('/')[1] === 'practice-module'
                            ? 'Exit Practice Module'
                            : 'Leave Meeting'}
                    </Button>
                ) : (
                    <div className={styles.headerLanding} style={{ marginRight: '5vw' }}>
                        <span className={styles.headerTitle}>Intera</span>
                        <Image
                            className={styles.headerLogo}
                            src={logo}
                            height={35}
                            width={35}
                            style={{
                                maxWidth: '100%',
                                height: 'auto',
                            }}
                        />
                    </div>
                )}
            </Col>

            <Col flex={1} className={styles.headerCol3}>
                <Space size={10}>
                    {/* {router.pathname === '/practice-module' ? (
                        <></>
                    ) : (
                        <Button
                            type="primary"
                            loading={isLoadingChange}
                            disabled={router.asPath.includes('/call-page')}
                            onClick={() => {
                                setIsLoadingChange(true)
                                router.push('/practice-module')
                            }}
                        >
                            Practice Module
                        </Button>
                    )} */}
                    {router.pathname === '/' && (
                        <Button
                            type="primary"
                            loading={isLoadingChange}
                            disabled={router.asPath.includes('/call-page')}
                            onClick={() => {
                                setIsLoadingChange(true)
                                router.push('/practice-module')
                            }}
                        >
                            Practice Module
                        </Button>
                    )}

                    <Button
                        loading={isLoadingLogout}
                        onClick={() => {
                            setIsLoadingLogout(true)
                            router.push('/api/auth/logout')
                        }}
                    >
                        Logout
                    </Button>
                </Space>
            </Col>
            {isHelpModalOpen && (
                <HelpModal
                    isHelpModalOpen={isHelpModalOpen}
                    setIsHelpModalOpen={setIsHelpModalOpen}
                    isPractice={router.asPath.includes('/practice-module')}
                    isCall={router.asPath.includes('/call-page')}
                />
            )}
        </Row>
    )
}

export default Header
