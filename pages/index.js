import styles from '../styles/Home.module.css'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/router'
import auth0 from '../auth/auth0'
import Loading from '../components/Loading'
import Header from '../components/Header'

export default function Home({ accessT }) {
  const router = useRouter()
  const { user, error, isLoading } = useUser()
  const accessToken = accessT

  if (user) {
    return (
      <>
        <Header user={user} />
        <main className={styles.main}>
          <h1 style={{ backgroundSize: '100% auto', textAlign: 'center' }}>
            hello
          </h1>
        </main>
      </>
    )
  } else if (isLoading) {
    return <Loading msg="User Loading" />
  } else if (!user && !isLoading) {
    router.push('/api/auth/login')
  }
}
export const getServerSideProps = async (context) => {
  // Fetch data from external API
  let accessT = (await auth0.getSession(context.req, context.res)) || null
  if (accessT != null) {
    accessT = accessT.idToken
  }

  // Pass data to the page via props
  return { props: { accessToken: accessT } }
}
