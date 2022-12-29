// import styles from '../styles/Home.module.css'
import HeaderComponent from '../components/HeaderComponent'

export default function Home() {
    return (
        <>
            <HeaderComponent />
            <main>
                <h1
                    style={{ backgroundSize: '200% auto', textAlign: 'center' }}
                >
                    Hello World
                </h1>
            </main>
        </>
    )
}
