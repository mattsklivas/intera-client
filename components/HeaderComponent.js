// Import React and Antd elements
import { React, useState, useEffect } from 'react'
import { Col, Row, Space, Button, ConfigProvider } from 'antd'
import { PlusCircleOutlined } from '@ant-design/icons'
import Link from 'next/link'

const theme = {
    token: {
        colorPrimary: '#008F8C',
    },
}

// Work in progress
function HeaderComponent(props) {
    const user = props.user
    const token = props.token
    const pageType = props.pageType

    // Flag to check if hook has completed
    const [initialized, setInitialized] = useState(false)

    // Wait to receive notifications before allowing the notifications dropdown to be opened
    useEffect(() => {
        if (!initialized && typeof notifications !== 'undefined') {
            // setNotificationDropdown(() => {
            //     if (notifications.notifications.length > 0) {
            //         return notifications.notifications.reduce((prev, notif, i) => {
            //             return prev.concat(
            //                 {
            //                     key: (i + 1).toString(),
            //                     label: (
            //                         <Link href={`/listing/${notif.user_from_listing_id}`}>
            //                             {getDropdownMessage(notif)}
            //                         </Link>
            //                     ),
            //                 }
            //             )
            //         }, [])
            //     } else {
            //         return [{
            //             key: '1',
            //             label: <div>No notifications to display</div>,
            //         }]
            //     }
            // })
            setInitialized(true)
        }
    })

    return (
        <ConfigProvider theme={theme}>
            <Row style={{ background: '#008F8C', marginBottom: '20px' }}>
                <Col span={8}>
                    <div style={{ width: 200, paddingTop: 7, paddingLeft: 10 }}>
                        <span
                            style={{
                                display: 'inline-block',
                                fontweight: 500,
                                color: 'white',
                            }}
                        >
                            User:{' '}
                        </span>
                        <span
                            style={{
                                display: 'inline-block',
                                paddingLeft: '5px',
                                fontweight: 500,
                                color: 'white',
                            }}
                        >
                            {props?.user?.nickname || 'N/A'}
                        </span>
                    </div>
                </Col>
                <Col span={8}>
                    <Link href="/">
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <span
                                style={{
                                    display: 'inline-block',
                                    color: 'white',
                                    paddingLeft: '6px',
                                    userSelect: 'none',
                                    fontSize: '25px',
                                    cursor: 'pointer',
                                }}
                            >
                                Swivel
                            </span>
                        </div>
                    </Link>
                </Col>
                <Col span={8}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'right',
                            paddingRight: '15px',
                            paddingTop: '8px',
                        }}
                    >
                        <Space size={15}>
                            <PlusCircleOutlined
                                style={{ fontSize: 20, color: 'white' }}
                            />
                            <Button>Test</Button>
                            {/* <Dropdown 
                                disabled={!initialized}  
                                placement="bottomRight"
                                overlay={
                                    <Menu
                                        items={notificationDropdown}
                                    />
                                }
                                onOpenChange={() => markNotificationsSeen()}
                            >
                                {initialized ? 
                                    <Badge 
                                        count={notifications.notifications.filter(item => !item.seen).length} 
                                        style={{ position: 'absolute', right: 0, top: 3 }} 
                                        size="small"
                                    >
                                        <NotificationOutlined style={{ fontSize: 20, color: 'white', cursor: 'pointer' }}/>
                                    </Badge>
                                    :
                                    <NotificationOutlined style={{ fontSize: 20, color: 'white', cursor: 'pointer' }}/>
                                }
                            </Dropdown> */}
                            {/* <Dropdown overlay={ProfileDropdown} placement="bottomRight">
                                <UserOutlined style={{ fontSize: 20, color: 'white', cursor: 'pointer' }}/>
                            </Dropdown> */}
                        </Space>
                    </div>
                </Col>
            </Row>
        </ConfigProvider>
    )
}

export default HeaderComponent
