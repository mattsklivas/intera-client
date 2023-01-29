/* eslint-disable jsx-a11y/alt-text */
import { React, useState } from 'react'
import { Row, Col, Space, Button } from 'antd'
import { useRouter } from 'next/router'
import Image from 'next/image'
import logo from '../public/logo.svg'
import styles from '../styles/Header.module.css'

function Header(props) {
    const router = useRouter()
    const [isLoadingExit, setIsLoadingExit] = useState(false)
    const [isLoadingChange, setIsLoadingChange] = useState(false)
    const [isLoadingLogout, setIsLoadingLogout] = useState(false)

    return (
        <Row className={styles.header}>
            <Col flex={1} className={styles.headerCol1}>
                <div className={styles.headerUser}>
                    <span>User: </span>
                    <span>{props?.user?.nickname || 'N/A'}</span>
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
                        loading={isLoadingExit}
                        type="primary"
                        onClick={() => {
                            if (props?.socket) {
                                props.socket.disconnect({
                                    roomID: props?.roomID,
                                    user: props.user.nickname,
                                })
                            }
                            setIsLoadingExit(true)
                            router.push('/')
                        }}
                    >
                        {router.pathname.split('/')[1] === 'practice-module'
                            ? 'Exit Practice Module'
                            : 'Leave Meeting'}
                    </Button>
                ) : (
                    <div className={styles.headerLanding}>
                        <span className={styles.headerTitle}>Intera</span>
                        <Image className={styles.headerLogo} src={logo} height={35} width={35} />
                    </div>
                )}
            </Col>

            <Col flex={1} className={styles.headerCol3}>
                <Space size={10}>
                    {router.pathname === '/practice-module' ? (
                        <></>
                    ) : (
                        <Button
                            loading={isLoadingChange}
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
        </Row>
    )
}

export default Header
