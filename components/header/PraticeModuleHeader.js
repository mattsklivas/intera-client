import { React } from 'react'
import { Row, Col, Space, Button, ConfigProvider } from 'antd'
import { useRouter } from 'next/router'
import styles from '../../styles/Home.module.css'

const theme = { token: { colorPrimary: '#008F8C' } }

function PracticeModuleHeader(props) {
    const user = props.user
    const router = useRouter()
    console.log(router.pathname) // Gives the path which has called this component

    const exitButton = async () => {
        router.push('/')
    }

    const logOut = async () => {
        router.push('/api/auth/logout')
    }

    return (
        <ConfigProvider theme={theme}>
            <div>
                <Row style={{ background: '#063970', marginBottom: '-5px' }}>
                    <Col span={12}>
                        <div className={styles.headerCol1}>
                            <span className={styles.userHeader}>User: </span>
                            <span className={styles.userName}>
                                {props?.user?.nickname || 'N/A'}
                            </span>
                        </div>
                    </Col>

                    <Col span={12}>
                        <div className={styles.headerCol3}>
                            <Space size={15}>
                                <Button
                                    type="primary"
                                    className={styles.buttonExit}
                                    onClick={exitButton}
                                >
                                    Exit
                                </Button>

                                <Button
                                    type="primary"
                                    className={styles.buttonLogout}
                                    onClick={logOut}
                                >
                                    Logout
                                </Button>
                            </Space>
                        </div>
                    </Col>
                </Row>
            </div>
        </ConfigProvider>
    )
}

export default PracticeModuleHeader
