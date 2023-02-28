import React from 'react'
import { Row, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import styles from '../styles/Home.module.css'

const LoadingComponent = ({ msg }) => {
    return (
        <Row className={styles.loadingRow}>
            <Spin indicator={<LoadingOutlined spin />} />
            <div className={styles.loadingDiv}>{msg}</div>
        </Row>
    )
}

export default LoadingComponent
