import React from 'react'
import { Row, Spin } from 'antd'

function Loading({ msg }) {
  return (
    <Row
      type="flex"
      justify="center"
      align="middle"
      style={{ minHeight: '100vh' }}
    >
      <Spin />
      <div style={{ fontSize: 'large', padding: '0 0 5px 15px' }}>{msg}</div>
    </Row>
  )
}

export default Loading
