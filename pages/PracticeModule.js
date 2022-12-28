import PracticeModuleHeader from '../components/header/PraticeModuleHeader'
import { useUser } from '@auth0/nextjs-auth0/client'

export default function PracticeModule() {
  const { user, error, isLoading } = useUser()
  return (
    <div>
      <PracticeModuleHeader user={user} />
      <main>
        <p>Hello</p>
      </main>
    </div>
  )
}
