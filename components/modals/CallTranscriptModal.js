import { Modal, Typography } from 'antd'
import { React, useState } from 'react'

function CallTranscriptModal(props) {
    const [visible, setVisible] = useState(true)
    const placeholder = props.demo

    const handleOk = () => {
        setVisible(false)
        props.hideCallTranscriptModal()
    }

    return (
        <>
            <Modal
                title="Call Details: "
                open={visible}
                onOk={handleOk}
                okButtonProps={{ children: 'Custom OK' }}
                okText="Close"
                cancelButtonProps={{ style: { display: 'none' } }}
                width={650}
                bodyStyle={{ height: 250, overflowY: 'scroll' }}
            >
                <Typography>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Donec auctor diam a nisl placerat, in interdum lectus
                    mollis. Maecenas ornare turpis vel turpis luctus, in varius
                    leo condimentum. Fusce id consequat metus. Aliquam ultricies
                    lacus a elit iaculis, at hendrerit magna imperdiet. Morbi
                    finibus maximus mauris, ut efficitur ligula ornare at.
                    Nullam vestibulum efficitur enim, ut interdum justo blandit
                    vel. Maecenas vel rhoncus quam. Morbi ultricies aliquet
                    massa, id fermentum ligula tincidunt non. Cras elementum
                    ante a purus fermentum, at dapibus purus elementum.
                    Suspendisse vel porttitor odio. Donec malesuada mollis massa
                    a placerat. Cras dignissim, dui a blandit fermentum, nibh
                    turpis suscipit purus, in posuere mauris quam sed elit.
                    Morbi at purus porttitor, sollicitudin leo sit amet,
                    dignissim diam. Curabitur elementum dui dui, id suscipit
                    ipsum elementum eu. Duis iaculis tempus diam, in tincidunt
                    enim. Suspendisse potenti. Lorem ipsum dolor sit amet,
                    consectetur adipiscing elit. Donec auctor diam a nisl
                    placerat, in interdum lectus mollis. Maecenas ornare turpis
                    vel turpis luctus, in varius leo condimentum. Fusce id
                    consequat metus. Aliquam ultricies lacus a elit iaculis, at
                    hendrerit magna imperdiet. Morbi finibus maximus mauris, ut
                    efficitur ligula ornare at. Nullam vestibulum efficitur
                    enim, Lorem ipsum dolor sit amet, consectetur adipiscing
                    elit. Donec auctor diam a nisl placerat, in interdum lectus
                    mollis. Maecenas ornare turpis vel turpis luctus, in varius
                    leo condimentum. Fusce id consequat metus. Aliquam ultricies
                    lacus a elit iaculis, at hendrerit magna imperdiet. Morbi
                    finibus maximus mauris, ut efficitur ligula ornare at.
                    Nullam vestibulum efficitur enim, ut interdum justo blandit
                    vel. Maecenas vel rhoncus quam. Morbi ultricies aliquet
                    massa, id fermentum ligula tincidunt non. Cras elementum
                    ante a purus fermentum, at dapibus purus elementum.
                    Suspendisse vel porttitor odio. Donec malesuada mollis massa
                    a placerat. Cras dignissim, dui a blandit fermentum, nibh
                    turpis suscipit purus, in posuere mauris quam sed elit.
                    Morbi at purus porttitor, sollicitudin leo sit amet,
                    dignissim diam. Curabitur elementum dui dui, id suscipit
                    ipsum elementum eu. Duis iaculis tempus diam, in tincidunt
                    enim. Suspendisse potenti. Lorem ipsum dolor sit amet,
                    consectetur adipiscing elit. Donec auctor diam a nisl
                    placerat, in interdum lectus mollis. Maecenas ornare turpis
                    vel turpis luctus, in varius leo condimentum. Fusce id
                    consequat metus. Aliquam ultricies lacus a elit iaculis, at
                    hendrerit magna imperdiet. Morbi finibus maximus mauris, ut
                    efficitur ligula ornare at. Nullam vestibulum efficitur
                    enim,
                </Typography>
            </Modal>
        </>
    )
}

export default CallTranscriptModal
