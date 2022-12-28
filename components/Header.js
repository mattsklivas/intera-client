import { React } from 'react'
import { Row, Col, Space, Button } from 'antd'
import { useRouter } from 'next/router'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

function Header(props) {
  const user = props.user
  const router = useRouter()
  console.log(router.pathname) // Gives the path which has called this component

  const practicModule = async () => {
    router.push('/PracticeModule')
  }

  const logOut = async () => {
    router.push('/api/auth/logout')
  }

  return (
    <div>
      <Row style={{ background: '#063970', marginBottom: '-5px' }}>
        <Col span={8}>
          <div className={styles.headerCol1}>
            <span className={styles.userHeader}>User: </span>
            <span className={styles.userName}>
              {props?.user?.nickname || 'N/A'}
            </span>
          </div>
        </Col>

        <Col span={8}>
          <Link href="/">
            <div className={styles.headerCol2}>
              <span className={styles.logoHeader}> Intera </span>
            </div>
          </Link>
        </Col>
        <Col span={8}>
          <div className={styles.headerCol3}>
            <Space size={15}>
              <Button
                type="primary"
                className={styles.buttonHeader1}
                onClick={practicModule}
              >
                Practice Module
              </Button>

              <Button
                type="primary"
                className={styles.buttonHeader2}
                onClick={logOut}
              >
                Logout
              </Button>
            </Space>
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default Header
