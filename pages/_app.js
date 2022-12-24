import React from 'react'
import Head from 'next/head'
import '../styles/globals.css'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }) {
  const route = useRouter()

  return (
    <UserProvider>
      <Head>
        <title>Intera</title>
        <meta
          name="description"
          content="Intera - An ASL/Speech to Text Faciliator \& Learning Platform"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component key={route.asPath} {...pageProps} />
    </UserProvider>
  )
}
