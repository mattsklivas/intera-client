import React from 'react'
import { Row, Spin } from 'antd'
import styles from '../styles/Home.module.css'

function Loading({ msg }) {
  return (
    <Row className={styles.loadingRow}>
      <Spin />
      <div className={styles.loadingDiv}>{msg}</div>
    </Row>
  )
}

export default Loading
