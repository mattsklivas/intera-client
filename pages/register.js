import { React, useEffect } from 'react'
import { useRouter } from 'next/router'
import auth0 from '../auth/auth0'
import LoadingComponent from '../components/LoadingComponent'

function Register({ accessT }) {
    const router = useRouter()
    const accessToken = accessT
    const data = JSON.stringify(router)
    const parseDataOne = data.split('{')
    const parseDataTwo = parseDataOne[2].split(',')
    const emailAndName = parseDataTwo[0].split('/')
    const userName = emailAndName[1].substring(5).replace('"', '')
    const userEmail = emailAndName[0].split(':')[1].replace('"', '')
    const stateParse = parseDataTwo[1]
        .split(':')[1]
        .replace('"', '')
        .substring(0)
    const stateCode = stateParse.replace('"}', '')

    // Redirect url after registration
    const redirectUrl = `${process.env.AUTH0_ISSUER_BASE_URL}/continue?state=${stateCode}`
    useEffect(() => {
        // Register user code
        router.push(redirectUrl)
    })

    return <LoadingComponent msg="User registration in progress" />
}

export default Register

export const getServerSideProps = async (context) => {
    let accessT = (await auth0.getSession(context.req, context.res)) || null
    if (accessT != null) {
        accessT = accessT.idToken
    }

    return { props: { accessToken: accessT } }
}
