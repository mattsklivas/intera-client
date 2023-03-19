import { useEffect } from 'react'
import { useRouter } from 'next/router'
import LoadingComponent from '../components/LoadingComponent'

export default function Redirect404() {
    const router = useRouter()

    useEffect(() => {
        router.replace('/')
    })

    return <LoadingComponent msg="Page not found. Redirecting to home page..." />
}
