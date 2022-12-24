import { React, useEffect } from 'react'
import { useRouter } from 'next/router'
import auth0 from '../auth/auth0'
import Loading from '../components/Loading'

function Register({ accessT }) {
  const router = useRouter()
  const accessToken = accessT
  const data = JSON.stringify(router)
  const parseDataOne = data.split('{')
  const parseDataTwo = parseDataOne[2].split(',')
  const emailAndName = parseDataTwo[0].split('/')
  const userName = emailAndName[1].substring(5).replace('"', '')
  const userEmail = emailAndName[0].split(':')[1].replace('"', '')
  const stateParse = parseDataTwo[1].split(':')[1].replace('"', '').substring(0)
  const stateCode = stateParse.replace('"}', '')

  // Redirected to this url after registration process
  const redirectUrl = `https://dev-0vyfxcr9.us.auth0.com/continue?state=${stateCode}`
  useEffect(() => {
    // Register user here
    router.push(redirectUrl)
  })

  return <Loading msg="User registration in progress" />
}

export default Register

export const getServerSideProps = async (context) => {
  let accessT = (await auth0.getSession(context.req, context.res)) || null
  if (accessT != null) {
    accessT = accessT.idToken
  }

  return { props: { accessToken: accessT } }
}
