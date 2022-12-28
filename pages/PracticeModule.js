import PracticeModuleHeader from '../components/praticeModuleHeader'
import styles from '../styles/Home.module.css'
import { useUser } from '@auth0/nextjs-auth0/client'

export default function PracticeModule() {
  const { user, error, isLoading } = useUser()
  return (
    <div>
      <PracticeModuleHeader user={user} />
      <main class={styles.main}>
        <p>Hello</p>
      </main>
    </div>
  )
}
