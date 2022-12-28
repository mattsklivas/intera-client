import { React } from 'react'
import { Row, Col, Space, Button } from 'antd'
import { useRouter } from 'next/router'

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
    <div>
      <Row style={{ background: '#063970', marginBottom: '-5px' }}>
        <Col span={12}>
          <div
            style={{
              width: 200,
              paddingTop: 7,
              paddingLeft: 10,
              paddingBottom: 7,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                fontweight: 400,
                color: '#e28743',
              }}
            >
              User:{' '}
            </span>
            <span
              style={{
                display: 'inline-block',
                paddingLeft: '5px',
                fontweight: 500,
                color: '#e28743',
                paddingTop: '6px',
              }}
            >
              {props?.user?.nickname || 'N/A'}
            </span>
          </div>
        </Col>

        <Col span={12}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'right',
              paddingRight: '15px',
              paddingTop: '5px',
              paddingBottom: '5px',
            }}
          >
            <Space size={15}>
              <Button
                type="primary"
                style={{
                  background: 'transparent',
                  borderColor: '#e28743',
                  color: '#e28743',
                  width: 70,
                  height: 30,
                }}
                onClick={exitButton}
              >
                Exit
              </Button>

              <Button
                type="primary"
                style={{
                  background: 'transparent',
                  borderColor: '#e28743',
                  color: '#e28743',
                  width: 70,
                  height: 30,
                }}
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

export default PracticeModuleHeader
