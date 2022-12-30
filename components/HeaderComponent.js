/* eslint-disable jsx-a11y/alt-text */
import { React } from 'react'
import { Row, Col, Space, Button } from 'antd'
import { useRouter } from 'next/router'
import Image from 'next/image'
import logo from '../public/logo.svg'
import styles from '../styles/Header.module.css'

function Header(props) {
    const router = useRouter()

    return (
        <Row className={styles.header}>
            <Col flex={1} className={styles.headerCol1}>
                <div className={styles.headerUser}>
                    <span>User: </span>
                    <span>{props?.user?.nickname || 'N/A'}</span>
                </div>
            </Col>

            <Col flex={1} className={styles.headerCol2}>
                {['practice-module', 'call'].includes(
                    router.pathname.split('/')[1]
                ) ? (
                    <Button type="primary" onClick={() => router.push('/')}>
                        {router.pathname.split('/')[1] === 'practice-module'
                            ? 'Exit Practice Module'
                            : 'Leave Meeting'}
                    </Button>
                ) : (
                    <div className={styles.headerLanding}>
                        <span className={styles.headerTitle}>Intera</span>
                        <Image
                            className={styles.headerLogo}
                            src={logo}
                            height={35}
                            width={35}
                        />
                    </div>
                )}
            </Col>

            <Col flex={1} className={styles.headerCol3}>
                <Space size={10}>
                    {router.pathname === '/practice-module' ? (
                        <></>
                    ) : (
                        <Button onClick={() => router.push('/practice-module')}>
                            Practice Module
                        </Button>
                    )}

                    <Button onClick={() => router.push('/api/auth/logout')}>
                        Logout
                    </Button>
                </Space>
            </Col>
        </Row>
    )
}

export default Header
